require('dotenv-extended').load();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io').listen(server);
const dgram = require('dgram');
// const mongoose = require('mongoose');
const cors = require('cors');
app.use(cors());

const routes = require('./routes');
const models = require('./models');

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);

// mongoose.connect(process.env.MONGO_URL, (err) => {
//   if (err) {
//     console.log(err);
//   }
// });

/* COSMOS SOCKET SETUP */
const cosmosSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

const COSMOS_PORT = 10020;
const COSMOS_ADDR ="225.1.1.1"
cosmosSocket.bind(COSMOS_PORT);
cosmosSocket.on('listening', () => {
  cosmosSocket.addMembership(COSMOS_ADDR);
  const address = cosmosSocket.address();
  console.log('UDP Server listening on ' + address.address + ":" + address.port);
});


let obj = {};
let agentListObj = {};
let imuOmega = {};
let imuIndex = 0;
let sentImuIndex = 0;
cosmosSocket.on('message', function(message) {
  obj = message.slice(3,message.length-1);
  let json_str = obj.toString('ascii');
  json_str = json_str.replace(/}{/g, ',')
  obj = JSON.parse(json_str);
  // console.log(obj)
  io.emit('agent subscribe '+obj.agent_proc, obj);
  if (obj.agent_node === 'me213ao') {

    if (obj.device_gps_geods_000) {
      let latitude = obj.device_gps_geods_000.lat;
      let longitude = obj.device_gps_geods_000.lon;
      let altitude = obj.device_gps_geods_000.h;
      let acceleration_x, acceleration_y, acceleration_z;

      if (obj.device_imu_accel_000) {
        acceleration_x = obj.device_imu_accel_000[0];
        acceleration_y = obj.device_imu_accel_000[1];
        acceleration_z = obj.device_imu_accel_000[2];
      }

      io.emit('balloon path', {
        satellite: 'me213ao',
        latitude,
        longitude,
        altitude,
        acceleration: [acceleration_x, acceleration_y, acceleration_z]
      });

      // new models.Path({
      //   satellite: 'me213ao',
      //   latitude,
      //   longitude,
      //   altitude,
      // }).save(err => {
      //  if (err) {
      //    console.log(err);
      //  }
      //});
    }
  }

  if (obj.agent_node === 'cubesat1') { // Check if node is the cubesat
    if (obj.node_loc_pos_eci) { // If the position is defined

      // Convert x, y, z coordinates from meters to kilometers
      let satellite_position_x = obj.node_loc_pos_eci.pos[0] / 1000;
      let satellite_position_y = obj.node_loc_pos_eci.pos[1] / 1000;
      let satellite_position_z = obj.node_loc_pos_eci.pos[2] / 1000;

      // console.log(satellite_position_x,
      //   satellite_position_y,
      //   satellite_position_z);

      // Emit satellite position to client
      io.emit('satellite orbit', {
        satellite: 'cubesat1',
        x: satellite_position_x,
        y: satellite_position_y,
        z: satellite_position_z,
      });

      new models.Orbit({
        satellite: 'cubesat1',
        x: satellite_position_x,
        y: satellite_position_y,
        z: satellite_position_z,
      }).save((err) => {
        if (err) {
          console.log(err);
        }
      });
    }

    // If quaternions are defined
    if (obj.node_loc_att_icrf) {
      // Get w, x, y, z components of quaternions
      let satellite_orientation_w = obj.node_loc_att_icrf.pos.w;
      let satellite_orientation_x = obj.node_loc_att_icrf.pos.d.x;
      let satellite_orientation_y = obj.node_loc_att_icrf.pos.d.y;
      let satellite_orientation_z = obj.node_loc_att_icrf.pos.d.z;

      // console.log(satellite_orientation_w);
      // console.log(satellite_orientation_x);
      // console.log(satellite_orientation_y);
      // console.log(satellite_orientation_z);

      // Emit data to client
      io.emit('satellite attitude', {
        satellite: 'cubesat1',
        x: satellite_orientation_x,
        y: satellite_orientation_y,
        z: satellite_orientation_z,
        w: satellite_orientation_w,
      });

      new models.Attitude({
        satellite: 'cubesat1',
        x: satellite_orientation_x,
        y: satellite_orientation_y,
        z: satellite_orientation_z,
        w: satellite_orientation_w,
      }).save((err) => {
        if (err) {
          console.log(err);
        }
      });;

    }

    // 10.42.0.126
  }

  agent_utc = obj.agent_utc;

  if (message.type === 'utf8') {
    console.log('Received Message: ' + message.utf8Data);
  } else if (message.type === 'binary') {
    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
  }

  // Maintain the list of agents
  if (!(obj.agent_proc in agentListObj)) {
    agentListObj[obj.agent_proc] = [obj.agent_utc, ' '+obj.agent_node, ' '+obj.agent_addr, ' '+obj.agent_port, ' '+obj.agent_bsz];

    /* insert agent in agent_list mongodb*/
    // MongoClient.connect(mongo_url_cosmos,{ useNewUrlParser: true }, function(err, db) {
    //   var dbo = db.db("cosmos");
    //   var agent_list = dbo.collection('agent_list');
    //   agent_list.insertOne(
    //     {
    //       agent_proc:obj.agent_proc,
    //       agent_utc: obj.agent_utc,
    //       agent_node: obj.agent_node,
    //       agent_addr:obj.agent_addr,
    //       agent_port:obj.agent_port,
    //       agent_bsz:obj.agent_bsz
    //     },
    //     function (err, r){
    //       io.emit('agent update list', agentListObj);
    //       db.close();
    //     }
    //   );
    //
    //
    // });
  } else {
    // Update the time stamp
    agentListObj[obj.agent_proc][0] = obj.agent_utc;
    /* update agent in mongodb
    */
    // MongoClient.connect(mongo_url_cosmos,{ useNewUrlParser: true }, function(err, db) {
    //   var dbo = db.db("cosmos");
    //   var agent_list = dbo.collection('agent_list');
    //   agent_list.updateOne(
    //     { agent_proc:obj.agent_proc },
    //     {$set:{ agent_utc: obj.agent_utc }},
    //     {upsert:true},
    //     function (err, r){
    //       io.emit('agent update list', agentListObj);
    //       db.close();
    //     }
    //   );
    // });
  }

  // Collect the IMU Omega data from the ADCS agent
  if (obj.agent_proc === 'adcs') {
    imuOmega[imuIndex] = obj.device_imu_omega_000;
    imuIndex++;
  }

});
/* MONGO SETUP */
// var cosmosdb = require('./cosmosdb'); // includes cosmosdb.js
var MongoClient = require('mongodb').MongoClient
      , assert = require('assert');
var mongo_url_cosmos = process.env.MONGO_URL;

setInterval(function(){

    io.emit('agent update list', agentListObj);
}, 5000);
const port_io = 3001;
// const hostname_io = '192.168.150.23';
const hostname_env = process.env.SATELLITE_IP;
server.listen(port_io, hostname_env, () => {
  console.log(`Server running at http://${hostname_env}:${port_io}/`);
});
// server.listen(3001, function() {
// 	console.log('Server listening on port:', server.port);
// });

// cosmosSocket.bind(10020, process.env.SATELLITE_IP);

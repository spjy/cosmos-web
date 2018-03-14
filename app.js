require('dotenv-extended').load();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io').listen(server);
const dgram = require('dgram');
const mongoose = require('mongoose');

const routes = require('./routes');
const models = require('./models');

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);

mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) {
    console.log(err);
  }
});

io.on('connection', function (socket) {
  socket.on('satellite orbit history', async (date) => {

    console.log(date.dateFrom, date.dateTo, 'i got activated k');
    let orbit;

    try {
      orbit = await models.Orbit.find({
        satellite: 'cubesat1'
      }).sort({ createAt: -1 }).limit(50);

      socket.emit('satellite replay', orbit);
      //console.log(orbit);

    } catch (error) {
      orbit = error;

      socket.emit('satellite replay', orbit);
    }
	});

  socket.on('satellite orbit', (data) => {
    io.emit('satellite orbit', data);
  });
});

// io.on('satellite orbit history', async (socket) => {
//   console.log('i got activated k');
//
// })

const cosmosSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

cosmosSocket.on('listening', () => {
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

  //console.log(obj)
  //console.log(obj.agent_utc)

  if (obj.agent_node === 'cubesat1') { // Check if node is the cubesat
    if (obj.node_loc_pos_eci.pos) { // If the position is defined
      // Convert x, y, z coordinates from meters to kilometers
      let satellite_position_x = obj.node_loc_pos_eci.pos[0] / 1000;
      let satellite_position_y = obj.node_loc_pos_eci.pos[1] / 1000;
      let satellite_position_z = obj.node_loc_pos_eci.pos[2] / 1000;

      console.log(satellite_position_x,
        satellite_position_y,
        satellite_position_z);

      // Emit satellite position to client
      io.emit('satellite position', {
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
      io.emit('satellite orientation', {
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
  } else {
    // Update the time stamp
    agentListObj[obj.agent_proc][0] = obj.agent_utc;
  }

  // Collect the IMU Omega data from the ADCS agent
  if (obj.agent_proc === 'adcs') {
    imuOmega[imuIndex] = obj.device_imu_omega_000;
    imuIndex++;
  }

});

// app.use(function (req, res, next) {
//
//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3003');
//
//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);
//
//   // Pass to next layer of middleware
//   next();
// });

server.listen(3001, function() {
	console.log('Server listening on port:s 3001');
});

cosmosSocket.bind(10020, process.env.SATELLITE_IP);

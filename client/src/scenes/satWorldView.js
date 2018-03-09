import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const satWorldView = () => {

  /*
  /
  /  STANDARD BABYLON INITIALIZATIONS
  /
  */

  // get the canvas DOM element
  const canvas = document.getElementById('satWorldView');

  // load the 3D engine
  const engine = new BABYLON.Engine(canvas, true);

  // createScene function that creates and return the scene
  const createScene = function() {
    // create a basic BJS Scene object
    const scene = new BABYLON.Scene(engine);

    const assetsManager = new BABYLON.AssetsManager(scene);

    const makeTextPlane = function(text, color, size) {
      const dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 24px Arial", color, "transparent", true);
      const plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
      plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    };

    /*
    /
    /  LIGHTS
    /
    */

    // create a basic light, aiming 0,10,0 - meaning, to the sky
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 10, 0), scene);
    const light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, -10, 0), scene);

    /*
    /
    /  CAMERA
    /
    */

    // Create arc rotate camera at initial arc pi/4 pi/4 at radius 20 centered around (0,0,0)
    const camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", Math.PI / 4, Math.PI / 4, 15000, new BABYLON.Vector3(0, -1, 0), scene);

    // Extend camera view
    camera.maxX = 100000;
    camera.maxY = 100000;
    camera.maxZ = 100000;

    // Attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Camera zoom speed
    camera.wheelPrecision = 0.1;

    // $('#degreeOfView').submit((e) => {    // io.on('connection', function(socket)
    // // {
    // //   console.log('help');
    // //   socket.emit('satellite position', {
    // //     x: obj.node_loc_pos_eci.pos[0] / 1000,
    // //     y: obj.node_loc_pos_eci.pos[1] / 1000,
    // //     z: obj.node_loc_pos_eci.pos[2] / 1000
    // //   });
    // // });
    //   e.preventDefault();
    //   degreeOfView = $('#degree').val() * (Math.PI / 180);
    //   console.log(degreeOfView);
    // });
    //
    // // Upon submitting position, set the camera to go there
    // $('#positionOfView').submit((e) => {
    //   e.preventDefault();
    //   positionOfView = $('#position').val().trim().split(',');
    //   console.log(positionOfView);
    //   camera.setPosition( new BABYLON.Vector3(Number(positionOfView[0]), Number(positionOfView[1]), Number(positionOfView[2])));
    // });

    /*
    /
    /  WORLD AXES, ARROWS & TEXT
    /
    */

    // Reusable settings for the axes / arrows
    const worldAxisSettings = {
      height: 20000,
      diameterTop: 100,
      diameterBottom: 100,
      tessellation: 100,
      position: 10000
    }

    const worldArrowSettings = {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
    }

    // cylindrical x axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const worldAxisX = BABYLON.MeshBuilder.CreateCylinder("worldAxisX", {
      height: worldAxisSettings.height,
      diameterTop: worldAxisSettings.diameterTop,
      diameterBottom: worldAxisSettings.diameterBottom,
      tessellation: worldAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
    }, scene);
    worldAxisX.position = new BABYLON.Vector3(worldAxisSettings.position, 0, 0);
    worldAxisX.rotation = new BABYLON.Vector3(0, 0, (3 * Math.PI) / 2);

    // cylindrical y axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const worldAxisY = BABYLON.MeshBuilder.CreateCylinder("worldAxisY", {
      height: worldAxisSettings.height,
      diameterTop: worldAxisSettings.diameterTop,
      diameterBottom: worldAxisSettings.diameterBottom,
      tessellation: worldAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
    }, scene);
    worldAxisY.position = new BABYLON.Vector3(0, worldAxisSettings.position, 0);
    worldAxisY.rotation = new BABYLON.Vector3(0, (3 * Math.PI) / 2, 0);

    // cylindrical z axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const worldAxisZ = BABYLON.MeshBuilder.CreateCylinder("worldAxisZ", {
      height: worldAxisSettings.height,
      diameterTop: worldAxisSettings.diameterTop,
      diameterBottom: worldAxisSettings.diameterBottom,
      tessellation: worldAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
    }, scene);
    worldAxisZ.position = new BABYLON.Vector3(0, 0, worldAxisSettings.position);
    worldAxisZ.rotation = new BABYLON.Vector3((3 * Math.PI) / 2, 0, 0);

    // create cylinder for x axis at (1,0,0)
    const worldArrowX = BABYLON.MeshBuilder.CreateCylinder("worldArrowX", {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
      faceColors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
    }, scene);
    worldArrowX.position = new BABYLON.Vector3(1, 0, 0);
    worldArrowX.rotation = new BABYLON.Vector3(0, 0, (3 * Math.PI) / 2);

    // create arrow for y axis at (0,1,0)
    const worldArrowY = BABYLON.MeshBuilder.CreateCylinder("worldArrowY", {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
      faceColors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
    }, scene);
    worldArrowY.position = new BABYLON.Vector3(0, 1, 0);

    // create arrow for x axis at (0,0,1)
    const worldArrowZ = BABYLON.MeshBuilder.CreateCylinder("worldArrowZ", {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
      faceColors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
    }, scene);
    worldArrowZ.position = new BABYLON.Vector3(0, 0, 1);
    worldArrowZ.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

    const XCoordText = makeTextPlane("X", "red", 1);
    XCoordText.position = new BABYLON.Vector3(1.1, 0, -0.1);

    const YCoordText = makeTextPlane("Y", "green", 1);
    YCoordText.position = new BABYLON.Vector3(0.05, 0.9, 0);

    const ZCoordText = makeTextPlane("Z", "blue", 1);
    ZCoordText.position = new BABYLON.Vector3(0, 0.05, 0.9);

    /*
    /
    /  SATELLITE AXES & ARROWS
    /
    */

    // Reusable satellite axis options
    const satAxisSettings = {
      height: 1000,
      diameterTop: 25,
      diameterBottom: 25,
      tessellation: 10,
    };

    let satPos = [6380, 0, 0];
    //cylindrical z axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const satAxisX = BABYLON.MeshBuilder.CreateCylinder("satAxisX", {
      height: satAxisSettings.height,
      diameterTop: satAxisSettings.diameterTop,
      diameterBottom: satAxisSettings.diameterBottom,
      tessellation: satAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
    }, scene);
    satAxisX.position = new BABYLON.Vector3(satPos[0], satPos[1], satPos[2]);
    satAxisX.rotation = new BABYLON.Vector3(0, 0, (3 * Math.PI) / 2);

    // cylindrical z axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const satAxisY = BABYLON.MeshBuilder.CreateCylinder("satAxisY", {
      height: satAxisSettings.height,
      diameterTop: satAxisSettings.diameterTop,
      diameterBottom: satAxisSettings.diameterBottom,
      tessellation: satAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
    }, scene);
    satAxisY.position = new BABYLON.Vector3(satPos[0], satPos[1], satPos[2]);
    satAxisY.rotation = new BABYLON.Vector3(0, (3 * Math.PI) / 2, 0);

    // cylindrical z axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const satAxisZ = BABYLON.MeshBuilder.CreateCylinder("satAxisZ", {
      height: satAxisSettings.height,
      diameterTop: satAxisSettings.diameterTop,
      diameterBottom: satAxisSettings.diameterBottom,
      tessellation: satAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
    }, scene);
    satAxisZ.position = new BABYLON.Vector3(satPos[0], satPos[1], satPos[2]);
    satAxisZ.rotation = new BABYLON.Vector3((3 * Math.PI) / 2, 0, 0);

    /*
    /
    /  SATELLITE IMPORTS & OPTIONS
    /
    */

    // load in satellite obj file
    BABYLON.SceneLoader.Load("/obj/", "cubesat.obj", engine, function(scene) { });

    const CUBESAT = assetsManager.addMeshTask("CUBESAT", "", "/obj/", "cubesat.obj");

    // Default satellite position

    BABYLON.SceneLoader.ImportMesh("", "obj/", "cubesat.obj", scene, function(meshes) {
      meshes[0].scaling = new BABYLON.Vector3(1000, 1000, 1000); // Make satellite bigger
      meshes[0].position = new BABYLON.Vector3(6380, 0, 0);
      // meshes[0].scaling = new BABYLON.Vector3(1000, 1000, 1000);
      // let m = 0, n = 0;
      //
      // setInterval(() => {
      //   //meshes[0].position = new BABYLON.Vector3(6380 - m, 0, 0 + n);
      //   m = m + 1;
      //   n = n + 10;
      // }, 100);
      // console.log('ahhh');

      //meshes[0].position = new BABYLON.Vector3(6500, 0, 0);


      socket.on('satellite orbit', (data) => { // Run function on emit from satellite data socket
        console.log(data);
        if (data) { // If data is defined
          meshes[0].position = new BABYLON.Vector3(data.x, data.y, data.z); // Set new position of satellite
        }

        // Set position of satellite axes.  Gets satellite position and adds 500.
        satAxisX.position = new BABYLON.Vector3(meshes[0].position.x + 500, meshes[0].position.y, meshes[0].position.z);
        satAxisY.position = new BABYLON.Vector3(meshes[0].position.x, meshes[0].position.y + 500, meshes[0].position.z);
        satAxisZ.position = new BABYLON.Vector3(meshes[0].position.x, meshes[0].position.y, meshes[0].position.z + 500);
      });

      // Manually set satellite position from input
      // $('#satellitePosition').submit((e) => {
      //   e.preventDefault();
      //   satPos = $('#satPos').val().trim().split(",");
      //   meshes[0].position = new BABYLON.Vector3(satPos[0], satPos[1], satPos[2]);
      // })
    });

    /*
    /
    /  EARTH ASSETTS
    /
    */

    // Create sphere for earth
    const earth = BABYLON.MeshBuilder.CreateSphere("EARTH", {
      diameter: 12742 // diameter in km
    }, scene);

    // Wrap earth texture around the sphere
    const earthMaterial = new BABYLON.StandardMaterial("textureEarth", scene);
    earthMaterial.diffuseTexture = new BABYLON.Texture("/obj/4096_earth.jpg", scene);
    earth.material = earthMaterial;

    earth.alpha = 0.5;

    // return the created scene
    return scene;
  }

  // call the createScene function
  const scene = createScene();

  // run the render loop
  engine.runRenderLoop(function() {
    scene.render();
  });

  // the canvas/window resize event handler
  window.addEventListener('resize', function() {
    engine.resize();
  });
};

export default satWorldView;

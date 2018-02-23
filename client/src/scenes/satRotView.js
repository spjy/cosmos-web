export default satRotView = () => {
  /*
  /
  /  STANDARD BABYLON INITIALIZATIONS
  /
  */

  // get the canvas DOM element
  const canvas = document.getElementById('satRotView');

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

    // create arc rotate camera at initial arc pi/4 pi/4 at radius 20 centered around (0,0,0)
    const camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", Math.PI / 4, Math.PI / 4, 1.3, new BABYLON.Vector3(0, 0, 0), scene);

    // attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Camera zoom speed
    camera.wheelPrecision = 1000;

    $('#degreeOfView').submit((e) => {
      e.preventDefault();
      degreeOfView = $('#degree').val() * (Math.PI / 180);
      console.log(degreeOfView);
    });

    $('#positionOfView').submit((e) => {
      e.preventDefault();
      positionOfView = $('#position').val().trim().split(',');
      console.log(positionOfView);
      camera.setPosition( new BABYLON.Vector3(Number(positionOfView[0]), Number(positionOfView[1]), Number(positionOfView[2])));
    });

    /*
    /
    /  SATELLITE AXES, ARROWS & TEXT
    /
    */

    // Reusable satellite axis settings
    const satAxisSettings = {
      height: 50,
      diameterTop: 0.01,
      diameterBottom: 0.01,
      tessellation: 10,
      position: 25
    };

    // cylindrical z axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const satAxisX = BABYLON.MeshBuilder.CreateCylinder("satAxisX", {
      height: satAxisSettings.height,
      diameterTop: satAxisSettings.diameterTop,
      diameterBottom: satAxisSettings.diameterBottom,
      tessellation: satAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
    }, scene);
    satAxisX.position = new BABYLON.Vector3(satAxisSettings.position, 0, 0);
    satAxisX.rotation = new BABYLON.Vector3(0, 0, (3 * Math.PI) / 2);

    // cylindrical z axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const satAxisY = BABYLON.MeshBuilder.CreateCylinder("satAxisY", {
      height: satAxisSettings.height,
      diameterTop: satAxisSettings.diameterTop,
      diameterBottom: satAxisSettings.diameterBottom,
      tessellation: satAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
    }, scene);
    satAxisY.position = new BABYLON.Vector3(0, satAxisSettings.position, 0);
    satAxisY.rotation = new BABYLON.Vector3(0, (3 * Math.PI) / 2, 0);

    // cylindrical z axis with args height, top diameter, bottom diameter, tessellations, (3) face colors
    const satAxisZ = BABYLON.MeshBuilder.CreateCylinder("satAxisZ", {
      height: satAxisSettings.height,
      diameterTop: satAxisSettings.diameterTop,
      diameterBottom: satAxisSettings.diameterBottom,
      tessellation: satAxisSettings.tessellation,
      faceColors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
    }, scene);
    satAxisZ.position = new BABYLON.Vector3(0, 0, satAxisSettings.position);
    satAxisZ.rotation = new BABYLON.Vector3((3 * Math.PI) / 2, 0, 0);

    // create cylinder for x axis at (1,0,0)
    const satArrowX = BABYLON.MeshBuilder.CreateCylinder("satArrowX", {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
      faceColors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
    }, scene);
    satArrowX.position = new BABYLON.Vector3(1, 0, 0);
    satArrowX.rotation = new BABYLON.Vector3(0, 0, (3 * Math.PI) / 2);

    // create arrow for y axis at (0,1,0)
    const satArrowY = BABYLON.MeshBuilder.CreateCylinder("satArrowY", {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
      faceColors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
    }, scene);
    satArrowY.position = new BABYLON.Vector3(0, 1, 0);

    // create arrow for x axis at (0,0,1)
    const satArrowZ = BABYLON.MeshBuilder.CreateCylinder("satArrowZ", {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
      faceColors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
    }, scene);
    satArrowZ.position = new BABYLON.Vector3(0, 0, 1);
    satArrowZ.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

    const XCoordText = makeTextPlane("X", "red", 1);
    XCoordText.position = new BABYLON.Vector3(1.1, 0, -0.1);

    const YCoordText = makeTextPlane("Y", "green", 1);
    YCoordText.position = new BABYLON.Vector3(0.05, 0.9, 0);

    const ZCoordText = makeTextPlane("Z", "blue", 1);
    ZCoordText.position = new BABYLON.Vector3(0, 0.05, 0.9);

    /*
    /
    /  SATELLITE IMPORTS & OPTIONS
    /
    */

    // load in satellite obj file
    BABYLON.SceneLoader.Load("/obj/", "cubesat.obj", engine, function(scene) { });

    const CUBESAT = assetsManager.addMeshTask("CUBESAT", "", "/obj/", "cubesat.obj");

    BABYLON.SceneLoader.ImportMesh("", "obj/", "cubesat.obj", scene, function(meshes) {
      // meshes[0].rotationQuaternion = new BABYLON.Quaternion(.5, .5, .5, 0);
      // setInterval(() => {
      //   meshes[0].rotationQuaternion = new BABYLON.Quaternion(Math.floor(Math.random() * 2) + 0.1, Math.floor(Math.random() * 2) + 0.1, Math.floor(Math.random() * 2) + 0.1, 0);
      // }, 500);

      socket.on('satellite orientation', (data) => {
        console.log(data);
        meshes[0].rotationQuaternion = new BABYLON.Quaternion(data.w, data.x, data.y, data.z); //
      });
    });

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

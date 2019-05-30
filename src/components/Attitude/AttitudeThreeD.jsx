import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

import BabylonScene from '../Global/BabylonScene';

class AttitudeThreeD extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  };

  onSceneMount = (e) => {
    const { canvas, scene, engine } = e;

    /*
    /  STANDARD BABYLON INITIALIZATION
    */

    const assetsManager = new BABYLON.AssetsManager(scene);

    const makeTextPlane = (text, color, size) => {
      const dynamicTexture = new BABYLON.DynamicTexture('DynamicTexture', 50, scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, 'bold 10px Arial', color, 'transparent', true);
      const plane = new BABYLON.Mesh.CreatePlane('TextPlane', size, scene, true);
      plane.material = new BABYLON.StandardMaterial('TextPlaneMaterial', scene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    };

    /*
    /  LIGHTS
    */

    // create a basic light, aiming 0,10,0 - meaning, to the sky
    new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 10, 0), scene);
    new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, -10, 0), scene);

    /*
    /  CAMERA
    */

    // create arc rotate camera at initial arc pi/4 pi/4 at radius 20 centered around (0,0,0)
    const camera = new BABYLON.ArcRotateCamera('ArcRotateCamera', Math.PI / 4, Math.PI / 4, 1.3, new BABYLON.Vector3(0, 0, 0), scene);

    // attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Camera zoom speed
    camera.wheelPrecision = 1000;

    /*
    /  SATELLITE AXES, ARROWS & TEXT
    */

    // Reusable satellite axis settings
    const satAxisSettings = {
      height: 50,
      diameterTop: 0.01,
      diameterBottom: 0.01,
      tessellation: 10,
      position: 25
    };

    const satArrowSettings = {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10
    };

    // cylindrical z axis
    const satAxisX = BABYLON.MeshBuilder.CreateCylinder('satAxisX', {
      ...satAxisSettings,
      faceColors: [
        new BABYLON.Color4(1, 0, 0, 1),
        new BABYLON.Color4(1, 0, 0, 1),
        new BABYLON.Color4(1, 0, 0, 1)
      ]
    }, scene);
    satAxisX.position = new BABYLON.Vector3(satAxisSettings.position, 0, 0);
    satAxisX.rotation = new BABYLON.Vector3(0, 0, (3 * Math.PI) / 2);

    // cylindrical z axis
    const satAxisY = BABYLON.MeshBuilder.CreateCylinder('satAxisY', {
      ...satAxisSettings,
      faceColors: [
        new BABYLON.Color4(0, 1, 0, 1),
        new BABYLON.Color4(0, 1, 0, 1),
        new BABYLON.Color4(0, 1, 0, 1)
      ]
    }, scene);
    satAxisY.position = new BABYLON.Vector3(0, satAxisSettings.position, 0);
    satAxisY.rotation = new BABYLON.Vector3(0, (3 * Math.PI) / 2, 0);

    // cylindrical z axis
    const satAxisZ = BABYLON.MeshBuilder.CreateCylinder('satAxisZ', {
      ...satAxisSettings,
      faceColors: [
        new BABYLON.Color4(0, 0, 1, 1),
        new BABYLON.Color4(0, 0, 1, 1),
        new BABYLON.Color4(0, 0, 1, 1)
      ]
    }, scene);
    satAxisZ.position = new BABYLON.Vector3(0, 0, satAxisSettings.position);
    satAxisZ.rotation = new BABYLON.Vector3((3 * Math.PI) / 2, 0, 0);

    // create cylinder for x axis at (1,0,0)
    const satArrowX = BABYLON.MeshBuilder.CreateCylinder('satArrowX', {
      ...satArrowSettings,
      faceColors: [
        new BABYLON.Color4(1, 0, 0, 1),
        new BABYLON.Color4(1, 0, 0, 1),
        new BABYLON.Color4(1, 0, 0, 1)
      ]
    }, scene);
    satArrowX.position = new BABYLON.Vector3(1, 0, 0);
    satArrowX.rotation = new BABYLON.Vector3(0, 0, (3 * Math.PI) / 2);

    // create arrow for y axis at (0,1,0)
    const satArrowY = BABYLON.MeshBuilder.CreateCylinder('satArrowY', {
      ...satArrowSettings,
      faceColors: [
        new BABYLON.Color4(0, 1, 0, 1),
        new BABYLON.Color4(0, 1, 0, 1),
        new BABYLON.Color4(0, 1, 0, 1)
      ]
    }, scene);
    satArrowY.position = new BABYLON.Vector3(0, 1, 0);

    // create arrow for x axis at (0,0,1)
    const satArrowZ = BABYLON.MeshBuilder.CreateCylinder('satArrowZ', {
      ...satArrowSettings,
      faceColors: [
        new BABYLON.Color4(0, 0, 1, 1),
        new BABYLON.Color4(0, 0, 1, 1),
        new BABYLON.Color4(0, 0, 1, 1)
      ]
    }, scene);
    satArrowZ.position = new BABYLON.Vector3(0, 0, 1);
    satArrowZ.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

    const XCoordText = makeTextPlane('X', 'red', 1);
    XCoordText.position = new BABYLON.Vector3(1.1, 0, -0.1);

    const YCoordText = makeTextPlane('Y', 'green', 1);
    YCoordText.position = new BABYLON.Vector3(0.05, 0.9, 0);

    const ZCoordText = makeTextPlane('Z', 'blue', 1);
    ZCoordText.position = new BABYLON.Vector3(0, 0.05, 0.9);

    /*
    /  SATELLITE IMPORTS & OPTIONS
    */

    // load in satellite obj file
    BABYLON.SceneLoader.Load('/obj/', 'cubesat.obj', engine, (scene) => {});

    assetsManager.addMeshTask('CUBESAT', '', '/obj/', 'cubesat.obj');

    BABYLON.SceneLoader.ImportMesh('', 'obj/', 'cubesat.obj', scene, (meshes) => {
      meshes[0].alwaysSelectAsActiveMesh = true;

      this.updateSatelliteAttitude = () => {
        meshes[0].rotationQuaternion = new BABYLON.Quaternion(
          this.props.data.w,
          this.props.data.x,
          this.props.data.y,
          this.props.data.z
        );
      };
    });

    // Run the render loop and render scene
    engine.runRenderLoop(() => {
      if (scene) {
        scene.render();
      }
    });
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (typeof (this.updateSatelliteAttitude) === 'function') { // check if function is defined
      this.updateSatelliteAttitude();
    }
  }

  render() {
    return (
      <BabylonScene onSceneMount={this.onSceneMount} />
    );
  }
}

export default AttitudeThreeD;

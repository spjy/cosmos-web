import React, { Component } from 'react';
import * as BABYLON from 'babylonjs';

const canvas = HTMLCanvasElement;

class ThreeD extends Component {
  componentDidMount() {
    const { engineOptions, adaptToDeviceRatio, onSceneMount } = this.props;

    this.engine = new BABYLON.Engine(
      this.canvas,
      true,
      engineOptions,
      adaptToDeviceRatio,
    );

    const scene = new BABYLON.Scene(this.engine);
    this.scene = scene;

    if (typeof onSceneMount === 'function') {
      onSceneMount({
        scene,
        engine: this.engine,
        canvas: this.canvas,
      });
    } else {
      console.error('onSceneMount function not available');
    }

    // Resize the babylon engine when the window is resized
    window.addEventListener('resize', this.onResizeWindow);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResizeWindow);
  }

  onResizeWindow = () => {
    if (this.engine) {
      this.engine.resize();
    }
  };

  onCanvasLoaded = (HTMLCanvasElement) => {
    if (HTMLCanvasElement !== null) {
      this.canvas = HTMLCanvasElement;
    }
  };

  render() {
    return (
      <canvas id="scene" ref={this.onCanvasLoaded} />
    );
  }
}

export default ThreeD;

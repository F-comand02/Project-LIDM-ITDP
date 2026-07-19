import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class LorentzScene {
  constructor(container) {
    this.container = container;
    
    this.scene = new THREE.Scene();
    // Midnight dark gradient background feel
    this.scene.background = new THREE.Color(0x090D16);
    this.scene.fog = new THREE.FogExp2(0x090D16, 0.035);

    this.createRenderer();
    this.createCamera();
    this.createLights();
    this.createGrid();
    this.createControls();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const rect = this.container.getBoundingClientRect();
    this.renderer.setSize(rect.width || 800, rect.height || 450);
    
    // Append the canvas to the stage container
    this.canvas = this.renderer.domElement;
    this.canvas.className = "w-full h-full block cursor-grab active:cursor-grabbing outline-none";
    this.container.appendChild(this.canvas);
  }

  createCamera() {
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 450);
    
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    // Ideal high angle isometric-like view for mechanics
    this.camera.position.set(4, 3.5, 6);
  }

  createLights() {
    // Soft global ambient fill
    const ambientLight = new THREE.AmbientLight(0x1E293B, 1.5);
    this.scene.add(ambientLight);

    // Directional light for shadows & depth highlighting on hand
    const dirLight = new THREE.DirectionalLight(0xF8FAFC, 2.5);
    dirLight.position.set(5, 8, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    // Subtly colored fill lights for scientific look
    const purpleLight = new THREE.PointLight(0x7C3AED, 1.8, 15);
    purpleLight.position.set(-4, -2, -3);
    this.scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x06B6D4, 1.5, 15);
    blueLight.position.set(3, -1, 4);
    this.scene.add(blueLight);
  }

  createGrid() {
    // Elegant low-opacity radial grid or standard grid helper
    this.grid = new THREE.GridHelper(10, 20, 0x334155, 0x1E293B);
    this.grid.position.y = -2;
    this.scene.add(this.grid);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't orbit below ground
    this.controls.minDistance = 2;
    this.controls.maxDistance = 15;
    this.controls.target.set(0, 0, 0);
  }

  resetCamera() {
    this.camera.position.set(4, 3.5, 6);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  resize() {
    if (!this.container || !this.renderer) return;
    const rect = this.container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    if (this.controls) this.controls.dispose();

    // Traverse the scene and dispose of geometries, materials, and textures
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }
}

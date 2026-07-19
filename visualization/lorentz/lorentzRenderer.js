import * as THREE from 'three';
import { LorentzScene } from './lorentzScene.js';
import { LorentzPhysics, parseDirections } from './lorentzPhysics.js';
import { RightHandModel } from './rightHandModel.js';
import { AxisHelper } from './axisHelper.js';
import { VectorHelper } from './vectorHelper.js';
import { LorentzControls } from './controls.js';

export class LorentzRenderer {
  constructor(stageContainer, vars = {}) {
    this.stageContainer = stageContainer;
    this.vars = vars;

    // Detect initial directions from prompt text if available
    const textarea = document.getElementById('soal-textarea');
    const userText = textarea ? textarea.value : "";
    const parsedDirs = parseDirections(userText);

    // Initialize Physics Engine
    this.physics = new LorentzPhysics(vars);
    this.physics.setDirections(parsedDirs.currentDir, parsedDirs.magneticDir);

    // Setup Three.js Scene and Controls in parent
    this.controlsManager = new LorentzControls(
      this.stageContainer,
      this.physics,
      null, // Will pass scene after creation
      () => this.onDirectionChanged()
    );

    // Grab the canvas container created by Controls
    const canvasContainer = document.getElementById('lorentz-canvas-wrapper');
    this.sceneManager = new LorentzScene(canvasContainer);
    
    // Inject scene manager back into controls so camera can be reset
    this.controlsManager.scene = this.sceneManager;

    // Initialize sub-components inside Three.js
    this.hand = new RightHandModel();
    this.sceneManager.scene.add(this.hand.group);

    this.axes = new AxisHelper();
    this.sceneManager.scene.add(this.axes.group);

    this.vectors = new VectorHelper();
    this.sceneManager.scene.add(this.vectors.group);

    // Setup the physical objects
    this.createConductor();
    this.createMagneticFieldGrid();

    // Bind checkbox visual toggles from sidebar
    this.bindOptionToggles();

    // Start the Animation loop
    this.clock = new THREE.Clock();
    this.isPlaying = true;
    this.animationFrameId = null;

    this.onDirectionChanged(); // Apply initial positioning
    this.animate();

    // Handle Responsive Resize
    this.resizeObserver = new ResizeObserver(() => {
      this.sceneManager.resize();
    });
    this.resizeObserver.observe(this.stageContainer);
  }

  createConductor() {
    this.conductorGroup = new THREE.Group();
    this.sceneManager.scene.add(this.conductorGroup);

    // Copper Wire Cylinder
    // Cylinder is created along local Y. We will rotate the whole group.
    const wireLen = 4.0;
    const wireGeo = new THREE.CylinderGeometry(0.12, 0.12, wireLen, 16);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0xD97706, // Rich copper/amber orange
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85
    });

    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.conductorGroup.add(wireMesh);

    // Electrons (moving spheres)
    this.electronGroup = new THREE.Group();
    this.conductorGroup.add(this.electronGroup);

    this.electronMeshes = [];
    const elGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const elMat = new THREE.MeshBasicMaterial({
      color: 0x06B6D4 // Luminous electric cyan
    });

    for (let i = 0; i < this.physics.numElectrons; i++) {
      const elMesh = new THREE.Mesh(elGeo, elMat);
      this.electronGroup.add(elMesh);
      this.electronMeshes.push(elMesh);
    }
  }

  createMagneticFieldGrid() {
    this.fieldGroup = new THREE.Group();
    this.sceneManager.scene.add(this.fieldGroup);

    // Build a bundle of parallel lines/arrows representing uniform B field
    this.fieldArrows = [];
    const spacing = 1.5;
    const arrowColor = 0x3B82F6; // Blue

    // 4x4 vertical distribution
    for (let x = -2; x <= 2; x += spacing) {
      for (let y = -2; y <= 2; y += spacing) {
        // Skip central position to not overlap with hand/wire
        if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) continue;

        const arrow = new THREE.ArrowHelper(
          new THREE.Vector3(0, 1, 0), // Default up
          new THREE.Vector3(x, y, -2.5), // Grid positioning offset in Z
          1.8,
          arrowColor,
          0.25,
          0.12
        );
        this.fieldGroup.add(arrow);
        this.fieldArrows.push(arrow);
      }
    }
  }

  onDirectionChanged() {
    const vectors = this.physics.getVectors();

    // 1. Orient the 3D Conductor Wire along Current direction (I)
    const alignVector = new THREE.Vector3(0, 1, 0); // Default Cylinder direction
    const qConductor = new THREE.Quaternion().setFromUnitVectors(alignVector, vectors.I);
    this.conductorGroup.setRotationFromQuaternion(qConductor);

    // 2. Orient the 3D Magnetic Field Grid arrows along B direction
    this.fieldArrows.forEach(arrow => {
      arrow.setDirection(vectors.B);
    });

    // 3. Orient the 3D Right Hand Model
    this.hand.alignToBasis(vectors.I, vectors.B, vectors.F);

    // 4. Update the arrow helpers
    this.vectors.update(vectors);
  }

  bindOptionToggles() {
    const chkHand = document.getElementById('chk-hand');
    const chkAxis = document.getElementById('chk-axis');
    const chkGrid = document.getElementById('chk-grid');
    const chkLabels = document.getElementById('chk-labels');

    if (chkHand) {
      chkHand.addEventListener('change', (e) => {
        this.hand.setVisible(e.target.checked);
      });
    }
    if (chkAxis) {
      chkAxis.addEventListener('change', (e) => {
        this.axes.setVisible(e.target.checked);
      });
    }
    if (chkGrid) {
      chkGrid.addEventListener('change', (e) => {
        this.sceneManager.grid.visible = e.target.checked;
      });
    }
    if (chkLabels) {
      chkLabels.addEventListener('change', (e) => {
        this.axes.setLabelsVisible(e.target.checked);
        this.vectors.setLabelsVisible(e.target.checked);
      });
    }
  }

  animate() {
    const loop = () => {
      this.animationFrameId = requestAnimationFrame(loop);

      const dt = this.clock.getDelta();
      this.physics.update(dt);

      // 1. Animate moving electron positions inside the wire cylinder
      const wireLen = 4.0;
      this.physics.electrons.forEach((el, idx) => {
        const mesh = this.electronMeshes[idx];
        if (mesh) {
          // Compute position along the cylinder local Y axis [-wireLen/2, wireLen/2]
          const yPos = (el.progress - 0.5) * wireLen;
          mesh.position.set(0, yPos, 0);
        }
      });

      // 2. Animate pulsing magnetic field lines
      const pulseScale = this.physics.fieldPulse;
      this.fieldArrows.forEach(arrow => {
        arrow.scale.set(1.0, pulseScale, 1.0);
      });

      // 3. OrbitControls update
      this.sceneManager.controls.update();

      // 4. Render
      this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    };

    loop();
  }

  setSpeed(speed) {
    this.physics.speedMultiplier = speed;
  }

  setZoom(zoom) {
    // Zoom by adjusting camera FOV dynamically
    const baseFov = 45;
    this.sceneManager.camera.fov = baseFov / zoom;
    this.sceneManager.camera.updateProjectionMatrix();
  }

  play() {
    this.physics.isPlaying = true;
  }

  pause() {
    this.physics.isPlaying = false;
  }

  reset() {
    this.physics.initElectrons();
    this.physics.time = 0;
    this.sceneManager.resetCamera();
    this.onDirectionChanged();
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.sceneManager.dispose();
  }
}

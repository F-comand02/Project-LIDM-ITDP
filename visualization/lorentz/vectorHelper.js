import * as THREE from 'three';

export class VectorHelper {
  constructor() {
    this.group = new THREE.Group();
    this.createVectors();
  }

  createTextSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    
    // Smooth circle background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(48, 48, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bold letter
    ctx.fillStyle = color;
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 48, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.5, 0.5);
    return sprite;
  }

  createVectors() {
    // Zero-length default vectors
    const zeroDir = new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(0, 0, 0);

    // Arrow Colors
    this.colors = {
      I: 0xF59E0B, // Yellow
      B: 0x3B82F6, // Blue
      F: 0xEF4444  // Red
    };

    // Current (I) Arrow
    this.arrowI = new THREE.ArrowHelper(zeroDir, origin, 1.0, this.colors.I, 0.3, 0.15);
    this.arrowI.line.material.linewidth = 4;
    this.group.add(this.arrowI);

    // Magnetic Field (B) Arrow
    this.arrowB = new THREE.ArrowHelper(zeroDir, origin, 1.0, this.colors.B, 0.3, 0.15);
    this.arrowB.line.material.linewidth = 4;
    this.group.add(this.arrowB);

    // Lorentz Force (F) Arrow
    this.arrowF = new THREE.ArrowHelper(zeroDir, origin, 1.0, this.colors.F, 0.3, 0.15);
    this.arrowF.line.material.linewidth = 5;
    this.group.add(this.arrowF);

    // Text Label Sprites
    this.spriteI = this.createTextSprite('I', '#F59E0B');
    this.spriteB = this.createTextSprite('B', '#3B82F6');
    this.spriteF = this.createTextSprite('F_L', '#EF4444');

    this.group.add(this.spriteI);
    this.group.add(this.spriteB);
    this.group.add(this.spriteF);
  }

  update(vectors) {
    const origin = new THREE.Vector3(0, 0, 0);

    // 1. Current Arrow
    const lenI = vectors.I_scaled.length();
    if (lenI > 0.05) {
      this.arrowI.visible = true;
      this.arrowI.setDirection(vectors.I.clone().normalize());
      this.arrowI.setLength(lenI, 0.3, 0.15);
      // Place label at the tip
      const tipI = vectors.I_scaled.clone().multiplyScalar(1.08);
      this.spriteI.position.copy(tipI);
      this.spriteI.visible = true;
    } else {
      this.arrowI.visible = false;
      this.spriteI.visible = false;
    }

    // 2. Magnetic Field Arrow
    const lenB = vectors.B_scaled.length();
    if (lenB > 0.05) {
      this.arrowB.visible = true;
      this.arrowB.setDirection(vectors.B.clone().normalize());
      this.arrowB.setLength(lenB, 0.3, 0.15);
      // Place label at the tip
      const tipB = vectors.B_scaled.clone().multiplyScalar(1.08);
      this.spriteB.position.copy(tipB);
      this.spriteB.visible = true;
    } else {
      this.arrowB.visible = false;
      this.spriteB.visible = false;
    }

    // 3. Lorentz Force Arrow
    const lenF = vectors.F_scaled.length();
    if (lenF > 0.05) {
      this.arrowF.visible = true;
      this.arrowF.setDirection(vectors.F.clone().normalize());
      this.arrowF.setLength(lenF, 0.3, 0.15);
      // Place label at the tip
      const tipF = vectors.F_scaled.clone().multiplyScalar(1.08);
      this.spriteF.position.copy(tipF);
      this.spriteF.visible = true;
    } else {
      this.arrowF.visible = false;
      this.spriteF.visible = false;
    }
  }

  setLabelsVisible(visible) {
    this.spriteI.visible = visible;
    this.spriteB.visible = visible;
    this.spriteF.visible = visible;
  }
}

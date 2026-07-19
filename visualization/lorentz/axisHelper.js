import * as THREE from 'three';

export class AxisHelper {
  constructor() {
    this.group = new THREE.Group();
    this.labels = [];
    this.createAxes();
  }

  createTextSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw background dot for high contrast legibility
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.arc(64, 64, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw text
    ctx.fillStyle = color;
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.6, 0.6, 0.6);
    return sprite;
  }

  createAxes() {
    const axisLen = 3.2;
    const colors = {
      x: '#EF4444', // Red
      y: '#10B981', // Green
      z: '#3B82F6'  // Blue
    };

    // Helper for grid line
    const createLine = (start, end, color, dashed = false) => {
      const points = [start, end];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      let material;
      if (dashed) {
        material = new THREE.LineDashedMaterial({
          color: color,
          dashSize: 0.2,
          gapSize: 0.1,
          linewidth: 1.5
        });
      } else {
        material = new THREE.LineBasicMaterial({
          color: color,
          linewidth: 2.5
        });
      }
      const line = new THREE.Line(geometry, material);
      if (dashed) {
        line.computeLineDistances();
      }
      return line;
    };

    // X-Axis (Red)
    this.group.add(createLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLen, 0, 0), colors.x, false));
    this.group.add(createLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-axisLen, 0, 0), colors.x, true));
    
    // Y-Axis (Green)
    this.group.add(createLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLen, 0), colors.y, false));
    this.group.add(createLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -axisLen, 0), colors.y, true));
    
    // Z-Axis (Blue)
    this.group.add(createLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLen), colors.z, false));
    this.group.add(createLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -axisLen), colors.z, true));

    // Sprites labels
    const sprPX = this.createTextSprite('+X', colors.x);
    sprPX.position.set(axisLen + 0.3, 0, 0);
    this.group.add(sprPX);
    this.labels.push(sprPX);

    const sprNX = this.createTextSprite('-X', colors.x);
    sprNX.position.set(-axisLen - 0.3, 0, 0);
    this.group.add(sprNX);
    this.labels.push(sprNX);

    const sprPY = this.createTextSprite('+Y', colors.y);
    sprPY.position.set(0, axisLen + 0.3, 0);
    this.group.add(sprPY);
    this.labels.push(sprPY);

    const sprNY = this.createTextSprite('-Y', colors.y);
    sprNY.position.set(0, -axisLen - 0.3, 0);
    this.group.add(sprNY);
    this.labels.push(sprNY);

    const sprPZ = this.createTextSprite('+Z', colors.z);
    sprPZ.position.set(0, 0, axisLen + 0.3);
    this.group.add(sprPZ);
    this.labels.push(sprPZ);

    const sprNZ = this.createTextSprite('-Z', colors.z);
    sprNZ.position.set(0, 0, -axisLen - 0.3);
    this.group.add(sprNZ);
    this.labels.push(sprNZ);
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  setLabelsVisible(visible) {
    this.labels.forEach(label => {
      label.visible = visible;
    });
  }
}

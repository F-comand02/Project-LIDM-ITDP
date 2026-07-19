import * as THREE from 'three';

export class RightHandModel {
  constructor() {
    this.group = new THREE.Group();
    this.createHand();
  }

  createHand() {
    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate gray tech hand
      roughness: 0.6,
      metalness: 0.1
    });

    const currentMaterial = new THREE.MeshStandardMaterial({
      color: 0xF59E0B, // Yellow Current (I)
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0xF59E0B,
      emissiveIntensity: 0.2
    });

    const magneticMaterial = new THREE.MeshStandardMaterial({
      color: 0x3B82F6, // Blue Magnetic Field (B)
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x3B82F6,
      emissiveIntensity: 0.2
    });

    const forceMaterial = new THREE.MeshStandardMaterial({
      color: 0xEF4444, // Red Lorentz Force (F)
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0xEF4444,
      emissiveIntensity: 0.2
    });

    // 1. Palm (Telapak Tangan)
    const palmGeo = new THREE.BoxGeometry(0.7, 0.15, 0.6);
    const palm = new THREE.Mesh(palmGeo, skinMaterial);
    palm.position.set(0, 0, 0);
    this.group.add(palm);

    // Knuckle cover for design
    const knuckleGeo = new THREE.BoxGeometry(0.72, 0.18, 0.2);
    const knuckle = new THREE.Mesh(knuckleGeo, skinMaterial);
    knuckle.position.set(0, 0.02, 0.2);
    this.group.add(knuckle);

    // 2. Thumb (Ibu Jari) - Aligns with local +Y (Current I)
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(-0.35, 0.05, -0.1);
    
    const thumbBaseGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8);
    const thumbBase = new THREE.Mesh(thumbBaseGeo, skinMaterial);
    thumbBase.position.set(0, 0.05, 0);
    thumbGroup.add(thumbBase);

    const thumbGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
    const thumb = new THREE.Mesh(thumbGeo, currentMaterial);
    thumb.position.set(0, 0.3, 0); // pointing up (+Y)
    thumbGroup.add(thumb);

    this.group.add(thumbGroup);

    // 3. Index Finger (Jari Telunjuk) - Aligns with local +Z (Magnetic Field B)
    const indexGroup = new THREE.Group();
    indexGroup.position.set(-0.2, 0.05, 0.3);

    const indexGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const indexFinger = new THREE.Mesh(indexGeo, magneticMaterial);
    indexFinger.rotation.x = Math.PI / 2; // Orient along Z
    indexFinger.position.set(0, 0, 0.3); // point forward (+Z)
    indexGroup.add(indexFinger);
    
    this.group.add(indexGroup);

    // 4. Middle Finger (Jari Tengah) - Aligns with local +X (Lorentz Force F)
    const middleGroup = new THREE.Group();
    middleGroup.position.set(0.3, 0.05, 0.1);

    const middleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const middleFinger = new THREE.Mesh(middleGeo, forceMaterial);
    middleFinger.rotation.z = -Math.PI / 2; // Orient along X
    middleFinger.position.set(0.3, 0, 0); // point right (+X)
    middleGroup.add(middleFinger);

    this.group.add(middleGroup);

    // 5. Curled Fingers (Ring & Pinky Fingers) - Folded/Curled under
    const curlMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155, // Darker slate
      roughness: 0.8
    });

    // Ring finger curl
    const ringFingerGroup = new THREE.Group();
    ringFingerGroup.position.set(0.05, -0.1, 0.25);
    const ringGeo = new THREE.BoxGeometry(0.09, 0.15, 0.18);
    const ringFinger = new THREE.Mesh(ringGeo, curlMaterial);
    ringFingerGroup.add(ringFinger);
    this.group.add(ringFingerGroup);

    // Pinky finger curl
    const pinkyFingerGroup = new THREE.Group();
    pinkyFingerGroup.position.set(0.2, -0.1, 0.2);
    const pinkyGeo = new THREE.BoxGeometry(0.08, 0.13, 0.16);
    const pinkyFinger = new THREE.Mesh(pinkyGeo, curlMaterial);
    pinkyFingerGroup.add(pinkyFinger);
    this.group.add(pinkyFingerGroup);

    // Scale up the entire hand a bit for visual dominance
    this.group.scale.set(1.4, 1.4, 1.4);
  }

  alignToBasis(u_I, u_B, u_F) {
    // Construct rotation matrix from our three basis vectors
    // Local basis in our hand:
    // Middle Finger = local +X (u_F)
    // Thumb = local +Y (u_I)
    // Index Finger = local +Z (u_B)
    
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(
      u_F.clone().normalize(), // Column X (Gaya)
      u_I.clone().normalize(), // Column Y (Arus)
      u_B.clone().normalize()  // Column Z (Medan)
    );

    this.group.setRotationFromMatrix(matrix);
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}

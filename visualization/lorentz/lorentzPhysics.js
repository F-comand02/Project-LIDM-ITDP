import * as THREE from 'three';

export const directionVectors = {
  "+X": new THREE.Vector3(1, 0, 0),
  "-X": new THREE.Vector3(-1, 0, 0),
  "+Y": new THREE.Vector3(0, 1, 0),
  "-Y": new THREE.Vector3(0, -1, 0),
  "+Z": new THREE.Vector3(0, 0, 1),
  "-Z": new THREE.Vector3(0, 0, -1)
};

export function parseDirections(text) {
  const textLower = (text || "").toLowerCase();
  
  let currentDir = "+X"; // default to right
  let magneticDir = "-Z"; // default to into page
  
  // Parse Current (Arus I)
  if (textLower.includes("arus ke kanan") || textLower.includes("arus arah kanan") || textLower.includes("arus mengalir ke kanan") || textLower.includes("arus listrik ke kanan") || textLower.includes("sumbu +x") || textLower.includes("sumbu x positif")) {
    currentDir = "+X";
  } else if (textLower.includes("arus ke kiri") || textLower.includes("arus arah kiri") || textLower.includes("arus mengalir ke kiri") || textLower.includes("arus listrik ke kiri") || textLower.includes("sumbu -x") || textLower.includes("sumbu x negatif")) {
    currentDir = "-X";
  } else if (textLower.includes("arus ke atas") || textLower.includes("arus mengalir ke atas") || textLower.includes("sumbu +y") || textLower.includes("sumbu y positif")) {
    currentDir = "+Y";
  } else if (textLower.includes("arus ke bawah") || textLower.includes("arus mengalir ke bawah") || textLower.includes("sumbu -y") || textLower.includes("sumbu y negatif")) {
    currentDir = "-Y";
  } else if (textLower.includes("arus keluar") || textLower.includes("sumbu +z") || textLower.includes("sumbu z positif")) {
    currentDir = "+Z";
  } else if (textLower.includes("arus masuk") || textLower.includes("sumbu -z") || textLower.includes("sumbu z negatif")) {
    currentDir = "-Z";
  }

  // Parse Magnetic Field (B)
  if (textLower.includes("medan magnet ke atas") || textLower.includes("medan ke atas") || textLower.includes("medan magnet arah atas") || textLower.includes("b ke atas") || textLower.includes("b arah atas") || textLower.includes("sumbu +y") || textLower.includes("sumbu y positif")) {
    magneticDir = "+Y";
  } else if (textLower.includes("medan magnet ke bawah") || textLower.includes("medan ke bawah") || textLower.includes("medan magnet arah bawah") || textLower.includes("b ke bawah") || textLower.includes("b arah bawah") || textLower.includes("sumbu -y") || textLower.includes("sumbu y negatif")) {
    magneticDir = "-Y";
  } else if (textLower.includes("medan magnet ke kanan") || textLower.includes("medan ke kanan") || textLower.includes("medan magnet arah kanan") || textLower.includes("b ke kanan") || textLower.includes("b arah kanan") || textLower.includes("sumbu +x") || textLower.includes("sumbu x positif")) {
    magneticDir = "+X";
  } else if (textLower.includes("medan magnet ke kiri") || textLower.includes("medan ke kiri") || textLower.includes("medan magnet arah kiri") || textLower.includes("b ke kiri") || textLower.includes("b arah kiri") || textLower.includes("sumbu -x") || textLower.includes("sumbu x negatif")) {
    magneticDir = "-X";
  } else if (textLower.includes("medan magnet masuk") || textLower.includes("medan masuk") || textLower.includes("masuk bidang") || textLower.includes("menjauhi pembaca") || textLower.includes("b masuk") || textLower.includes("sumbu -z") || textLower.includes("sumbu z negatif")) {
    magneticDir = "-Z";
  } else if (textLower.includes("medan magnet keluar") || textLower.includes("medan keluar") || textLower.includes("keluar bidang") || textLower.includes("mendekati pembaca") || textLower.includes("b keluar") || textLower.includes("sumbu +z") || textLower.includes("sumbu z positif")) {
    magneticDir = "+Z";
  }

  // Prevent same-axis conflict if they were extracted identically by chance
  if (currentDir === magneticDir) {
    if (currentDir === "+X" || currentDir === "-X") {
      magneticDir = "+Y";
    } else {
      magneticDir = "+X";
    }
  }

  return { currentDir, magneticDir };
}

export class LorentzPhysics {
  constructor(vars = {}) {
    this.B_mag = vars.B !== undefined ? parseFloat(vars.B) : 4;
    this.I_mag = vars.arus !== undefined ? parseFloat(vars.arus) : 5;
    this.L_mag = vars.L !== undefined ? parseFloat(vars.L) : 2;
    this.theta = vars.sudut !== undefined ? parseFloat(vars.sudut) : 90;

    // Default directions
    this.currentDirName = "+X";
    this.magneticDirName = "-Z";
    this.forceDirName = "+Y";

    this.isPlaying = true;
    this.speedMultiplier = 1.0;
    this.time = 0;

    // Electron flow tracking array
    this.electrons = [];
    this.numElectrons = 15;
    this.initElectrons();

    // Pulse parameters
    this.fieldPulse = 0;
  }

  initElectrons() {
    this.electrons = [];
    for (let i = 0; i < this.numElectrons; i++) {
      this.electrons.push({
        progress: Math.random() // value between 0 and 1
      });
    }
  }

  setDirections(currentDirName, magneticDirName) {
    this.currentDirName = currentDirName;
    this.magneticDirName = magneticDirName;
    this.calculateForceDirection();
  }

  calculateForceDirection() {
    const vI = directionVectors[this.currentDirName];
    const vB = directionVectors[this.magneticDirName];
    const vF = new THREE.Vector3().crossVectors(vI, vB);

    // Find the direction name for F
    let bestMatch = "+X";
    let maxDot = -Infinity;

    for (const [name, vec] of Object.entries(directionVectors)) {
      const dot = vec.dot(vF);
      if (dot > maxDot) {
        maxDot = dot;
        bestMatch = name;
      }
    }

    if (vF.lengthSq() < 0.001) {
      // Parallel directions -> Force is zero
      this.forceDirName = "N/A (0)";
      this.F_mag = 0;
    } else {
      this.forceDirName = bestMatch;
      // Calculate force: F = B * I * L * sin(theta)
      const rad = (this.theta * Math.PI) / 180;
      this.F_mag = this.B_mag * this.I_mag * this.L_mag * Math.sin(rad);
    }
  }

  update(dt) {
    if (!this.isPlaying) return;

    const scaledDt = dt * this.speedMultiplier;
    this.time += scaledDt;

    // Update electron flows inside the conductor
    this.electrons.forEach(el => {
      // Speed proportional to current intensity
      el.progress += scaledDt * 0.4 * (this.I_mag / 5);
      if (el.progress > 1.0) {
        el.progress -= 1.0;
      }
    });

    // Pulse effects for field lines
    this.fieldPulse = Math.sin(this.time * 4) * 0.05 + 1.0;
  }

  getVectors() {
    const vI = directionVectors[this.currentDirName].clone().normalize();
    const vB = directionVectors[this.magneticDirName].clone().normalize();
    const vF = (this.forceDirName === "N/A (0)") ? new THREE.Vector3(0,0,0) : directionVectors[this.forceDirName].clone().normalize();

    return {
      I: vI,
      B: vB,
      F: vF,
      I_scaled: vI.clone().multiplyScalar(1.5 + this.I_mag * 0.15),
      B_scaled: vB.clone().multiplyScalar(1.5 + this.B_mag * 0.15),
      F_scaled: vF.clone().multiplyScalar(1.5 + (this.F_mag || 0) * 0.02)
    };
  }
}

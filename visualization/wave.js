/**
 * PhysiViz AI - Mechanical Wave Concept Lab Animation
 * Features: Live-calculating sine wave propagation (y = A * sin(omega * t - k * x)),
 * dynamic sliders for Amplitude and Frequency, and visual highlights for Crest (Bukit),
 * Trough (Lembah), and Wavelength (Panjang Gelombang).
 */

import { PhysicsRenderer } from "./renderer.js";

export class WaveVisualizer {
  constructor(container, vars) {
    this.container = container;
    
    // Core physical variables (with sliders)
    this.lambda = vars.lambda !== undefined ? parseFloat(vars.lambda) : 4; // Wavelength in meters
    this.f = vars.f !== undefined ? parseFloat(vars.f) : 2.5; // Frequency in Hz

    // Amplitude in pixels (starts with default, adjustable via slider)
    this.A = 45; 
    
    // Setup controls dynamic container
    this.initControls();

    this.init();
  }

  initControls() {
    // Check if the wave controls are already created
    let controlsDiv = this.container.querySelector("#wave-interactive-controls");
    if (!controlsDiv) {
      controlsDiv = document.createElement("div");
      controlsDiv.id = "wave-interactive-controls";
      controlsDiv.className = "p-3 bg-slate-900 border-t border-slate-800 rounded-b-2xl grid grid-cols-2 gap-4 text-xs font-mono text-slate-300 z-20";
      
      controlsDiv.innerHTML = `
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between font-bold">
            <span>Amplitudo (A)</span>
            <span id="wave-amp-val">45px</span>
          </div>
          <input id="wave-amp-slider" type="range" min="10" max="80" value="45" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600">
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between font-bold">
            <span>Frekuensi (f)</span>
            <span id="wave-freq-val">${this.f.toFixed(1)} Hz</span>
          </div>
          <input id="wave-freq-slider" type="range" min="0.5" max="8" step="0.1" value="${this.f}" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600">
        </div>
      `;
      this.container.appendChild(controlsDiv);
    }

    // Set up event listeners
    const ampSlider = controlsDiv.querySelector("#wave-amp-slider");
    const ampVal = controlsDiv.querySelector("#wave-amp-val");
    ampSlider.addEventListener("input", (e) => {
      this.A = parseFloat(e.target.value);
      ampVal.textContent = `${this.A}px`;
      if (!this.renderer.isPlaying) this.renderer.draw();
    });

    const freqSlider = controlsDiv.querySelector("#wave-freq-slider");
    const freqVal = controlsDiv.querySelector("#wave-freq-val");
    freqSlider.addEventListener("input", (e) => {
      this.f = parseFloat(e.target.value);
      freqVal.textContent = `${this.f.toFixed(1)} Hz`;
      if (!this.renderer.isPlaying) this.renderer.draw();
    });
  }

  init() {
    this.renderer = new PhysicsRenderer(this.container, {
      onUpdate: (dt, time) => this.update(dt, time),
      onDraw: (ctx, w, h, time, zoom) => this.draw(ctx, w, h, time, zoom)
    });
  }

  update(dt, time) {
    // Simply allow the loop to run and advance renderer's time
  }

  draw(ctx, w, h, time, zoom) {
    const centerY = h / 2;
    const startX = 80;
    const endX = w - 80;
    const length = endX - startX;

    // Equilibrium line (dashed axis)
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(startX, centerY);
    ctx.lineTo(endX, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Compute parameters for equation y = A * sin(omega*t - k*x)
    const omega = 2 * Math.PI * this.f;
    
    // Visually let 200px on screen represent the physical wavelength lambda
    const visualWavelength = 180; 
    const k = (2 * Math.PI) / visualWavelength;

    // Draw the continuous sine wave path
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();

    let points = [];
    for (let x = startX; x <= endX; x += 2) {
      const rx = x - startX;
      // Wave propagation equation
      const y = centerY + this.A * Math.sin(omega * time * 0.15 - k * rx);
      points.push({ x, y });
      
      if (x === startX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // HIGHLIGHT KEY FEATURES
    // Find Crest (Bukit) & Trough (Lembah) along the wave
    let crestPt = null;
    let troughPt = null;

    points.forEach((pt) => {
      // Crest is the maximum positive displacement (lowest Y coordinate on canvas)
      if (!crestPt || pt.y < crestPt.y) {
        crestPt = pt;
      }
      // Trough is maximum negative displacement (highest Y coordinate on canvas)
      if (!troughPt || pt.y > troughPt.y) {
        troughPt = pt;
      }
    });

    // Draw Crest Indicator (Bukit)
    if (crestPt) {
      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(crestPt.x, crestPt.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#10B981";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Bukit (Crest)", crestPt.x, crestPt.y - 12);
    }

    // Draw Trough Indicator (Lembah)
    if (troughPt) {
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(troughPt.x, troughPt.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#EF4444";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Lembah (Trough)", troughPt.x, troughPt.y + 20);
    }

    // Draw Wavelength bracket (Panjang Gelombang λ)
    // Represented by mapping visualWavelength spacing starting near the center
    const bracketX1 = startX + 50;
    const bracketX2 = bracketX1 + visualWavelength;
    const bracketY = centerY - this.A - 25;

    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    // Draw horizontal bracket lines with side ticks
    ctx.moveTo(bracketX1, bracketY + 5);
    ctx.lineTo(bracketX1, bracketY);
    ctx.lineTo(bracketX2, bracketY);
    ctx.lineTo(bracketX2, bracketY + 5);
    ctx.stroke();

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`Panjang Gelombang (λ = ${this.lambda}m)`, (bracketX1 + bracketX2) / 2, bracketY - 8);

    // Telemetry dashboard card
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(10, 10, 240, 80);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 240, 80);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Wave Propagation Model`, 20, 28);
    ctx.fillText(`Cepat Rambat (v) : ${(this.lambda * this.f).toFixed(1)} m/s`, 20, 48);
    ctx.fillText(`Frekuensi (f)    : ${this.f.toFixed(1)} Hz`, 20, 68);
  }

  play() { this.renderer.start(); }
  pause() { this.renderer.pause(); }
  reset() {
    this.renderer.reset();
  }
}

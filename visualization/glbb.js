/**
 * PhysiViz AI - GLBB Interactive Concept Lab Animation
 * Features: Vehicle motion, road and track lines, interactive telemetry, speedometer,
 * velocity & acceleration vector arrows, and real-time v-t/s-t graphs.
 */

import { PhysicsRenderer } from "./renderer.js";

export class GLBBVisualizer {
  constructor(container, vars) {
    this.container = container;
    this.vars = {
      v0: vars.v0 !== undefined ? parseFloat(vars.v0) : 10,
      a: vars.a !== undefined ? parseFloat(vars.a) : 2,
      tMax: vars.waktu !== undefined ? parseFloat(vars.waktu) : 5,
    };

    // Calculate maximum distance to scale coordinate mapping
    // s = v0 * t + 0.5 * a * t^2
    this.sMax = this.vars.v0 * this.vars.tMax + 0.5 * this.vars.a * (this.vars.tMax ** 2);
    
    this.carX = 0;
    this.carV = this.vars.v0;
    this.carS = 0;
    this.history = []; // Keep track of time, velocity, and distance for graphs

    this.init();
  }

  init() {
    this.renderer = new PhysicsRenderer(this.container, {
      onUpdate: (dt, time) => this.update(dt, time),
      onDraw: (ctx, w, h, time, zoom) => this.draw(ctx, w, h, time, zoom)
    });
  }

  update(dt, time) {
    // If simulation exceeds max time, auto-pause or cap
    const t = Math.min(time, this.vars.tMax);
    
    // Equations of motion
    // v = v0 + at
    this.carV = this.vars.v0 + this.vars.a * t;
    // s = v0 * t + 0.5 * a * t^2
    this.carS = this.vars.v0 * t + 0.5 * this.vars.a * (t ** 2);

    // Save history for graphs
    if (this.renderer.isPlaying && time <= this.vars.tMax) {
      this.history.push({ t, v: this.carV, s: this.carS });
    }
  }

  draw(ctx, w, h, time, zoom) {
    const t = Math.min(time, this.vars.tMax);
    
    // Road & ground level
    const groundY = h - 140;
    
    // Road drawing
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, groundY, w, 60);
    
    // Curb border lines
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.moveTo(0, groundY + 60);
    ctx.lineTo(w, groundY + 60);
    ctx.stroke();

    // Dash lane markers (moving left based on time creates illusion of motion or distance)
    ctx.strokeStyle = "#F1F5F9";
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, groundY + 30);
    ctx.lineTo(w, groundY + 30);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Scale horizontal motion: map carS (from 0 to sMax) to window bounds
    const startX = 100;
    const endX = w - 120;
    const trackWidth = endX - startX;
    
    // Position of car
    const ratio = this.sMax > 0 ? (this.carS / this.sMax) : 0;
    const currentCarX = startX + ratio * trackWidth;

    // Start/End vertical flags
    ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, groundY - 40);
    ctx.lineTo(startX, groundY);
    ctx.stroke();
    ctx.fillStyle = "#EF4444";
    ctx.font = "10px monospace";
    ctx.fillText(`START (v₀ = ${this.vars.v0} m/s)`, startX - 25, groundY - 45);

    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
    ctx.beginPath();
    ctx.moveTo(endX, groundY - 40);
    ctx.lineTo(endX, groundY);
    ctx.stroke();
    ctx.fillStyle = "#10B981";
    ctx.fillText(`END (${this.vars.tMax} s)`, endX - 15, groundY - 45);

    // DRAW THE CAR (streamlined futuristic vehicle with neon glow)
    this.drawCar(ctx, currentCarX, groundY - 35);

    // VECTOR ARROWS (above the car)
    // 1. Velocity Arrow (Orange) - proportional to speed
    const vLength = 20 + this.carV * 2;
    this.drawVectorArrow(ctx, currentCarX, groundY - 75, vLength, 0, "#F59E0B", `v = ${this.carV.toFixed(1)} m/s`);
    
    // 2. Acceleration Arrow (Teal)
    const aLength = 30 + Math.abs(this.vars.a) * 10;
    const aAngle = this.vars.a >= 0 ? 0 : Math.PI; // point left if decelerating
    this.drawVectorArrow(ctx, currentCarX, groundY - 100, aLength, aAngle, "#06B6D4", `a = ${this.vars.a.toFixed(1)} m/s²`);

    // DRAW SPEEDOMETER DIAL & ANALOG GAUGES (Top Left corner)
    this.drawSpeedometer(ctx, 80, 80, this.carV);

    // DRAW TELEMETRY INFO (Bottom-left corner)
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(10, h - 70, 220, 60);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, h - 70, 220, 60);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Time Elapsed  : ${t.toFixed(2)} / ${this.vars.tMax} s`, 20, h - 52);
    ctx.fillText(`Velocity (v)  : ${this.carV.toFixed(2)} m/s`, 20, h - 37);
    ctx.fillText(`Distance (s)  : ${this.carS.toFixed(2)} m`, 20, h - 22);

    // DRAW MINI REAL-TIME GRAPHS (Bottom-right panel)
    this.drawGraphs(ctx, w - 280, h - 120, 260, 100);
  }

  drawCar(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Car Body Shadow / Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#3B82F6";

    // Main base body
    ctx.fillStyle = "#3B82F6";
    ctx.beginPath();
    ctx.roundRect(-35, 10, 70, 20, 6);
    ctx.fill();

    // Cabin dome
    ctx.fillStyle = "#60A5FA";
    ctx.beginPath();
    ctx.moveTo(-20, 10);
    ctx.lineTo(-12, -4);
    ctx.lineTo(12, -4);
    ctx.lineTo(20, 10);
    ctx.closePath();
    ctx.fill();

    // Windshield detail
    ctx.fillStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(-5, -1);
    ctx.lineTo(10, -1);
    ctx.lineTo(15, 8);
    ctx.closePath();
    ctx.fill();

    // Wheels (no-shadow for mechanical realism)
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0F172A";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;

    // Rear wheel
    ctx.beginPath();
    ctx.arc(-20, 28, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Front wheel
    ctx.beginPath();
    ctx.arc(20, 28, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hubcap silver centers
    ctx.fillStyle = "#94A3B8";
    ctx.beginPath();
    ctx.arc(-20, 28, 3, 0, Math.PI * 2);
    ctx.arc(20, 28, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawVectorArrow(ctx, x, y, length, angle, color, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    // Line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(length, 0);
    ctx.lineTo(length - 8, -5);
    ctx.lineTo(length - 8, 5);
    ctx.closePath();
    ctx.fill();

    // Text label
    ctx.rotate(-angle); // Keep text horizontal
    ctx.font = "bold 10px monospace";
    ctx.fillText(label, length / 2 - 20, -8);

    ctx.restore();
  }

  drawSpeedometer(ctx, cx, cy, val) {
    const radius = 45;
    
    // Draw background outer ring
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    // Colorful active speed arc
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Map value to angle
    const maxVal = Math.max(30, this.vars.v0 + Math.abs(this.vars.a) * this.vars.tMax * 1.5);
    const speedRatio = Math.min(1, Math.max(0, val / maxVal));
    const endAngle = Math.PI * 0.8 + speedRatio * (Math.PI * 1.4);
    ctx.arc(cx, cy, radius, Math.PI * 0.8, endAngle);
    ctx.stroke();

    // Needle dial
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(endAngle);
    ctx.strokeStyle = "#EF4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(radius - 8, 0);
    ctx.stroke();
    ctx.restore();

    // Speed value text
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${val.toFixed(1)}`, cx, cy + 12);
    ctx.font = "8px monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText(`m/s`, cx, cy + 24);
  }

  drawGraphs(ctx, x, y, width, height) {
    // Draw Graph Background Card
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Dynamic Plots", x + 8, y + 15);

    // Two split sub-panels
    const subW = width / 2 - 12;
    const subH = height - 32;

    // 1. v-t Graph (Velocity-Time)
    const vGraphX = x + 8;
    const vGraphY = y + 24;
    this.drawSubGraph(ctx, vGraphX, vGraphY, subW, subH, "v-t (m/s)", this.history.map(pt => ({ x: pt.t, y: pt.v })), this.vars.tMax, this.vars.v0 + Math.abs(this.vars.a) * this.vars.tMax * 1.2, "#F59E0B");

    // 2. s-t Graph (Distance-Time)
    const sGraphX = x + width / 2 + 4;
    const sGraphY = y + 24;
    this.drawSubGraph(ctx, sGraphX, sGraphY, subW, subH, "s-t (m)", this.history.map(pt => ({ x: pt.t, y: pt.s })), this.vars.tMax, this.sMax * 1.2, "#3B82F6");
  }

  drawSubGraph(ctx, gx, gy, gw, gh, title, points, maxX, maxY, color) {
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = "#1E293B";
    ctx.strokeRect(gx, gy, gw, gh);

    // Title label
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "8px monospace";
    ctx.textAlign = "left";
    ctx.fillText(title, gx + 4, gy + 10);

    if (points.length < 2) return;

    // Scale axes mapping
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    points.forEach((pt, idx) => {
      const px = gx + (pt.x / maxX) * gw;
      const py = gy + gh - (pt.y / (maxY || 1)) * gh;

      if (idx === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });
    ctx.stroke();
  }

  play() { this.renderer.start(); }
  pause() { this.renderer.pause(); }
  reset() {
    this.history = [];
    this.renderer.reset();
  }
}

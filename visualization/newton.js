/**
 * PhysiViz AI - Newton's Second Law on Inclined Plane Concept Lab Animation
 * Features: Inclined ramp with dynamic angle theta, sliding box mass,
 * proportional Free Body Diagram (FBD) force arrows (Weight W, Normal N, Friction f, Pull F, and Net Force),
 * real-time equations of motion tracking.
 */

import { PhysicsRenderer } from "./renderer.js";

export class NewtonVisualizer {
  constructor(container, vars) {
    this.container = container;
    
    // Core physical variables
    this.m = vars.massa !== undefined ? parseFloat(vars.massa) : 10;
    this.thetaDeg = vars.sudut !== undefined ? parseFloat(vars.sudut) : 30;
    this.F_pull = vars.gaya !== undefined ? parseFloat(vars.gaya) : 80;
    this.g = 10; // gravity acceleration constant
    
    // Friction coefficient (default or extracted)
    this.mu = vars.gesekan !== undefined ? parseFloat(vars.gesekan) : 0.2;

    this.thetaRad = (this.thetaDeg * Math.PI) / 180;

    // Forces calculation on inclined plane:
    // W = m * g
    this.W = this.m * this.g;
    
    // Components of W
    this.W_parallel = this.W * Math.sin(this.thetaRad);
    this.W_perp = this.W * Math.cos(this.thetaRad);
    
    // Normal Force: N = W_perp
    this.N = this.W_perp;

    // Friction Force max limit: f_static_max = mu * N
    this.f_max = this.mu * this.N;

    // Let's determine motion direction and resulting net force
    // F_net = F_pull - W_parallel (assuming F_pull is applied parallel, pointing up-ramp)
    const netApplied = this.F_pull - this.W_parallel;
    
    if (Math.abs(netApplied) <= this.f_max) {
      // Static equilibrium (no motion)
      this.f_friction = netApplied; // balancing friction
      this.F_net = 0;
      this.a = 0;
    } else {
      // Kinetic motion occurs
      this.f_friction = Math.sign(netApplied) * this.f_max;
      this.F_net = netApplied - this.f_friction;
      this.a = this.F_net / this.m;
    }

    this.boxDistance = 120; // current position along ramp (pixels)
    this.velocity = 0;

    this.init();
  }

  init() {
    this.renderer = new PhysicsRenderer(this.container, {
      onUpdate: (dt, time) => this.update(dt, time),
      onDraw: (ctx, w, h, time, zoom) => this.draw(ctx, w, h, time, zoom)
    });
  }

  update(dt, time) {
    if (!this.renderer.isPlaying) return;

    // Update kinematics along the inclined ramp axis
    this.velocity += this.a * dt;
    this.boxDistance += this.velocity * dt * 30; // Scale to pixels/sec

    // Boundaries check to keep box on the ramp length (e.g. 100px to 450px)
    if (this.boxDistance < 50) {
      this.boxDistance = 50;
      this.velocity = 0;
    } else if (this.boxDistance > 450) {
      this.boxDistance = 450;
      this.velocity = 0;
    }
  }

  draw(ctx, w, h, time, zoom) {
    const originX = 100;
    const originY = h - 80;
    const rampLength = 500;

    // End points of the inclined plane triangle
    const endX = originX + rampLength * Math.cos(this.thetaRad);
    const endY = originY - rampLength * Math.sin(this.thetaRad);

    // Draw the structural triangle ramp
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, originY);
    ctx.lineTo(endX, endY);
    ctx.closePath();
    ctx.fill();

    // Draw Ramp Border Line
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw Ground surface baseline
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.stroke();

    // Draw Angle symbol indicator arc
    ctx.fillStyle = "rgba(79, 70, 229, 0.15)";
    ctx.beginPath();
    ctx.moveTo(endX, originY);
    ctx.arc(endX, originY, 45, Math.PI, Math.PI + this.thetaRad, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#A5B4FC";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`θ = ${this.thetaDeg.toFixed(0)}°`, endX - 85, originY - 15);

    // Calculate box drawing coordinates along the incline slope
    const boxX = endX - this.boxDistance * Math.cos(this.thetaRad);
    const boxY = originY - this.boxDistance * Math.sin(this.thetaRad);

    // Draw sliding box block with rotation matching the slope
    ctx.save();
    ctx.translate(boxX, boxY);
    ctx.rotate(-this.thetaRad);

    const boxWidth = 60;
    const boxHeight = 40;

    // Draw the box
    ctx.fillStyle = "#7C3AED";
    ctx.strokeStyle = "#A78BFA";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-boxWidth / 2, -boxHeight, boxWidth, boxHeight, 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${this.m} kg`, 0, -boxHeight / 2 + 3);

    // FREE BODY DIAGRAM VECTOR FORCE ARROWS (Originate from box center)
    const centerOfMassY = -boxHeight / 2;
    const forceScale = 0.8; // Scaling factor for force arrows length in pixels

    // 1. Normal Force N (Perpendicular to slope upwards, cyan)
    const nLength = Math.max(20, this.N * forceScale);
    this.drawArrow(ctx, 0, centerOfMassY, 0, -nLength, "#06B6D4", `N = ${this.N.toFixed(1)}N`);

    // 2. Pull Force F (Parallel to slope up-ramp, green)
    const fPullLength = Math.max(20, this.F_pull * forceScale);
    this.drawArrow(ctx, 0, centerOfMassY, fPullLength, 0, "#10B981", `F = ${this.F_pull.toFixed(1)}N`);

    // 3. Friction Force f (Parallel to slope down-ramp, red)
    const frictionVal = Math.abs(this.f_friction);
    const fLength = Math.max(15, frictionVal * forceScale);
    const frictionAngle = this.f_friction >= 0 ? Math.PI : 0;
    this.drawArrow(ctx, 0, centerOfMassY, Math.cos(frictionAngle) * fLength, Math.sin(frictionAngle) * fLength, "#EF4444", `f = ${frictionVal.toFixed(1)}N`);

    // 4. Gravity Force / Weight W (Points straight downwards, orange)
    // Needs to rotate back by thetaRad to make it perfectly vertical
    ctx.save();
    ctx.translate(0, centerOfMassY);
    ctx.rotate(this.thetaRad);
    const wLength = Math.max(20, this.W * forceScale);
    this.drawArrow(ctx, 0, 0, 0, wLength, "#F59E0B", `W = ${this.W.toFixed(1)}N`);
    ctx.restore();

    // 5. Resultant Net Force (Yellow)
    if (Math.abs(this.F_net) > 0.1) {
      const netLength = Math.max(20, Math.abs(this.F_net) * forceScale);
      const netDir = this.F_net > 0 ? 1 : -1;
      this.drawArrow(ctx, 0, centerOfMassY - 12, netDir * netLength, 0, "#EAB308", `F_net = ${this.F_net.toFixed(1)}N`);
    }

    ctx.restore();

    // Draw Telemetry data panel
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(10, 10, 260, 110);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 260, 110);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Net Acceleration (a) : ${this.a.toFixed(2)} m/s²`, 20, 30);
    ctx.fillText(`Gravitational W_par  : ${this.W_parallel.toFixed(1)} N`, 20, 50);
    ctx.fillText(`Ramp Normal Force (N): ${this.N.toFixed(1)} N`, 20, 70);
    ctx.fillText(`Surface Friction (f) : ${this.f_friction.toFixed(1)} N`, 20, 90);
    ctx.fillText(`Velocity (v)         : ${this.velocity.toFixed(2)} m/s`, 20, 110);
  }

  drawArrow(ctx, sx, sy, dx, dy, color, label) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    // Draw arrow point
    const angle = Math.atan2(dy, dx);
    ctx.translate(sx + dx, sy + dy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -3.5);
    ctx.lineTo(-6, 3.5);
    ctx.closePath();
    ctx.fill();

    // label tag text position
    ctx.rotate(-angle);
    ctx.font = "bold 9px monospace";
    ctx.fillText(label, 8, -4);

    ctx.restore();
  }

  play() { this.renderer.start(); }
  pause() { this.renderer.pause(); }
  reset() {
    this.boxDistance = 120;
    this.velocity = 0;
    this.renderer.reset();
  }
}

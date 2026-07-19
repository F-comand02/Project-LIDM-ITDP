/**
 * PhysiViz AI - Pascal's Hydraulic Principle Concept Lab Animation
 * Features: Metallic hydraulic jacks, incompressible shifting liquid levels,
 * dual piston displacement linked by area ratio (A1 * dy1 = A2 * dy2),
 * and real-time pressure balance gauges proving P1 = P2.
 */

import { PhysicsRenderer } from "./renderer.js";

export class PascalVisualizer {
  constructor(container, vars) {
    this.container = container;
    
    // Core physical variables
    this.F1 = vars.F1 !== undefined ? parseFloat(vars.F1) : 10;
    this.A1 = vars.A1 !== undefined ? parseFloat(vars.A1) : 5;
    this.A2 = vars.A2 !== undefined ? parseFloat(vars.A2) : 100;
    
    // Derived values
    this.ratio = this.A2 / this.A1;
    this.F2 = this.F1 * this.ratio;
    
    // Pascal's Pressure balance
    this.P1 = this.F1 / this.A1;
    this.P2 = this.F2 / this.A2;

    this.stroke = 0; // Displacement percentage of input piston

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

    // Shift piston over time
    this.stroke += dt * 15; // Speed multiplier for stroke rate

    if (this.stroke > 100) {
      this.stroke = 100; // Cap at maximum limit
      this.renderer.pause();
    }
  }

  draw(ctx, w, h, time, zoom) {
    const bottomY = h - 100;
    
    // Dimensions of hydraulic chambers
    const chamberLeftX = w * 0.25;
    const chamberRightX = w * 0.7;
    const baseWidth = chamberRightX - chamberLeftX;
    
    const w1 = 45; // Width of small cylinder (A1 representation)
    const w2 = 140; // Width of large cylinder (A2 representation)
    const chamberHeight = 160;

    // Draw Shifting Fluid background (Bright Blue)
    // The fluid heights represent incompressible displacement volumes
    const maxDy1 = 70; // Maximum displacement for left piston in pixels
    const dy1 = (this.stroke / 100) * maxDy1;
    const dy2 = dy1 / this.ratio; // Piston 2 shifts up proportionally

    const fluidY1 = bottomY - 100 + dy1;
    const fluidY2 = bottomY - 100 - dy2;

    ctx.fillStyle = "#2563EB";
    ctx.globalAlpha = 0.85;

    // Left fluid cylinder columns
    ctx.fillRect(chamberLeftX - w1/2, fluidY1, w1, bottomY - fluidY1);
    // Connecting bottom channel tube
    ctx.fillRect(chamberLeftX, bottomY - 30, baseWidth, 30);
    // Right fluid cylinder columns
    ctx.fillRect(chamberRightX - w2/2, fluidY2, w2, bottomY - fluidY2);

    ctx.globalAlpha = 1.0;

    // Draw Metal Chamber Walls (Overlay on top of fluid)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    
    // Left cylinder outline
    ctx.moveTo(chamberLeftX - w1/2, bottomY - chamberHeight);
    ctx.lineTo(chamberLeftX - w1/2, bottomY);
    ctx.lineTo(chamberLeftX + w1/2, bottomY);
    ctx.lineTo(chamberLeftX + w1/2, bottomY - chamberHeight);
    
    // Right cylinder outline
    ctx.moveTo(chamberRightX - w2/2, bottomY - chamberHeight);
    ctx.lineTo(chamberRightX - w2/2, bottomY);
    ctx.lineTo(chamberRightX + w2/2, bottomY);
    ctx.lineTo(chamberRightX + w2/2, bottomY - chamberHeight);
    
    ctx.stroke();

    // Draw the actual Pistons (metallic grey caps)
    ctx.fillStyle = "#64748B";
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 2;
    
    // Piston 1
    ctx.beginPath();
    ctx.roundRect(chamberLeftX - w1/2 - 2, fluidY1 - 10, w1 + 4, 12, 3);
    ctx.fill();
    ctx.stroke();
    // Piston 1 central shaft rod
    ctx.fillRect(chamberLeftX - 3, fluidY1 - 50, 6, 40);

    // Piston 2
    ctx.beginPath();
    ctx.roundRect(chamberRightX - w2/2 - 2, fluidY2 - 10, w2 + 4, 12, 3);
    ctx.fill();
    ctx.stroke();
    // Piston 2 central shaft rod
    ctx.fillRect(chamberRightX - 6, fluidY2 - 50, 12, 40);

    // DRAW INPUT FORCE VECTOR F1 (Red arrow pushing down on piston 1)
    const arrowY1 = fluidY1 - 55;
    this.drawArrow(ctx, chamberLeftX, arrowY1 - 40, 0, 35, "#EF4444", `F₁ = ${this.F1}N`);

    // DRAW OUTPUT FORCE VECTOR F2 (Green arrow pushing up from piston 2)
    const arrowY2 = fluidY2 - 15;
    this.drawArrow(ctx, chamberRightX, arrowY2, 0, -50, "#10B981", `F₂ = ${this.F2.toFixed(1)}N`);

    // Area labels text tags
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`A₁ = ${this.A1} cm²`, chamberLeftX, bottomY + 22);
    ctx.fillText(`A₂ = ${this.A2} cm²`, chamberRightX, bottomY + 22);

    // PRESSURE EQUILIBRIUM INDICATOR METERS
    this.drawPressureMeter(ctx, chamberLeftX, bottomY - 180, this.P1, "P₁");
    this.drawPressureMeter(ctx, chamberRightX, bottomY - 180, this.P2, "P₂");

    // Telemetry board card
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(10, 10, 250, 95);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 250, 95);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Pressure Balance  : P₁ = P₂`, 20, 30);
    ctx.fillText(`Calculated P₁     : ${this.P1.toFixed(3)} N/cm²`, 20, 50);
    ctx.fillText(`Calculated P₂     : ${this.P2.toFixed(3)} N/cm²`, 20, 70);
    ctx.fillText(`Area Ratio A₂/A₁  : ${this.ratio.toFixed(1)}x multiplier`, 20, 90);
  }

  drawArrow(ctx, sx, sy, dx, dy, color, label) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    const angle = Math.atan2(dy, dx);
    ctx.translate(sx + dx, sy + dy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fill();

    ctx.rotate(-angle);
    ctx.font = "bold 11px monospace";
    ctx.fillText(label, 8, -4);

    ctx.restore();
  }

  drawPressureMeter(ctx, cx, cy, pressure, label) {
    // Elegant tiny bar-graph or circular gauge indicator
    const w = 60;
    const h = 10;
    
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(cx - w/2, cy, w, h);
    
    // Fill gauge bar based on value
    ctx.fillStyle = "#3B82F6";
    const fillWidth = Math.min(w, (pressure / 2.0) * w);
    ctx.fillRect(cx - w/2, cy, fillWidth, h);

    ctx.strokeStyle = "#475569";
    ctx.strokeRect(cx - w/2, cy, w, h);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${label}: ${pressure.toFixed(2)} N/cm²`, cx, cy - 6);
  }

  play() { this.renderer.start(); }
  pause() { this.renderer.pause(); }
  reset() {
    this.stroke = 0;
    this.renderer.reset();
  }
}

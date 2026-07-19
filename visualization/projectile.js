/**
 * PhysiViz AI - Projectile Motion Concept Lab Animation
 * Features: Ball projectile, dotted path trails, real-time updated vx/vy vectors,
 * gravity constant downward vector, launch angle indicator, H_max and R_max markers.
 */

import { PhysicsRenderer } from "./renderer.js";

export class ProjectileVisualizer {
  constructor(container, vars) {
    this.container = container;
    
    // Core parameters from expert system
    this.v0 = vars.v0 !== undefined ? parseFloat(vars.v0) : 20;
    this.thetaDeg = vars.sudut !== undefined ? parseFloat(vars.sudut) : 45;
    this.g = vars.g !== undefined ? parseFloat(vars.g) : 10;

    this.thetaRad = (this.thetaDeg * Math.PI) / 180;
    
    // Derived metrics
    this.vx0 = this.v0 * Math.cos(this.thetaRad);
    this.vy0 = this.v0 * Math.sin(this.thetaRad);
    
    // Maximum altitude and range
    this.H = (this.v0 ** 2 * Math.sin(this.thetaRad) ** 2) / (2 * this.g);
    this.R = (this.v0 ** 2 * Math.sin(2 * this.thetaRad)) / this.g;
    this.totalTime = (2 * this.v0 * Math.sin(this.thetaRad)) / this.g;

    this.ballX = 0;
    this.ballY = 0;
    this.vx = this.vx0;
    this.vy = this.vy0;
    this.trail = [];
    this.isFinished = false; // Flag to indicate if simulation has completed

    this.init();
  }

  init() {
    this.renderer = new PhysicsRenderer(this.container, {
      onUpdate: (dt, time) => this.update(dt, time),
      onDraw: (ctx, w, h, time, zoom) => this.draw(ctx, w, h, time, zoom)
    });
  }

  update(dt, time) {
    // Jika tombol reset ditekan atau waktu kembali ke 0, kembalikan seluruh state ke awal
    if (time === 0) {
      this.isFinished = false;
      this.ballX = 0;
      this.ballY = 0;
      this.vx = this.vx0;
      this.vy = this.vy0;
      this.trail = [];
      return;
    }

    // Jika simulasi sudah selesai, hentikan kalkulasi frame berikutnya
    if (this.isFinished) return;

    let t = time;

    // DEBUG VALIDATION: Jika t melewati Flight Time, langsung posisikan di tanah rEnd dan hentikan animasi
    if (t >= this.totalTime) {
      this.isFinished = true;
      this.ballY = 0;
      this.ballX = this.R;
      this.vx = 0; // Set Vx ke 0 saat mendarat
      this.vy = 0; // Set Vy ke 0 saat mendarat
      this.renderer.time = this.totalTime; // Set waktu tepat ke total flight time
      this.renderer.pause();

      // Perbarui tombol kontrol menjadi tombol Replay secara dinamis
      const btn = document.getElementById("ctrl-play-pause");
      if (btn) {
        btn.innerHTML = `<i class="fas fa-rotate-left"></i> <span>Replay</span>`;
      }
      return;
    }

    // Persamaan fisika gerak parabola standar kurikulum sekolah menengah:
    // Posisi horizontal: x = v0 cos(θ) × t
    this.ballX = this.vx0 * t;
    // Posisi vertikal: y = v0 sin(θ) × t − ½ g t²
    this.ballY = this.vy0 * t - 0.5 * this.g * (t ** 2);

    // DEBUG VALIDATION: Jika posisi Y di bawah tanah, set Y = 0 dan kunci posisi
    if (this.ballY < 0) {
      this.ballY = 0;
    }

    // GROUND COLLISION: Deteksi tabrakan dengan tanah jika waktu sudah berjalan
    if (t > 0.01 && this.ballY <= 0) {
      this.isFinished = true;
      this.ballY = 0;
      this.ballX = this.R;
      this.vx = 0; // Set Vx ke 0 saat mendarat
      this.vy = 0; // Set Vy ke 0 saat mendarat
      this.renderer.time = this.totalTime; // Kunci waktu ke total flight time
      this.renderer.pause();

      const btn = document.getElementById("ctrl-play-pause");
      if (btn) {
        btn.innerHTML = `<i class="fas fa-rotate-left"></i> <span>Replay</span>`;
      }
      return;
    }

    // Menghitung kecepatan instan vx dan vy
    this.vx = this.vx0;
    this.vy = this.vy0 - this.g * t;

    // TRAIL: Hanya catat lintasan koordinat selama gerakan aktif di udara (0 <= t <= Flight Time)
    if (this.renderer.isPlaying && t <= this.totalTime) {
      this.trail.push({ x: this.ballX, y: this.ballY });
    }
  }

  draw(ctx, w, h, time, zoom) {
    const t = Math.min(time, this.totalTime);
    
    // Bottom ground level line
    const groundY = h - 60;
    const startX = 80;

    // Scaling factors to fit within bounds nicely (map maximum range R to screen width - padding)
    const paddingX = 160;
    const paddingY = 120;
    const scaleX = (w - paddingX) / (this.R || 1);
    // Use scaleX for proportional vertical rendering as well
    const scaleY = scaleX;

    // Draw Ground surface
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, groundY, w, 60);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    // Coordinate origin mapping function
    const toScreen = (mx, my) => {
      return {
        x: startX + mx * scaleX,
        y: groundY - my * scaleY
      };
    };

    // Draw the launcher angle indicator (transparent arc)
    const origin = toScreen(0, 0);
    ctx.fillStyle = "rgba(79, 70, 229, 0.15)";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.arc(origin.x, origin.y, 40, -this.thetaRad, 0, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#A5B4FC";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${this.thetaDeg.toFixed(0)}°`, origin.x + 45, origin.y - 15);

    // Draw maximum range marker
    const rEnd = toScreen(this.R, 0);
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(rEnd.x, rEnd.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`R_max = ${this.R.toFixed(2)}m`, rEnd.x - 40, rEnd.y + 20);

    // Draw maximum height indicator (Peak of parabola)
    const hPeak = toScreen(this.R / 2, this.H);
    ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(hPeak.x, hPeak.y);
    ctx.lineTo(hPeak.x, groundY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#8B5CF6";
    ctx.beginPath();
    ctx.arc(hPeak.x, hPeak.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`H_max = ${this.H.toFixed(2)}m`, hPeak.x - 35, hPeak.y - 12);

    // Draw the Trajectory Path Trail
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    this.trail.forEach((pt, idx) => {
      const sPt = toScreen(pt.x, pt.y);
      if (idx === 0) ctx.moveTo(sPt.x, sPt.y);
      else ctx.lineTo(sPt.x, sPt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Projectile Ball
    const currentBallPos = toScreen(this.ballX, this.ballY);
    ctx.fillStyle = "#EC4899";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#EC4899";
    ctx.beginPath();
    ctx.arc(currentBallPos.x, currentBallPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // VECTOR ARROWS ON PROJECTILE
    // 1. Horizontal velocity vector vx (Green) - updates strictly halt on landing (cleared/not drawn)
    const isLanded = time >= this.totalTime || this.isFinished;
    const vxArrowLen = isLanded ? 0 : (30 + this.vx * 0.8);
    if (!isLanded && vxArrowLen > 0) {
      this.drawVectorArrow(ctx, currentBallPos.x, currentBallPos.y, vxArrowLen, 0, "#10B981", "vx");
    }

    // 2. Vertical velocity vector vy (Red) - updates strictly halt on landing (cleared/not drawn)
    const vyArrowLen = isLanded ? 0 : (Math.abs(this.vy) * 1.5);
    const vyAngle = this.vy >= 0 ? -Math.PI / 2 : Math.PI / 2;
    if (!isLanded && vyArrowLen > 5) {
      this.drawVectorArrow(ctx, currentBallPos.x, currentBallPos.y, vyArrowLen, vyAngle, "#EF4444", "vy");
    }

    // 3. Constant Gravity vector indicator (Downwards)
    const gravityArrowX = w - 60;
    const gravityArrowY = 60;
    this.drawVectorArrow(ctx, gravityArrowX, gravityArrowY, 30, Math.PI / 2, "#06B6D4", "g");

    // Draw Telemetry data card
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(10, h - 150, 240, 140);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, h - 150, 240, 140);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 11px monospace";

    const displayTime = this.isFinished ? this.totalTime : t;
    const displayX = this.isFinished ? this.R : this.ballX;
    const displayY = this.isFinished ? 0 : this.ballY;
    const displayVx = isLanded ? 0 : this.vx;
    const displayVy = isLanded ? 0 : this.vy;
    const statusStr = this.isFinished ? "Finished" : (this.renderer.isPlaying ? "Running" : "Paused");
    const statusColor = this.isFinished ? "#10B981" : (this.renderer.isPlaying ? "#3B82F6" : "#E2E8F0");

    ctx.fillText(`Flight Time  : ${this.totalTime.toFixed(2)} s`, 20, h - 132);
    ctx.fillText(`Current Time : ${displayTime.toFixed(2)} s`, 20, h - 114);
    ctx.fillText(`X            : ${displayX.toFixed(1)} m`, 20, h - 96);
    ctx.fillText(`Y            : ${displayY.toFixed(1)} m`, 20, h - 78);
    ctx.fillText(`Vx           : ${displayVx.toFixed(1)} m/s`, 20, h - 60);
    ctx.fillText(`Vy           : ${displayVy.toFixed(1)} m/s`, 20, h - 42);
    
    ctx.fillText(`Status       : `, 20, h - 24);
    ctx.fillStyle = statusColor;
    ctx.fillText(statusStr, 110, h - 24);
  }

  drawVectorArrow(ctx, x, y, length, angle, color, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    // Stem line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    // Pointy arrowhead
    ctx.beginPath();
    ctx.moveTo(length, 0);
    ctx.lineTo(length - 6, -3.5);
    ctx.lineTo(length - 6, 3.5);
    ctx.closePath();
    ctx.fill();

    // label text tag
    ctx.rotate(-angle);
    ctx.font = "bold 9px monospace";
    ctx.fillText(label, length * 0.7, -6);

    ctx.restore();
  }

  play() {
    if (this.isFinished) {
      this.resetSimulation();
    }
    this.renderer.start();
  }

  pause() {
    this.renderer.pause();
  }

  reset() {
    this.resetSimulation();
  }

  resetSimulation() {
    this.isFinished = false;
    this.ballX = 0;
    this.ballY = 0;
    this.vx = this.vx0;
    this.vy = this.vy0;
    this.trail = [];
    this.renderer.reset();
    const btn = document.getElementById("ctrl-play-pause");
    if (btn) {
      btn.innerHTML = `<i class="fas fa-play"></i> <span>Mulai</span>`;
    }
  }
}

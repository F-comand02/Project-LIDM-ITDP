/**
 * PhysiViz AI - Canvas and Interactive Animation Renderer
 * Handles HTML5 Canvas initialization, responsive resizing, coordinate grids,
 * standard animation loops (play, pause, reset, speed), zoom levels, and scale calculations.
 */

export class PhysicsRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      gridColor: "#1E293B",
      bgColor: "#090D16",
      fps: 60,
      onUpdate: () => {},
      onDraw: () => {},
      ...options
    };

    this.isPlaying = false;
    this.time = 0; // Simulation time in seconds
    this.speed = 1.0;
    this.zoom = 1.0;
    this.lastTimestamp = 0;
    this.rafId = null;

    this.initCanvas();
    this.initResizeObserver();
  }

  initCanvas() {
    // Check if a canvas already exists
    this.canvas = this.container.querySelector("canvas");
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.className = "w-full h-full block rounded-2xl";
      this.canvas.style.backgroundColor = this.options.bgColor;
      this.container.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext("2d");
    this.resize();
  }

  initResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;
      // Wrap in requestAnimationFrame to avoid "ResizeObserver loop completed with undelivered notifications"
      requestAnimationFrame(() => {
        this.resize();
      });
    });
    this.resizeObserver.observe(this.container);
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    
    // Check if dimensions actually changed to avoid layout feedback loops
    if (this.width !== undefined && this.height !== undefined &&
        Math.abs(this.width - rect.width) < 1 && Math.abs(this.height - rect.height) < 1) {
      return;
    }
    
    // Set display size (css pixels)
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // Set actual resolution (taking devicePixelRatio into account for sharpness)
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // Normalize coordinate system
    this.ctx.scale(dpr, dpr);
    
    // Redraw if not playing
    if (!this.isPlaying) {
      this.draw();
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  reset() {
    this.pause();
    this.time = 0;
    this.lastTimestamp = 0;
    this.options.onUpdate(0);
    this.draw();
  }

  setSpeed(val) {
    this.speed = parseFloat(val) || 1.0;
  }

  setZoom(val) {
    this.zoom = parseFloat(val) || 1.0;
    if (!this.isPlaying) this.draw();
  }

  loop(timestamp) {
    if (!this.isPlaying) return;

    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const delta = (timestamp - this.lastTimestamp) / 1000; // in seconds
    this.lastTimestamp = timestamp;

    // Advance time with Speed factor
    this.time += delta * this.speed;

    this.options.onUpdate(delta * this.speed, this.time);
    this.draw();

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw Space Grid background for elegant tech visualizer feel
    this.drawGrid();

    // Call custom draw callback
    this.ctx.save();
    this.options.onDraw(this.ctx, this.width, this.height, this.time, this.zoom);
    this.ctx.restore();
  }

  drawGrid() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.strokeStyle = this.options.gridColor;
    ctx.lineWidth = 1;
    
    // Draw 40px grid
    const gridSize = 40 * this.zoom;
    
    ctx.beginPath();
    for (let x = 0; x < w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Draw coordinate axis guides
    ctx.strokeStyle = "rgba(79, 70, 229, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, h);
    ctx.moveTo(0, h - 40);
    ctx.lineTo(w, h - 40);
    ctx.stroke();
  }

  destroy() {
    this.pause();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

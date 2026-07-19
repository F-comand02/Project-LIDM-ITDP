/**
 * PhysiViz AI - Interactive Animation Manager
 * Routes the parsed AI Result Object to the correct Concept Lab simulation.
 * Dynamically builds a beautiful UI Control Tray (Play, Pause, Reset, Speed, Zoom, Fullscreen)
 * and initializes/manages the active physical visualizer.
 */

export class AnimationManager {
  constructor(container, result) {
    // Safely dispose of any previous visualizer to prevent WebGL memory leaks and ghost render loops
    if (window.activeVisualizerManager && window.activeVisualizerManager.currentVisualizer) {
      const prev = window.activeVisualizerManager.currentVisualizer;
      if (typeof prev.dispose === "function") {
        try {
          prev.dispose();
        } catch (err) {
          console.warn("Failed to dispose previous visualizer:", err);
        }
      } else if (prev.renderer && typeof prev.renderer.destroy === "function") {
        try {
          prev.renderer.destroy();
        } catch (err) {
          console.warn("Failed to destroy previous renderer:", err);
        }
      }
    }

    this.container = container;
    this.result = result;
    this.currentVisualizer = null;

    this.init();
  }

  init() {
    // 1. Clear the target container completely
    this.container.innerHTML = "";
    this.container.className = "relative w-full h-full min-h-[360px] bg-[#090D16] rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800";

    // 2. Create the Canvas/Visualization Stage viewport
    this.stage = document.createElement("div");
    this.stage.className = "relative w-full flex-grow overflow-hidden";
    this.container.appendChild(this.stage);

    // 3. Create the control bar container
    this.controlsContainer = document.createElement("div");
    this.controlsContainer.className = "w-full p-3 bg-slate-950 border-t border-slate-900 flex flex-wrap gap-4 items-center justify-between text-xs font-mono text-slate-350 z-20";
    this.container.appendChild(this.controlsContainer);

    // 4. Inject the correct Visualizer based on Topic Case
    this.launchVisualizer();

    // 5. Inject the Interactive Control Tray buttons
    this.buildControlTray();
  }

  async launchVisualizer() {
    const topicId = this.detectTopicId(this.result.topic);
    const vars = this.result.variables || {};

    // Show dynamic loading state
    const stageLoading = document.createElement("div");
    stageLoading.className = "absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 bg-[#090D16] z-10";
    stageLoading.innerHTML = `
      <div class="spinner-mini animate-spin h-6 w-6 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
      <span class="text-xs font-mono">Loading simulator module...</span>
    `;
    this.stage.appendChild(stageLoading);

    try {
      switch (topicId) {
        case "glbb": {
          const { GLBBVisualizer } = await import("./glbb.js");
          this.currentVisualizer = new GLBBVisualizer(this.stage, vars);
          break;
        }

        case "parabola": {
          const { ProjectileVisualizer } = await import("./projectile.js");
          this.currentVisualizer = new ProjectileVisualizer(this.stage, vars);
          break;
        }

        case "newton": {
          const { NewtonVisualizer } = await import("./newton.js");
          this.currentVisualizer = new NewtonVisualizer(this.stage, vars);
          break;
        }

        case "pascal": {
          const { PascalVisualizer } = await import("./pascal.js");
          this.currentVisualizer = new PascalVisualizer(this.stage, vars);
          break;
        }

        case "gelombang": {
          const { WaveVisualizer } = await import("./wave.js");
          this.currentVisualizer = new WaveVisualizer(this.stage, vars);
          break;
        }

        case "kirchhoff": {
          const { CircuitVisualizer } = await import("./circuit.js");
          this.currentVisualizer = new CircuitVisualizer(this.stage, vars);
          break;
        }

        case "lorentz": {
          console.log("Lorentz requested. Dynamically loading Three.js and Lorentz renderer...");
          const { LorentzRenderer } = await import("./lorentz/lorentzRenderer.js");
          this.currentVisualizer = new LorentzRenderer(this.stage, vars);
          break;
        }

        default: {
          const { GLBBVisualizer } = await import("./glbb.js");
          this.currentVisualizer = new GLBBVisualizer(this.stage, vars);
          break;
        }
      }
    } catch (err) {
      console.error("Failed to dynamically load visualizer:", err);
      stageLoading.innerHTML = `
        <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        <span class="text-xs font-mono text-red-400">Failed to load module.</span>
      `;
      return;
    } finally {
      if (stageLoading.parentNode) {
        stageLoading.parentNode.removeChild(stageLoading);
      }
    }
  }

  detectTopicId(topicName) {
    if (!topicName) return "glbb";
    const name = topicName.toLowerCase();
    if (name.includes("glbb") || name.includes("lurus berubah")) return "glbb";
    if (name.includes("parabola") || name.includes("proyektil")) return "parabola";
    if (name.includes("newton") || name.includes("hukum ii")) return "newton";
    if (name.includes("pascal") || name.includes("hidrolik")) return "pascal";
    if (name.includes("gelombang") || name.includes("wave")) return "gelombang";
    if (name.includes("kirchhoff") || name.includes("arus")) return "kirchhoff";
    if (name.includes("lorentz") || name.includes("gaya magnet")) return "lorentz";
    return "glbb";
  }

  buildControlTray() {
    // Inject highly polished interactive control elements
    this.controlsContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <button id="ctrl-play-pause" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer">
          <i class="fas fa-play"></i> <span>Mulai</span>
        </button>
        <button id="ctrl-reset" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer">
          <i class="fas fa-rotate-left"></i> <span>Reset</span>
        </button>
      </div>

      <div class="flex items-center gap-4 flex-wrap">
        <!-- Speed Multiplier -->
        <div class="flex items-center gap-2">
          <span>Speed:</span>
          <select id="ctrl-speed" class="bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-1 text-xs outline-none cursor-pointer">
            <option value="0.5">0.5x</option>
            <option value="1.0" selected>1.0x (Normal)</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>

        <!-- Zoom Slider -->
        <div class="flex items-center gap-2">
          <span>Zoom:</span>
          <input id="ctrl-zoom" type="range" min="0.5" max="1.5" step="0.1" value="1.0" class="w-20 h-1 bg-slate-850 rounded appearance-none cursor-pointer accent-indigo-500">
        </div>

        <!-- Fullscreen Button -->
        <button id="ctrl-fullscreen" class="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition cursor-pointer" title="Fullscreen">
          <i class="fas fa-expand"></i>
        </button>
      </div>
    `;

    // Connect events to active Visualizer
    const playPauseBtn = this.controlsContainer.querySelector("#ctrl-play-pause");
    const resetBtn = this.controlsContainer.querySelector("#ctrl-reset");
    const speedSelect = this.controlsContainer.querySelector("#ctrl-speed");
    const zoomSlider = this.controlsContainer.querySelector("#ctrl-zoom");
    const fullscreenBtn = this.controlsContainer.querySelector("#ctrl-fullscreen");

    playPauseBtn.addEventListener("click", () => {
      const isPlaying = this.currentVisualizer.isPlaying || (this.currentVisualizer.renderer && this.currentVisualizer.renderer.isPlaying);
      if (isPlaying) {
        this.currentVisualizer.pause();
        playPauseBtn.innerHTML = `<i class="fas fa-play"></i> <span>Mulai</span>`;
      } else {
        this.currentVisualizer.play();
        playPauseBtn.innerHTML = `<i class="fas fa-pause"></i> <span>Jeda</span>`;
      }
    });

    resetBtn.addEventListener("click", () => {
      this.currentVisualizer.reset();
      playPauseBtn.innerHTML = `<i class="fas fa-play"></i> <span>Mulai</span>`;
    });

    speedSelect.addEventListener("change", (e) => {
      const speed = parseFloat(e.target.value);
      if (this.currentVisualizer.renderer) {
        this.currentVisualizer.renderer.setSpeed(speed);
      } else if (typeof this.currentVisualizer.setSpeed === "function") {
        this.currentVisualizer.setSpeed(speed);
      }
    });

    zoomSlider.addEventListener("input", (e) => {
      const zoom = parseFloat(e.target.value);
      if (this.currentVisualizer.renderer) {
        this.currentVisualizer.renderer.setZoom(zoom);
      } else if (typeof this.currentVisualizer.setZoom === "function") {
        this.currentVisualizer.setZoom(zoom);
      }
    });

    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        this.container.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // Handle SVG specific speed scaling if CircuitVisualizer is active
    const topicId = this.detectTopicId(this.result.topic);
    if (topicId === "kirchhoff") {
      // Speed dropdown multiplier changes SVG animation timing
      speedSelect.addEventListener("change", (e) => {
        const speed = parseFloat(e.target.value);
        this.currentVisualizer.I_masuk = (this.result.variables.I_masuk || 10) * speed;
        this.currentVisualizer.I1 = (this.result.variables.I1 || 4) * speed;
        this.currentVisualizer.I2 = this.currentVisualizer.I_masuk - this.currentVisualizer.I1;
        this.currentVisualizer.resetElectrons();
      });
      
      // Zoom changes SVG viewBox scale dynamically
      zoomSlider.addEventListener("input", (e) => {
        const zoom = parseFloat(e.target.value);
        const baseW = 800;
        const baseH = 400;
        const w = baseW / zoom;
        const h = baseH / zoom;
        const dx = (baseW - w) / 2;
        const dy = (baseH - h) / 2;
        this.currentVisualizer.svg.setAttribute("viewBox", `${dx} ${dy} ${w} ${h}`);
      });
    }
  }

  setupLorentzVisualizer(stage, vars) {
    // Beautiful dedicated Canvas implementation for Lorentz Magnetic Force
    const B = vars.B !== undefined ? parseFloat(vars.B) : 4;
    const I = vars.arus !== undefined ? parseFloat(vars.arus) : 5;
    const L = vars.L !== undefined ? parseFloat(vars.L) : 2;
    const theta = vars.sudut !== undefined ? parseFloat(vars.sudut) : 90;
    
    // F = B * I * L * sin(theta)
    const F = B * I * L * Math.sin((theta * Math.PI) / 180);

    const container = stage;
    const rendererClass = {
      isPlaying: false,
      renderer: null,
      time: 0,
      play() { this.renderer.start(); },
      pause() { this.renderer.pause(); },
      reset() { this.renderer.reset(); },
      init() {
        const PhysicsRendererModule = this.rendererModule;
        this.renderer = new PhysicsRendererModule(container, {
          onUpdate: (dt, time) => { this.time = time; },
          onDraw: (ctx, w, h, time, zoom) => {
            const centerY = h / 2;
            const startX = 120;
            const wireLen = w - 240;

            // Draw uniform magnetic fields (crosses representing field lines entering page '⊗')
            ctx.strokeStyle = "#1E3A8A";
            ctx.lineWidth = 1.5;
            for (let x = 100; x < w - 100; x += 100) {
              for (let y = 80; y < h - 80; y += 80) {
                ctx.beginPath();
                ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6);
                ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6);
                ctx.stroke();
              }
            }

            // Magnetic label text tag
            ctx.fillStyle = "#3B82F6";
            ctx.font = "bold 11px monospace";
            ctx.fillText(`Uniform Magnetic Field B = ${B} T (⊗ entering page)`, 100, 40);

            // Draw copper Wire Conductor
            ctx.strokeStyle = "#D97706";
            ctx.lineWidth = 12;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(startX, centerY);
            ctx.lineTo(startX + wireLen, centerY);
            ctx.stroke();

            ctx.fillStyle = "#F59E0B";
            ctx.font = "bold 10px monospace";
            ctx.fillText(`Conductor Wire (L = ${L}m)`, startX, centerY - 12);

            // DRAW ELECTRICAL CURRENT VECTOR I (Red arrow pointing right)
            const arrowLen = 120;
            ctx.strokeStyle = "#EF4444";
            ctx.fillStyle = "#EF4444";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX - arrowLen/2, centerY);
            ctx.lineTo(centerX + arrowLen/2, centerY);
            ctx.stroke();
            
            // Current Arrowhead
            ctx.beginPath();
            ctx.moveTo(centerX + arrowLen/2, centerY);
            ctx.lineTo(centerX + arrowLen/2 - 8, centerY - 5);
            ctx.lineTo(centerX + arrowLen/2 - 8, centerY + 5);
            ctx.closePath();
            ctx.fill();
            ctx.font = "bold 11px monospace";
            ctx.fillText(`Current I = ${I} A`, centerX - 35, centerY + 24);

            // DRAW LORENTZ FORCE VECTOR F (Upwards green arrow with dynamic hum vibration)
            const centerX = w / 2;
            const fArrowLen = 40 + F * 3;
            // Hum / vibration scale based on wave time
            const hum = 1.0 + 0.05 * Math.sin(time * 15);
            const activeLen = fArrowLen * hum;

            ctx.strokeStyle = "#10B981";
            ctx.fillStyle = "#10B981";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 6);
            ctx.lineTo(centerX, centerY - activeLen);
            ctx.stroke();

            // Force Arrowhead
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - activeLen);
            ctx.lineTo(centerX - 6, centerY - activeLen + 10);
            ctx.lineTo(centerX + 6, centerY - activeLen + 10);
            ctx.closePath();
            ctx.fill();

            ctx.font = "bold 12px monospace";
            ctx.fillText(`F_Lorentz = ${F.toFixed(1)} N`, centerX + 12, centerY - activeLen + 15);

            // Draw Info Card
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.fillRect(10, h - 80, 240, 70);
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 1;
            ctx.strokeRect(10, h - 80, 240, 70);

            ctx.fillStyle = "#E2E8F0";
            ctx.font = "bold 11px monospace";
            ctx.fillText(`Lorentz Electromagnetic Force`, 20, h - 60);
            ctx.fillText(`F_L = B · I · L · sin(θ)`, 20, h - 42);
            ctx.fillText(`Calculated Force : ${F.toFixed(2)} N`, 20, h - 24);
          }
        });
      }
    };

    // Inject active class mapping
    import("./renderer.js").then((mod) => {
      rendererClass.rendererModule = mod.PhysicsRenderer;
      rendererClass.init();
    });

    return rendererClass;
  }
}

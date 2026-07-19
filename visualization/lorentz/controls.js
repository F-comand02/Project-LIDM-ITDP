export class LorentzControls {
  constructor(parentContainer, physicsInstance, sceneInstance, onDirectionChange) {
    this.parentContainer = parentContainer;
    this.physics = physicsInstance;
    this.scene = sceneInstance;
    this.onDirectionChange = onDirectionChange;

    this.initLayout();
    this.bindEvents();
  }

  initLayout() {
    // We split the parentContainer into:
    // 1. Canvas Container (left/top)
    // 2. Control/Info Sidebar (right/bottom)
    
    this.parentContainer.className = "w-full h-full flex flex-col md:flex-row bg-[#080C14] overflow-hidden";
    
    // Create Canvas Viewport Wrapper
    this.canvasWrapper = document.createElement("div");
    this.canvasWrapper.id = "lorentz-canvas-wrapper";
    this.canvasWrapper.className = "relative flex-grow h-[350px] md:h-full";
    this.parentContainer.appendChild(this.canvasWrapper);

    // Create Sidebar
    this.sidebar = document.createElement("div");
    this.sidebar.id = "lorentz-sidebar";
    this.sidebar.className = "w-full md:w-[350px] md:min-w-[320px] bg-slate-950/90 md:border-l border-slate-900 p-5 overflow-y-auto flex flex-col gap-6 font-sans text-slate-250 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent z-10 text-sm";
    this.parentContainer.appendChild(this.sidebar);

    // Build Sidebar Content
    this.sidebar.innerHTML = `
      <!-- Title Badge -->
      <div>
        <span class="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold">
          ⚡ 3D ELECTROMAGNETIC LAB
        </span>
        <h3 class="font-sans font-bold text-lg text-white mt-2 leading-tight">Laboratorium Gaya Lorentz</h3>
        <p class="text-xs text-slate-400 mt-1">Interaksi arah arus listrik, medan magnet, dan gaya mekanik.</p>
      </div>

      <!-- Controls Panel -->
      <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80 flex flex-col gap-4">
        <h4 class="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">Arah Vektor Input</h4>
        
        <!-- Current Direction -->
        <div class="flex justify-between items-center gap-2">
          <label class="font-medium text-xs text-slate-300 flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Arah Arus Listrik (I):
          </label>
          <select id="sel-dir-i" class="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none font-mono cursor-pointer hover:border-slate-700 transition">
            <option value="+X" ${this.physics.currentDirName === "+X" ? "selected" : ""}>Sumbu +X (Kanan)</option>
            <option value="-X" ${this.physics.currentDirName === "-X" ? "selected" : ""}>Sumbu -X (Kiri)</option>
            <option value="+Y" ${this.physics.currentDirName === "+Y" ? "selected" : ""}>Sumbu +Y (Atas)</option>
            <option value="-Y" ${this.physics.currentDirName === "-Y" ? "selected" : ""}>Sumbu -Y (Bawah)</option>
            <option value="+Z" ${this.physics.currentDirName === "+Z" ? "selected" : ""}>Sumbu +Z (Keluar)</option>
            <option value="-Z" ${this.physics.currentDirName === "-Z" ? "selected" : ""}>Sumbu -Z (Masuk)</option>
          </select>
        </div>

        <!-- Magnetic Field Direction -->
        <div class="flex justify-between items-center gap-2">
          <label class="font-medium text-xs text-slate-300 flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Medan Magnet (B):
          </label>
          <select id="sel-dir-b" class="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none font-mono cursor-pointer hover:border-slate-700 transition">
            <option value="+X" ${this.physics.magneticDirName === "+X" ? "selected" : ""}>Sumbu +X (Kanan)</option>
            <option value="-X" ${this.physics.magneticDirName === "-X" ? "selected" : ""}>Sumbu -X (Kiri)</option>
            <option value="+Y" ${this.physics.magneticDirName === "+Y" ? "selected" : ""}>Sumbu +Y (Atas)</option>
            <option value="-Y" ${this.physics.magneticDirName === "-Y" ? "selected" : ""}>Sumbu -Y (Bawah)</option>
            <option value="+Z" ${this.physics.magneticDirName === "+Z" ? "selected" : ""}>Sumbu +Z (Keluar)</option>
            <option value="-Z" ${this.physics.magneticDirName === "-Z" ? "selected" : ""}>Sumbu -Z (Masuk)</option>
          </select>
        </div>
      </div>

      <!-- Live Telemetry Card -->
      <div class="bg-slate-900/30 rounded-xl p-4 border border-slate-800/60 flex flex-col gap-3">
        <h4 class="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">Telemetri & Kalkulasi</h4>
        
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-900">
            <div class="text-slate-450 font-mono text-[10px]">KUAT ARUS (I)</div>
            <div class="font-mono font-bold text-amber-400 mt-0.5 text-sm">${this.physics.I_mag} Ampere</div>
          </div>
          <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-900">
            <div class="text-slate-450 font-mono text-[10px]">MEDAN MAGNET (B)</div>
            <div class="font-mono font-bold text-blue-400 mt-0.5 text-sm">${this.physics.B_mag} Tesla</div>
          </div>
        </div>

        <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-900 flex justify-between items-center">
          <div>
            <div class="text-slate-450 font-mono text-[10px] uppercase">Gaya Lorentz Hasil (F_L)</div>
            <div id="side-force-value" class="font-mono font-black text-rose-500 text-base mt-0.5">${this.physics.F_mag.toFixed(2)} N</div>
          </div>
          <div class="text-right">
            <div class="text-slate-450 font-mono text-[10px] uppercase">Arah Sumbu</div>
            <div id="side-force-dir" class="font-mono font-bold text-rose-400 mt-0.5 text-sm">Sumbu ${this.physics.forceDirName}</div>
          </div>
        </div>
      </div>

      <!-- Visibility Controls -->
      <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80 flex flex-col gap-2.5">
        <h4 class="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Visual Options</h4>
        
        <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input type="checkbox" id="chk-hand" checked class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer">
          <span>Kaidah Tangan Kanan 3D</span>
        </label>

        <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input type="checkbox" id="chk-axis" checked class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer">
          <span>Sistem Koordinat Kartesius</span>
        </label>

        <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input type="checkbox" id="chk-grid" checked class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer">
          <span>Grid Lantai Referensi</span>
        </label>

        <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input type="checkbox" id="chk-labels" checked class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer">
          <span>Tampilkan Label Teks (I, B, F)</span>
        </label>
      </div>

      <!-- Helper Buttons -->
      <div class="grid grid-cols-2 gap-2">
        <button id="btn-reset-cam" class="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer">
          <i class="fas fa-camera"></i> Reset Camera
        </button>
        <button id="btn-reset-sim" class="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-lg border border-slate-850 flex items-center justify-center gap-1.5 transition cursor-pointer">
          <i class="fas fa-rotate"></i> Reset Sim
        </button>
      </div>

      <!-- Educational Corner -->
      <div class="border-t border-slate-900 pt-5">
        <h4 class="font-sans font-bold text-sm text-white flex items-center gap-2 mb-2">
          <i class="fas fa-graduation-cap text-indigo-400"></i> Kaidah Tangan Kanan
        </h4>
        <p class="text-xs text-slate-400 leading-relaxed">
          Kaidah ini adalah cara intuitif untuk mengingat orientasi gaya Lorentz:
        </p>
        <ul class="text-xs text-slate-400 flex flex-col gap-2 mt-2 pl-1">
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></span>
            <span><strong>Ibu Jari (Thumb):</strong> Menunjukkan arah Arus Listrik (<strong>I</strong>).</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>
            <span><strong>Jari Telunjuk (Index):</strong> Menunjukkan arah Medan Magnet (<strong>B</strong>).</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></span>
            <span><strong>Jari Tengah (Middle):</strong> Menunjukkan arah Gaya Lorentz (<strong>F_L</strong>).</span>
          </li>
        </ul>
        <div class="bg-slate-950 p-3 rounded-lg border border-slate-900 mt-4 text-center">
          <div class="text-indigo-400 font-mono font-bold text-xs">F_L = B · I · L · sin(θ)</div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Dropdowns
    const selI = this.sidebar.querySelector("#sel-dir-i");
    const selB = this.sidebar.querySelector("#sel-dir-b");

    const onSelectChange = () => {
      const iVal = selI.value;
      const bVal = selB.value;
      this.physics.setDirections(iVal, bVal);
      this.updateTelemetryUI();
      if (this.onDirectionChange) {
        this.onDirectionChange();
      }
    };

    selI.addEventListener("change", onSelectChange);
    selB.addEventListener("change", onSelectChange);

    // Reset Camera Button
    const btnResCam = this.sidebar.querySelector("#btn-reset-cam");
    btnResCam.addEventListener("click", () => {
      this.scene.resetCamera();
    });

    // Reset Simulation Button
    const btnResSim = this.sidebar.querySelector("#btn-reset-sim");
    btnResSim.addEventListener("click", () => {
      this.physics.initElectrons();
      this.physics.time = 0;
    });
  }

  updateTelemetryUI() {
    const valF = this.sidebar.querySelector("#side-force-value");
    const dirF = this.sidebar.querySelector("#side-force-dir");

    if (valF) valF.textContent = `${this.physics.F_mag.toFixed(2)} N`;
    if (dirF) dirF.textContent = `Sumbu ${this.physics.forceDirName}`;
  }
}

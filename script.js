/**
 * PhysiViz AI - Interactive Physics Visualizer Script
 * Simulated AI analysis engine with dynamic math parsing and interactive SVG physics simulations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  const heroBtn = document.getElementById('hero-start-btn');
  const inputSection = document.getElementById('input-section');
  const textarea = document.getElementById('soal-textarea');
  const analyzeBtn = document.getElementById('btn-analyze');
  const resetBtn = document.getElementById('btn-reset');
  const tryAnotherBtn = document.getElementById('btn-try-another');
  
  const exampleGlbb = document.getElementById('example-glbb');
  const exampleNewton = document.getElementById('example-newton');
  const exampleEnergi = document.getElementById('example-energi');
  
  const loadingSection = document.getElementById('loading-section');
  const resultSection = document.getElementById('result-section');
  const alertContainer = document.getElementById('alert-container');
  const alertMessage = document.getElementById('alert-message');

  // --- Dynamic Result Cards ---
  const txtConceptBadge = document.getElementById('concept-badge');
  const txtConceptName = document.getElementById('concept-name');
  const txtConceptDesc = document.getElementById('concept-desc');
  
  const listKnown = document.getElementById('list-known');
  const txtTargetVariable = document.getElementById('target-variable');
  
  const txtFormulaDisplay = document.getElementById('formula-display');
  const listFormulaVariables = document.getElementById('formula-variables');
  
  const physicsCanvas = document.getElementById('physics-canvas');
  const listSteps = document.getElementById('list-steps');
  const txtFinalResult = document.getElementById('final-result');

  // --- State Variables ---
  let activeSimulationInterval = null;

  // --- Initialize Lucide Icons ---
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- Mobile Menu Toggle ---
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // --- Scroll to Input Section ---
  if (heroBtn && inputSection) {
    heroBtn.addEventListener('click', () => {
      inputSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => textarea.focus(), 800);
    });
  }

  // --- Sample Questions Injection ---
  const sampleTexts = {
    glbb: "Sebuah mobil bergerak dengan kecepatan awal 10 m/s dan mengalami percepatan 2 m/s² selama 5 detik. Berapakah kecepatan akhirnya?",
    newton: "Sebuah kotak bermassa 5 kg ditarik dengan gaya sebesar 20 N di atas permukaan lantai yang licin. Berapakah percepatan yang dialami kotak tersebut?",
    energi: "Sebuah kelapa bermassa 2 kg jatuh dari pohonnya yang memiliki ketinggian 10 meter. Jika percepatan gravitasi g = 10 m/s², berapakah energi potensial kelapa sebelum jatuh?"
  };

  exampleGlbb.addEventListener('click', (e) => {
    e.preventDefault();
    textarea.value = sampleTexts.glbb;
    clearAlert();
  });

  exampleNewton.addEventListener('click', (e) => {
    e.preventDefault();
    textarea.value = sampleTexts.newton;
    clearAlert();
  });

  exampleEnergi.addEventListener('click', (e) => {
    e.preventDefault();
    textarea.value = sampleTexts.energi;
    clearAlert();
  });

  // --- Alert System ---
  function showAlert(msg) {
    alertMessage.textContent = msg;
    alertContainer.classList.remove('hidden');
    inputSection.scrollIntoView({ behavior: 'smooth' });
  }

  function clearAlert() {
    alertContainer.classList.add('hidden');
  }

  // --- Simple AI Extraction Parser ---
  function analyzeQuestionText(text) {
    const textLower = text.toLowerCase();
    
    // 1. Detect Concept
    let concept = null;
    
    const glbbKeywords = ['kecepatan', 'percepatan', 'cepat', 'perlambatan', 'detik', 'sekon', 'bergerak', 'glbb', 'v0', 'vt', 'jarak'];
    const newtonKeywords = ['gaya', 'massa', 'newton', 'hukum ii newton', 'hukum 2 newton', 'ditarik', 'beban', 'f =', 'kg', 'f=ma'];
    const energiKeywords = ['energi', 'potensial', 'tinggi', 'ketinggian', 'kelapa', 'pohon', 'gravitasi', 'ep', 'mgh', 'meter', 'm'];

    // Scoring to find best fit
    let glbbScore = countKeywords(textLower, glbbKeywords);
    let newtonScore = countKeywords(textLower, newtonKeywords);
    let energiScore = countKeywords(textLower, energiKeywords);

    // Prioritize by score
    if (glbbScore > 0 && glbbScore >= newtonScore && glbbScore >= energiScore) {
      concept = 'glbb';
    } else if (newtonScore > 0 && newtonScore >= glbbScore && newtonScore >= energiScore) {
      concept = 'newton';
    } else if (energiScore > 0 && energiScore >= glbbScore && energiScore >= newtonScore) {
      concept = 'energi';
    } else {
      // General fallbacks based on specific keyword presence
      if (textLower.includes('kecepatan') || textLower.includes('m/s')) {
        concept = 'glbb';
      } else if (textLower.includes('gaya') || textLower.includes(' n ') || textLower.includes('newton')) {
        concept = 'newton';
      } else if (textLower.includes('energi') || textLower.includes('tinggi') || textLower.includes('meter')) {
        concept = 'energi';
      }
    }

    if (!concept) return null;

    // 2. Variable Extraction
    const parsedVariables = {};

    if (concept === 'glbb') {
      // Extract v0 (kecepatan awal)
      // Matches "kecepatan awal 10", "kecepatan awal sebesar 10", "kecepatan awal = 10" or general velocity format "10 m/s"
      const v0Match = textLower.match(/(?:kecepatan\s+awal|v0)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)/i) || 
                      textLower.match(/(\d+(?:\.\d+)?)\s*m\/s(?!\^|²|\s*2)/i);
      parsedVariables.v0 = v0Match ? parseFloat(v0Match[1]) : 10;

      // Extract a (percepatan)
      const aMatch = textLower.match(/(?:percepatan|a)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)/i) ||
                     textLower.match(/(\d+(?:\.\d+)?)\s*(?:m\/s\^2|m\/s²|m\/s2)/i);
      parsedVariables.a = aMatch ? parseFloat(aMatch[1]) : 2;

      // Extract t (waktu)
      const tMatch = textLower.match(/(?:selama|waktu|t)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)\s*(?:detik|sekon|s\b)/i) ||
                     textLower.match(/(\d+(?:\.\d+)?)\s*(?:detik|sekon|s\b)/i);
      parsedVariables.t = tMatch ? parseFloat(tMatch[1]) : 5;

    } else if (concept === 'newton') {
      // Extract m (massa)
      const mMatch = textLower.match(/(?:massa|m)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)\s*kg/i) ||
                     textLower.match(/(\d+(?:\.\d+)?)\s*kg/i);
      parsedVariables.m = mMatch ? parseFloat(mMatch[1]) : 5;

      // Extract F (gaya)
      const fMatch = textLower.match(/(?:gaya|f)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)\s*(?:n\b|newton)/i) ||
                     textLower.match(/(\d+(?:\.\d+)?)\s*(?:n\b|newton)/i);
      parsedVariables.f = fMatch ? parseFloat(fMatch[1]) : 20;

    } else if (concept === 'energi') {
      // Extract m (massa)
      const mMatch = textLower.match(/(?:massa|m)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)\s*kg/i) ||
                     textLower.match(/(\d+(?:\.\d+)?)\s*kg/i);
      parsedVariables.m = mMatch ? parseFloat(mMatch[1]) : 2;

      // Extract h (ketinggian)
      const hMatch = textLower.match(/(?:ketinggian|tinggi|h)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)\s*(?:meter|m\b)/i) ||
                     textLower.match(/(\d+(?:\.\d+)?)\s*(?:meter|m\b)/i);
      parsedVariables.h = hMatch ? parseFloat(hMatch[1]) : 10;

      // Extract g (gravitasi)
      const gMatch = textLower.match(/(?:gravitasi|g)\s*(?:sebesar|=)?\s*(\d+(?:\.\d+)?)/i) ||
                     textLower.match(/g\s*=\s*(\d+(?:\.\d+)?)/i);
      parsedVariables.g = gMatch ? parseFloat(gMatch[1]) : 10;
    }

    return {
      concept: concept,
      variables: parsedVariables
    };
  }

  function countKeywords(text, keywords) {
    let count = 0;
    keywords.forEach(kw => {
      if (text.includes(kw)) count++;
    });
    return count;
  }

  // --- Form Submit Handler ---
  analyzeBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      showAlert("Mohon masukkan soal cerita fisika terlebih dahulu.");
      return;
    }

    clearAlert();
    
    // 1. Show Loading State
    loadingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    
    // Clean up any running simulation interval
    if (activeSimulationInterval) {
      clearInterval(activeSimulationInterval);
    }

    // Scroll to Loading smoothly
    loadingSection.scrollIntoView({ behavior: 'smooth' });

    // 2. Process after 1.5 seconds simulation
    setTimeout(() => {
      const analysis = analyzeQuestionText(text);

      if (!analysis) {
        // Fallback for unrecognized questions
        loadingSection.classList.add('hidden');
        showAlert("Konsep fisika belum dapat dikenali. Coba gunakan contoh soal yang lebih sederhana atau tambahkan informasi fisika seperti kecepatan, massa, gaya, percepatan, waktu, atau ketinggian.");
        return;
      }

      // Populate layout and show results
      renderResults(analysis);
      
      loadingSection.classList.add('hidden');
      resultSection.classList.remove('hidden');
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  });

  // --- Reset UI Button ---
  resetBtn.addEventListener('click', () => {
    textarea.value = "";
    clearAlert();
    resultSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    
    if (activeSimulationInterval) {
      clearInterval(activeSimulationInterval);
    }
    
    inputSection.scrollIntoView({ behavior: 'smooth' });
  });

  // --- Try Another Button ---
  tryAnotherBtn.addEventListener('click', () => {
    textarea.value = "";
    clearAlert();
    resultSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    
    if (activeSimulationInterval) {
      clearInterval(activeSimulationInterval);
    }
    
    inputSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => textarea.focus(), 800);
  });

  // --- Render Results UI ---
  function renderResults(analysis) {
    const { concept, variables } = analysis;
    
    // Clean up any dynamic nodes first
    listKnown.innerHTML = "";
    listFormulaVariables.innerHTML = "";
    listSteps.innerHTML = "";

    if (concept === 'glbb') {
      const { v0, a, t } = variables;
      const vt = v0 + (a * t);

      // Card 1: Concept details
      txtConceptBadge.textContent = "Kinematika Gerak";
      txtConceptName.textContent = "Gerak Lurus Berubah Beraturan (GLBB)";
      txtConceptDesc.textContent = "GLBB adalah gerak lurus suatu objek di mana kecepatannya berubah secara beraturan terhadap waktu akibat percepatan konstan. Kecepatannya bertambah besar (dipercepat) atau bertambah kecil (diperlambat).";

      // Card 2: Given Info
      addKnownVariable("v₀ (Kecepatan Awal)", `${v0} m/s`);
      addKnownVariable("a (Percepatan)", `${a} m/s²`);
      addKnownVariable("t (Waktu Tempuh)", `${t} detik`);
      txtTargetVariable.innerHTML = `<span class="text-violet-400 font-medium font-display">vₜ</span> (Kecepatan Akhir Benda)`;

      // Card 3: Formula details
      txtFormulaDisplay.innerHTML = `v<sub>t</sub> = v<sub>0</sub> + a &bull; t`;
      addFormulaVariable("v<sub>t</sub>", "Kecepatan akhir benda (m/s)");
      addFormulaVariable("v<sub>0</sub>", "Kecepatan awal benda (m/s)");
      addFormulaVariable("a", "Percepatan konstan benda (m/s²)");
      addFormulaVariable("t", "Waktu tempuh benda (detik/s)");

      // Card 4: Physics Animation (SVG canvas generator)
      setupGlbbSimulation(v0, a, t, vt);

      // Card 5: Step by step
      addStep(1, "Identifikasi informasi yang diketahui dari soal cerita", `v₀ = ${v0} m/s, a = ${a} m/s², t = ${t} s`);
      addStep(2, "Gunakan rumus dasar kecepatan akhir pada Gerak Lurus Berubah Beraturan (GLBB)", `vₜ = v₀ + a &bull; t`);
      addStep(3, "Substitusikan nilai variabel yang diketahui ke dalam rumus", `vₜ = ${v0} + (${a} &bull; ${t})`);
      addStep(4, "Hitung hasil perkalian dalam tanda kurung terlebih dahulu, kemudian jumlahkan", `vₜ = ${v0} + ${a * t} <br> vₜ = ${vt} m/s`);

      // Card 6: Final Answer callout
      txtFinalResult.innerHTML = `Kecepatan akhir benda setelah bergerak adalah <span class="text-sky-400 font-bold">${vt} m/s</span>`;

    } else if (concept === 'newton') {
      const { m, f } = variables;
      const a = (f / m).toFixed(2);

      // Card 1: Concept details
      txtConceptBadge.textContent = "Dinamika Partikel";
      txtConceptName.textContent = "Hukum II Newton";
      txtConceptDesc.textContent = "Hukum II Newton menyatakan bahwa percepatan yang dihasilkan oleh gaya yang bekerja pada suatu benda berbanding lurus dengan besar gayanya, dan berbanding terbalik dengan massa benda tersebut.";

      // Card 2: Given Info
      addKnownVariable("m (Massa Benda)", `${m} kg`);
      addKnownVariable("F (Gaya yang Diberikan)", `${f} N (Newton)`);
      txtTargetVariable.innerHTML = `<span class="text-violet-400 font-medium font-display">a</span> (Percepatan Benda)`;

      // Card 3: Formula details
      txtFormulaDisplay.innerHTML = `a = F / m`;
      addFormulaVariable("a", "Percepatan benda (m/s²)");
      addFormulaVariable("F", "Gaya netto yang bekerja pada benda (Newton/N)");
      addFormulaVariable("m", "Massa total benda (kg)");

      // Card 4: Physics Animation
      setupNewtonSimulation(m, f, a);

      // Card 5: Step by step
      addStep(1, "Identifikasi massa benda dan gaya tarik yang diberikan pada soal", `m = ${m} kg, F = ${f} N`);
      addStep(2, "Gunakan persamaan Hukum II Newton untuk menentukan percepatan benda", `a = F / m`);
      addStep(3, "Substitusikan nilai gaya (F) dan massa (m) ke dalam rumus", `a = ${f} / ${m}`);
      addStep(4, "Lakukan pembagian untuk mendapatkan nilai percepatan konstan", `a = ${a} m/s²`);

      // Card 6: Final Answer callout
      txtFinalResult.innerHTML = `Percepatan konstan yang dialami kotak tersebut sebesar <span class="text-sky-400 font-bold">${a} m/s²</span>`;

    } else if (concept === 'energi') {
      const { m, h, g } = variables;
      const ep = m * g * h;

      // Card 1: Concept details
      txtConceptBadge.textContent = "Usaha & Energi";
      txtConceptName.textContent = "Energi Potensial Gravitasi";
      txtConceptDesc.textContent = "Energi Potensial Gravitasi adalah energi yang dimiliki oleh suatu benda karena pengaruh kedudukan atau ketinggiannya di dalam medan gravitasi bumi. Semakin tinggi letak benda, semakin besar energi potensialnya.";

      // Card 2: Given Info
      addKnownVariable("m (Massa Kelapa)", `${m} kg`);
      addKnownVariable("h (Ketinggian)", `${h} meter`);
      addKnownVariable("g (Percepatan Gravitasi)", `${g} m/s²`);
      txtTargetVariable.innerHTML = `<span class="text-violet-400 font-medium font-display">Eₚ</span> (Energi Potensial Benda)`;

      // Card 3: Formula details
      txtFormulaDisplay.innerHTML = `E<sub>p</sub> = m &bull; g &bull; h`;
      addFormulaVariable("E<sub>p</sub>", "Energi Potensial Gravitasi (Joule/J)");
      addFormulaVariable("m", "Massa benda (kg)");
      addFormulaVariable("g", "Percepatan gravitasi (m/s²)");
      addFormulaVariable("h", "Ketinggian dari acuan tanah (meter)");

      // Card 4: Physics Animation
      setupEnergiSimulation(m, h, g, ep);

      // Card 5: Step by step
      addStep(1, "Identifikasi massa benda, ketinggian posisi awal, dan besar percepatan gravitasi bumi", `m = ${m} kg, h = ${h} m, g = ${g} m/s²`);
      addStep(2, "Gunakan persamaan energi potensial gravitasi bumi", `Eₚ = m &bull; g &bull; h`);
      addStep(3, "Substitusikan seluruh nilai parameter yang diketahui ke dalam persamaan", `Eₚ = ${m} &bull; ${g} &bull; ${h}`);
      addStep(4, "Hitung hasil perkalian beruntun untuk mendapatkan total energi potensial dalam Joule", `Eₚ = ${ep} J (Joule)`);

      // Card 6: Final Answer callout
      txtFinalResult.innerHTML = `Energi potensial gravitasi kelapa sebelum terjatuh adalah sebesar <span class="text-sky-400 font-bold">${ep} Joule</span>`;
    }

    // Refresh icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // --- Helper to add lists ---
  function addKnownVariable(name, value) {
    const li = document.createElement('li');
    li.className = "flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80";
    li.innerHTML = `
      <span class="text-slate-400 text-sm font-sans">${name}</span>
      <span class="text-slate-100 font-medium font-mono">${value}</span>
    `;
    listKnown.appendChild(li);
  }

  function addFormulaVariable(symbol, description) {
    const div = document.createElement('div');
    div.className = "flex items-start space-x-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40";
    div.innerHTML = `
      <span class="text-violet-400 font-bold font-mono text-sm bg-violet-950/60 w-8 h-8 flex items-center justify-center rounded-md border border-violet-800/30 flex-shrink-0">${symbol}</span>
      <span class="text-slate-300 text-xs mt-1.5">${description}</span>
    `;
    listFormulaVariables.appendChild(div);
  }

  function addStep(num, desc, math) {
    const div = document.createElement('div');
    div.className = "flex items-start space-x-4 border-l-2 border-violet-500/40 pl-4 py-1";
    div.innerHTML = `
      <div class="flex-shrink-0 flex items-center justify-center bg-violet-600 text-white rounded-full w-7 h-7 font-bold text-sm shadow-md">${num}</div>
      <div class="flex-grow">
        <h4 class="text-slate-100 text-sm font-medium font-sans">${desc}</h4>
        <p class="text-sky-300 font-mono text-xs mt-1 bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800 inline-block">${math}</p>
      </div>
    `;
    listSteps.appendChild(div);
  }

  // --- Physics Simulations Controllers ---

  // 1. GLBB Car Simulation
  function setupGlbbSimulation(v0, a, t, vt) {
    physicsCanvas.innerHTML = `
      <div class="p-4 flex flex-col justify-between h-full min-h-[220px]">
        <div class="flex justify-between items-center">
          <div class="text-xs text-slate-400 font-display font-medium">Visualisasi: <span class="text-violet-400">Kecepatan & Percepatan GLBB</span></div>
          <div class="flex space-x-3 text-xs bg-slate-900/80 py-1 px-3 rounded-full border border-slate-800">
            <span class="font-mono text-sky-400">v₀ = ${v0} m/s</span>
            <span class="text-slate-600">|</span>
            <span class="font-mono text-violet-400">a = ${a} m/s²</span>
            <span class="text-slate-600">|</span>
            <span class="font-mono text-emerald-400">t = ${t}s</span>
          </div>
        </div>

        <!-- Animation track -->
        <div class="relative w-full h-24 bg-slate-950/80 rounded-xl border border-slate-800/60 overflow-hidden mt-2 grid-bg">
          <!-- Sky / Background guides -->
          <div class="absolute inset-0 flex items-center justify-around opacity-10 pointer-events-none">
            <div class="h-full w-[1px] bg-sky-400"></div>
            <div class="h-full w-[1px] bg-sky-400"></div>
            <div class="h-full w-[1px] bg-sky-400"></div>
          </div>

          <!-- Velocity vectors -->
          <div id="glbb-vector" class="absolute left-[10%] top-3 flex items-center space-x-2 transition-all duration-300 opacity-80">
            <div class="bg-sky-500/10 border border-sky-400/40 px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 flex items-center space-x-1">
              <span>Kecepatan (v):</span>
              <span id="speedometer-bubble" class="font-bold">${v0.toFixed(1)}</span><span>m/s</span>
            </div>
            <!-- Arrow -->
            <svg class="w-6 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </div>

          <!-- Car Container -->
          <div id="sim-car" class="absolute left-[10%] bottom-5 w-16 h-10 transition-all duration-300 transform -translate-x-1/2">
            <!-- Modern Styled Car SVG -->
            <svg class="w-full h-full text-sky-400 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" viewBox="0 0 64 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 18H58C61 18 62 20 62 22V28H2V22C2 20 3 18 4 18Z" fill="#0284c7" />
              <path d="M12 18L18 8H44L52 18H12Z" fill="#0ea5e9" opacity="0.8" />
              <rect x="18" y="10" width="10" height="6" fill="#38bdf8" />
              <rect x="32" y="10" width="10" height="6" fill="#38bdf8" />
              <!-- Wheels -->
              <circle cx="16" cy="28" r="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
              <circle cx="16" cy="28" r="2" fill="#e2e8f0" />
              <circle cx="48" cy="28" r="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
              <circle cx="48" cy="28" r="2" fill="#e2e8f0" />
            </svg>
          </div>

          <!-- Road floor -->
          <div class="absolute bottom-0 inset-x-0 h-5 bg-slate-900 border-t border-slate-700 flex items-center justify-around overflow-hidden">
            <div class="h-1.5 w-6 bg-slate-500 rounded"></div>
            <div class="h-1.5 w-6 bg-slate-500 rounded"></div>
            <div class="h-1.5 w-6 bg-slate-500 rounded"></div>
            <div class="h-1.5 w-6 bg-slate-500 rounded"></div>
            <div class="h-1.5 w-6 bg-slate-500 rounded"></div>
            <div class="h-1.5 w-6 bg-slate-500 rounded"></div>
          </div>
        </div>

        <!-- Dashboard / Controls -->
        <div class="flex justify-between items-center mt-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <div class="flex items-center space-x-3 pl-2">
            <!-- Digital Speedometer -->
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-display">Spidometer Live</span>
              <div class="flex items-baseline space-x-1">
                <span id="digital-speedometer" class="text-xl font-bold font-mono text-sky-400">0.0</span>
                <span class="text-[10px] text-slate-400 font-mono">m/s</span>
              </div>
            </div>
            <div class="h-8 w-[1px] bg-slate-800"></div>
            <!-- Timer -->
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-display">Waktu (t)</span>
              <div class="flex items-baseline space-x-1">
                <span id="sim-timer" class="text-xl font-bold font-mono text-emerald-400">0.0</span>
                <span class="text-[10px] text-slate-400 font-mono">detik</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button id="btn-play-glbb" class="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3 py-1.5 rounded-md font-sans font-medium transition flex items-center space-x-1 cursor-pointer">
              <i data-lucide="play" class="w-3.5 h-3.5"></i>
              <span>Mulai Animasi</span>
            </button>
            <button id="btn-reset-glbb" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-md font-sans font-medium transition flex items-center space-x-1 cursor-pointer">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Atur Ulang</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Re-create lucide icons for inside the canvas
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    const playBtn = document.getElementById('btn-play-glbb');
    const resetSimBtn = document.getElementById('btn-reset-glbb');
    const car = document.getElementById('sim-car');
    const vector = document.getElementById('glbb-vector');
    const speedometer = document.getElementById('digital-speedometer');
    const speedBubble = document.getElementById('speedometer-bubble');
    const simTimer = document.getElementById('sim-timer');

    speedometer.textContent = v0.toFixed(1);
    speedBubble.textContent = v0.toFixed(1);

    let isPlaying = false;

    // Play action
    playBtn.addEventListener('click', () => {
      if (isPlaying) return;
      isPlaying = true;
      playBtn.disabled = true;
      playBtn.classList.add('opacity-50', 'cursor-not-allowed');

      // Clear any previous interval
      if (activeSimulationInterval) clearInterval(activeSimulationInterval);

      // Trigger CSS translate animation
      car.style.transition = `left 3s cubic-bezier(0.25, 0.1, 0.25, 1)`;
      vector.style.transition = `left 3s cubic-bezier(0.25, 0.1, 0.25, 1)`;
      
      car.style.left = '80%';
      vector.style.left = '80%';

      // Live speed updating in step with 3s duration
      const startTime = performance.now();
      const duration = 3000; // 3 seconds

      activeSimulationInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const fraction = Math.min(elapsed / duration, 1);
        
        // Non-linear acceleration matching cubic-bezier
        // Approximate cubic-bezier(0.25, 0.1, 0.25, 1) ease curve for realistic speedometer feel
        const easeFraction = cubicBezierEase(fraction);
        
        const currentSpeed = v0 + (easeFraction * (vt - v0));
        const currentTimer = easeFraction * t;

        speedometer.textContent = currentSpeed.toFixed(1);
        speedBubble.textContent = currentSpeed.toFixed(1);
        simTimer.textContent = currentTimer.toFixed(1);

        if (fraction >= 1) {
          clearInterval(activeSimulationInterval);
          speedometer.textContent = vt.toFixed(1);
          speedBubble.textContent = vt.toFixed(1);
          simTimer.textContent = t.toFixed(1);
        }
      }, 16);
    });

    // Reset action
    resetSimBtn.addEventListener('click', () => {
      isPlaying = false;
      playBtn.disabled = false;
      playBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      
      if (activeSimulationInterval) {
        clearInterval(activeSimulationInterval);
      }

      car.style.transition = 'none';
      vector.style.transition = 'none';
      car.style.left = '10%';
      vector.style.left = '10%';
      
      speedometer.textContent = v0.toFixed(1);
      speedBubble.textContent = v0.toFixed(1);
      simTimer.textContent = "0.0";
    });
  }

  // Approximation helper of ease function
  function cubicBezierEase(t) {
    // Basic approximation of ease (cubic-bezier)
    return t * t * (3 - 2 * t);
  }

  // 2. Newton Force Simulation
  function setupNewtonSimulation(m, f, a) {
    physicsCanvas.innerHTML = `
      <div class="p-4 flex flex-col justify-between h-full min-h-[220px]">
        <div class="flex justify-between items-center">
          <div class="text-xs text-slate-400 font-display font-medium">Visualisasi: <span class="text-violet-400">Gaya & Massa (F = m &bull; a)</span></div>
          <div class="flex space-x-3 text-xs bg-slate-900/80 py-1 px-3 rounded-full border border-slate-800">
            <span class="font-mono text-sky-400">Massa (m) = ${m} kg</span>
            <span class="text-slate-600">|</span>
            <span class="font-mono text-violet-400">Gaya (F) = ${f} N</span>
            <span class="text-slate-600">|</span>
            <span class="font-mono text-emerald-400">Percepatan (a) = ${a} m/s²</span>
          </div>
        </div>

        <!-- Animation track -->
        <div class="relative w-full h-24 bg-slate-950/80 rounded-xl border border-slate-800/60 overflow-hidden mt-2 grid-bg">
          <!-- Force line arrows and labels -->
          <div id="newton-vector" class="absolute left-[20%] top-2 flex items-center space-x-1 transition-all duration-300 opacity-80">
            <!-- Force vector label -->
            <div class="bg-violet-500/10 border border-violet-400/40 px-2 py-0.5 rounded text-[10px] font-mono text-violet-400">
              Gaya F = ${f} N
            </div>
          </div>

          <!-- Pulling Rope (Visual connection line between box and puller) -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none">
            <path id="pull-rope" d="M 0 0 L 0 0" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3 3" />
          </svg>

          <!-- Crate and character container -->
          <div id="sim-newton-container" class="absolute left-[20%] bottom-5 flex items-end transition-all duration-300 transform -translate-x-1/2" style="width: 140px;">
            <!-- Heavy Crate -->
            <div class="relative w-14 h-14 bg-amber-800 border-2 border-amber-950 rounded-md flex flex-col items-center justify-center shadow-lg filter drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <!-- Wooden texture cross -->
              <div class="absolute inset-2 border border-amber-900 flex items-center justify-center">
                <span class="font-mono text-[10px] font-bold text-amber-100">${m} kg</span>
              </div>
              <div class="absolute inset-0 border-t border-b border-amber-900 opacity-40"></div>
            </div>

            <!-- Rope connector block inside SVG rope rendering -->
            <div class="w-10"></div>

            <!-- Simple stick figure character pulling -->
            <div class="w-10 h-16 flex flex-col justify-end">
              <svg class="w-full h-12 text-slate-100" viewBox="0 0 24 36" fill="none" stroke="currentColor" stroke-width="2">
                <!-- Head -->
                <circle cx="12" cy="6" r="4" fill="#020617" />
                <!-- Torso -->
                <line x1="12" y1="10" x2="10" y2="24" />
                <!-- Arms holding rope -->
                <line x1="10" y1="14" x2="1" y2="12" />
                <!-- Legs -->
                <line x1="10" y1="24" x2="6" y2="34" />
                <line x1="10" y1="24" x2="14" y2="34" />
              </svg>
            </div>
          </div>

          <!-- Ground Floor -->
          <div class="absolute bottom-0 inset-x-0 h-5 bg-slate-900 border-t border-slate-700 flex items-center justify-around overflow-hidden">
            <!-- Sleek floor particles to simulate motion -->
            <div class="h-[1px] w-full bg-slate-800"></div>
          </div>
        </div>

        <!-- Dashboard / Controls -->
        <div class="flex justify-between items-center mt-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <div class="flex items-center space-x-3 pl-2">
            <!-- Live Acceleration Meter -->
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-display">Percepatan Live</span>
              <div class="flex items-baseline space-x-1">
                <span id="newton-accel-val" class="text-xl font-bold font-mono text-violet-400">0.0</span>
                <span class="text-[10px] text-slate-400 font-mono">m/s²</span>
              </div>
            </div>
            <div class="h-8 w-[1px] bg-slate-800"></div>
            <!-- Speed indicator -->
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-display">Kecepatan</span>
              <div class="flex items-baseline space-x-1">
                <span id="newton-speed-val" class="text-xl font-bold font-mono text-sky-400">0.0</span>
                <span class="text-[10px] text-slate-400 font-mono">m/s</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button id="btn-play-newton" class="bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1.5 rounded-md font-sans font-medium transition flex items-center space-x-1 cursor-pointer">
              <i data-lucide="play" class="w-3.5 h-3.5"></i>
              <span>Mulai Tarik</span>
            </button>
            <button id="btn-reset-newton" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-md font-sans font-medium transition flex items-center space-x-1 cursor-pointer">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Atur Ulang</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    const playBtn = document.getElementById('btn-play-newton');
    const resetSimBtn = document.getElementById('btn-reset-newton');
    const container = document.getElementById('sim-newton-container');
    const vector = document.getElementById('newton-vector');
    const accelDisplay = document.getElementById('newton-accel-val');
    const speedDisplay = document.getElementById('newton-speed-val');
    const ropePath = document.getElementById('pull-rope');

    // Draw initial static rope
    function updateRope() {
      const containerRect = container.getBoundingClientRect();
      const parentRect = container.parentElement.getBoundingClientRect();
      
      // Compute relative positions
      const blockLeft = container.offsetLeft - (container.offsetWidth / 2) + 28; // Center of crate
      const armLeft = container.offsetLeft - (container.offsetWidth / 2) + 104; // Center of arm
      const yPos = 65; // Height relative to the frame
      
      ropePath.setAttribute('d', `M ${blockLeft} ${yPos} L ${armLeft} ${yPos - 20}`);
    }

    // Call update rope once loaded and after short tick to ensure styles are drawn
    setTimeout(updateRope, 50);

    let isPlaying = false;

    playBtn.addEventListener('click', () => {
      if (isPlaying) return;
      isPlaying = true;
      playBtn.disabled = true;
      playBtn.classList.add('opacity-50', 'cursor-not-allowed');

      if (activeSimulationInterval) clearInterval(activeSimulationInterval);

      // Slide container
      container.style.transition = `left 2.5s ease-in`;
      vector.style.transition = `left 2.5s ease-in`;
      
      container.style.left = '70%';
      vector.style.left = '70%';

      const startTime = performance.now();
      const duration = 2500; // 2.5 seconds

      activeSimulationInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const fraction = Math.min(elapsed / duration, 1);
        
        // Dynamic rope update as element moves
        updateRope();

        // Calculate velocity (v = a * t) where t is simulated up to 2.5s
        const simulatedTime = fraction * 2.5;
        const currentSpeed = parseFloat(a) * simulatedTime;

        accelDisplay.textContent = parseFloat(a).toFixed(1);
        speedDisplay.textContent = currentSpeed.toFixed(1);

        if (fraction >= 1) {
          clearInterval(activeSimulationInterval);
          accelDisplay.textContent = parseFloat(a).toFixed(1);
          speedDisplay.textContent = (parseFloat(a) * 2.5).toFixed(1);
        }
      }, 16);
    });

    resetSimBtn.addEventListener('click', () => {
      isPlaying = false;
      playBtn.disabled = false;
      playBtn.classList.remove('opacity-50', 'cursor-not-allowed');

      if (activeSimulationInterval) {
        clearInterval(activeSimulationInterval);
      }

      container.style.transition = 'none';
      vector.style.transition = 'none';
      container.style.left = '20%';
      vector.style.left = '20%';
      
      accelDisplay.textContent = "0.0";
      speedDisplay.textContent = "0.0";
      
      setTimeout(updateRope, 50);
    });

    // Handle window resize rope updates
    window.addEventListener('resize', updateRope);
  }

  // 3. Potential Energy Simulation
  function setupEnergiSimulation(m, h, g, ep) {
    physicsCanvas.innerHTML = `
      <div class="p-4 flex flex-col justify-between h-full min-h-[220px]">
        <div class="flex justify-between items-center">
          <div class="text-xs text-slate-400 font-display font-medium">Visualisasi: <span class="text-violet-400">Energi Potensial Gravitasi (Eₚ)</span></div>
          <div class="flex space-x-2 text-xs bg-slate-900/80 py-1 px-3 rounded-full border border-slate-800">
            <span class="font-mono text-sky-400">m = ${m} kg</span>
            <span class="text-slate-600">|</span>
            <span class="font-mono text-amber-400">h = ${h} m</span>
            <span class="text-slate-600">|</span>
            <span class="font-mono text-violet-400">Eₚ = ${ep} J</span>
          </div>
        </div>

        <!-- Simulation Grid layout: Left is physics fall track, Right is real-time energy conversion bars -->
        <div class="grid grid-cols-12 gap-3 mt-2 h-28">
          
          <!-- Fall Track (Col span 7) -->
          <div class="col-span-7 relative bg-slate-950/80 rounded-xl border border-slate-800/60 overflow-hidden grid-bg flex justify-between">
            <!-- Cliff / Tree Trunk -->
            <div class="w-6 h-full bg-gradient-to-r from-emerald-900 to-emerald-950 border-r border-emerald-800/50 relative">
              <!-- Leaf clusters -->
              <div class="absolute -top-1 -left-2 w-10 h-6 bg-emerald-700 rounded-full opacity-60"></div>
              <div class="absolute top-2 -right-1 w-8 h-5 bg-emerald-600 rounded-full opacity-45"></div>
            </div>

            <!-- Falling Ball/Coconut Container -->
            <div id="sim-coconut" class="absolute left-12 top-[15%] w-7 h-7 bg-amber-900 border-2 border-amber-950 rounded-full flex items-center justify-center shadow-lg transition-all transform -translate-x-1/2 cursor-pointer filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              <!-- Detail lines on coconut -->
              <div class="text-[8px] font-mono font-bold text-amber-200">🥥</div>
            </div>

            <!-- Altitude Dimension Line -->
            <div class="absolute left-20 inset-y-2 w-6 flex flex-col justify-between items-center pointer-events-none opacity-40">
              <svg class="h-full w-full" viewBox="0 0 20 100" preserveAspectRatio="none">
                <line x1="10" y1="5" x2="10" y2="95" stroke="#f59e0b" stroke-width="1.5" />
                <path d="M 5 5 L 15 5 M 5 95 L 15 95" stroke="#f59e0b" stroke-width="1.5" />
              </svg>
              <div class="absolute bg-slate-950/90 text-amber-400 text-[9px] font-mono py-0.5 px-1 rounded border border-amber-500/20" style="top: 40%">
                h = ${h}m
              </div>
            </div>

            <!-- Ground Floor -->
            <div class="absolute bottom-0 inset-x-0 h-4 bg-slate-900 border-t border-slate-700"></div>
          </div>

          <!-- Energy Bar (Col span 5) -->
          <div class="col-span-5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-around text-xs">
            <h5 class="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-display">Konversi Energi (Ep &rarr; Ek)</h5>
            
            <!-- Potential Energy bar (Ep) -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-mono">
                <span class="text-violet-400">Eₚ (Potensial)</span>
                <span id="val-ep" class="text-violet-300 font-bold">${ep} J</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div id="bar-ep" class="bg-violet-500 h-full w-full transition-all duration-75"></div>
              </div>
            </div>

            <!-- Kinetic Energy bar (Ek) -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-mono">
                <span class="text-sky-400">Eₖ (Kinetik)</span>
                <span id="val-ek" class="text-sky-300 font-bold">0 J</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div id="bar-ek" class="bg-sky-500 h-full w-0 transition-all duration-75"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard / Controls -->
        <div class="flex justify-between items-center mt-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <div class="flex items-center space-x-3 pl-2">
            <!-- Digital Height Meter -->
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-display">Tinggi (h)</span>
              <div class="flex items-baseline space-x-1">
                <span id="sim-height-val" class="text-xl font-bold font-mono text-amber-400">${parseFloat(h).toFixed(1)}</span>
                <span class="text-[10px] text-slate-400 font-mono">meter</span>
              </div>
            </div>
            <div class="h-8 w-[1px] bg-slate-800"></div>
            <!-- Gravity speed velocity -->
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-display">Laju Jatuh</span>
              <div class="flex items-baseline space-x-1">
                <span id="sim-fall-speed" class="text-xl font-bold font-mono text-sky-400">0.0</span>
                <span class="text-[10px] text-slate-400 font-mono">m/s</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button id="btn-play-energi" class="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded-md font-sans font-medium transition flex items-center space-x-1 cursor-pointer">
              <i data-lucide="play" class="w-3.5 h-3.5"></i>
              <span>Jatuhkan</span>
            </button>
            <button id="btn-reset-energi" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-md font-sans font-medium transition flex items-center space-x-1 cursor-pointer">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Atur Ulang</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    const playBtn = document.getElementById('btn-play-energi');
    const resetSimBtn = document.getElementById('btn-reset-energi');
    const coconut = document.getElementById('sim-coconut');
    const heightVal = document.getElementById('sim-height-val');
    const speedVal = document.getElementById('sim-fall-speed');
    
    // Bar and label nodes
    const barEp = document.getElementById('bar-ep');
    const barEk = document.getElementById('bar-ek');
    const valEp = document.getElementById('val-ep');
    const valEk = document.getElementById('val-ek');

    let isPlaying = false;

    playBtn.addEventListener('click', () => {
      if (isPlaying) return;
      isPlaying = true;
      playBtn.disabled = true;
      playBtn.classList.add('opacity-50', 'cursor-not-allowed');

      if (activeSimulationInterval) clearInterval(activeSimulationInterval);

      // Trigger free fall animation (using CSS custom keyframe bounce)
      coconut.style.transition = `none`;
      coconut.classList.add('object-falling');

      const startTime = performance.now();
      const duration = 1800; // 1.8 seconds (matches CSS animation duration)

      activeSimulationInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const fraction = Math.min(elapsed / duration, 1);
        
        // Simulating the physical drop mechanics under gravity
        // Coconut hits floor at 85% of elapsed time (as defined in @keyframes fall)
        const hitFraction = Math.min(fraction / 0.85, 1);
        
        // h_current = h - (0.5 * g * t^2)
        // Let's model a standard gravitational falling proportion
        const heightFactor = 1 - (hitFraction * hitFraction);
        const currentHeight = Math.max(parseFloat(h) * heightFactor, 0);
        
        // speed = g * t
        const currentSpeed = hitFraction * Math.sqrt(2 * g * h);
        
        // Energy calculations (Conservation of Energy: Ep + Ek = Total)
        const currentEp = m * g * currentHeight;
        const currentEk = Math.max(ep - currentEp, 0);

        // Update displays
        heightVal.textContent = currentHeight.toFixed(1);
        speedVal.textContent = currentSpeed.toFixed(1);
        
        // Bars
        const epPercent = Math.max((currentEp / ep) * 100, 0);
        const ekPercent = Math.min((currentEk / ep) * 100, 100);

        barEp.style.width = `${epPercent}%`;
        barEk.style.width = `${ekPercent}%`;

        valEp.textContent = `${Math.round(currentEp)} J`;
        valEk.textContent = `${Math.round(currentEk)} J`;

        if (fraction >= 1) {
          clearInterval(activeSimulationInterval);
          heightVal.textContent = "0.0";
          speedVal.textContent = "0.0"; // stops moving when resting
          barEp.style.width = `0%`;
          barEk.style.width = `100%`;
          valEp.textContent = `0 J`;
          valEk.textContent = `${Math.round(ep)} J`;
        }
      }, 16);
    });

    resetSimBtn.addEventListener('click', () => {
      isPlaying = false;
      playBtn.disabled = false;
      playBtn.classList.remove('opacity-50', 'cursor-not-allowed');

      if (activeSimulationInterval) {
        clearInterval(activeSimulationInterval);
      }

      coconut.className = "absolute left-12 top-[15%] w-7 h-7 bg-amber-900 border-2 border-amber-950 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 cursor-pointer";
      
      heightVal.textContent = parseFloat(h).toFixed(1);
      speedVal.textContent = "0.0";

      barEp.style.width = "100%";
      barEk.style.width = "0%";
      valEp.textContent = `${ep} J`;
      valEk.textContent = "0 J";
    });
  }
});

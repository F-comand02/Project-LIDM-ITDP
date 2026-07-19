/**
 * PhysiViz AI - Modern Educational Technology JavaScript Entry
 * Integrates ES6 modular rule-based AI engine:
 * Text Preprocessing, Topic Classification, Variable Extraction, Physics Solver, and Interactive Concept Lab.
 */

import { preprocessText } from '../utils/textProcessor.js';
import { detectPhysicsTopic } from '../physics/classifier.js';
import { extractVariables } from '../physics/extractor.js';
import { knowledgeBase } from '../knowledge/knowledgeBase.js';
import {
  solveGLBB,
  solveProjectile,
  solveNewton,
  solvePascal,
  solveWave,
  solveKirchhoff,
  solveLorentz
} from '../physics/solver.js';
import { AnimationManager } from '../visualization/animationManager.js';

document.addEventListener('DOMContentLoaded', () => {
  
  // ======================================================
  // 1. PRELOADER & LAZY LOAD TRIGGER
  // ======================================================
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 400);
      }, 600);
    });
  }

  // ======================================================
  // 2. STICKY NAVBAR & ACTIVE MENU HIGHLIGHTING
  // ======================================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // ======================================================
  // 3. SMOOTH SCROLLING NAV EVENTS
  // ======================================================
  const smoothScrollButtons = document.querySelectorAll('a[href^="#"], button[data-scroll-to]');
  smoothScrollButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('href') || `#${btn.getAttribute('data-scroll-to')}`;
      if (targetId && targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
          
          const mobileMenu = document.getElementById('mobile-menu-drawer');
          if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
          }
        }
      }
    });
  });

  // ======================================================
  // 4. MOBILE DRAWER MENU TOGGLE
  // ======================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');

  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenuDrawer.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenuDrawer.contains(e.target) && e.target !== mobileMenuBtn) {
        mobileMenuDrawer.classList.remove('open');
      }
    });
  }

  // ======================================================
  // 5. DARK MODE TOGGLE INTERACTIVITY
  // ======================================================
  const btnDarkMode = document.getElementById('dark-mode-toggle');
  const btnDarkModeMobile = document.getElementById('dark-mode-toggle-mobile');
  const body = document.body;

  function updateDarkModeUI(isDark) {
    if (isDark) {
      body.classList.add('dark');
      if (btnDarkMode) btnDarkMode.innerHTML = '<i class="fas fa-sun" style="color: #F59E0B;"></i>';
      if (btnDarkModeMobile) btnDarkModeMobile.innerHTML = '<i class="fas fa-sun" style="color: #F59E0B;"></i> <span>Mode Terang</span>';
    } else {
      body.classList.remove('dark');
      if (btnDarkMode) btnDarkMode.innerHTML = '<i class="fas fa-moon"></i>';
      if (btnDarkModeMobile) btnDarkModeMobile.innerHTML = '<i class="fas fa-moon"></i> <span>Mode Gelap</span>';
    }
  }

  // Check initial state from localStorage
  const isDarkSaved = localStorage.getItem('darkMode') === 'enabled';
  updateDarkModeUI(isDarkSaved);

  function toggleDarkMode() {
    const currentlyDark = body.classList.contains('dark');
    const newState = !currentlyDark;
    localStorage.setItem('darkMode', newState ? 'enabled' : 'disabled');
    updateDarkModeUI(newState);
  }

  if (btnDarkMode) btnDarkMode.addEventListener('click', toggleDarkMode);
  if (btnDarkModeMobile) btnDarkModeMobile.addEventListener('click', toggleDarkMode);

  // ======================================================
  // 6. SCROLL RISE ANIMATION (INTERSECTION OBSERVER)
  // ======================================================
  const fadeUpElements = document.querySelectorAll('.fade-in-up');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeUpElements.forEach(el => observer.observe(el));

  // ======================================================
  // 7. SOLVER ROUTER DICTIONARY
  // ======================================================
  const solvers = {
    glbb: solveGLBB,
    parabola: solveProjectile,
    newton: solveNewton,
    pascal: solvePascal,
    gelombang: solveWave,
    kirchhoff: solveKirchhoff,
    lorentz: solveLorentz
  };

  // ======================================================
  // 8. INTERACTIVE WORKSPACE DRIVERS
  // ======================================================
  const textarea = document.getElementById('soal-textarea');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnReset = document.getElementById('btn-reset');
  
  const loadingWrapper = document.getElementById('loading-wrapper');
  const loadingProgress = document.querySelector('.loading-progress');
  const loadingStatusText = document.getElementById('loading-status-text');
  
  const secHasilAnalisis = document.getElementById('hasil-analisis');
  const resultsContainer = document.getElementById('results-container');
  
  // Results Elements
  const resConceptBadge = document.getElementById('res-concept-badge');
  const resConceptName = document.getElementById('res-concept-name');
  const resConceptDesc = document.getElementById('res-concept-desc');
  const resKnownList = document.getElementById('res-known-list');
  const resTargetText = document.getElementById('res-target-text');
  const resFormulaMath = document.getElementById('res-formula-math');
  const resFormulaVars = document.getElementById('res-formula-vars');
  const resStepsList = document.getElementById('res-steps-list');
  const resAnswerText = document.getElementById('res-answer-text');
  const resVisualizerBox = document.getElementById('res-visualizer-box');

  // Sidebar and Search Elements
  const searchInput = document.getElementById('search-material');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const exampleLibraryGrid = document.getElementById('example-library-grid');

  // Edu Panel Elements
  const eduDefinisi = document.getElementById('edu-definisi');
  const eduKonsep = document.getElementById('edu-konsep');
  const eduRumus = document.getElementById('edu-rumus');
  const eduSatuan = document.getElementById('edu-satuan');
  const eduTips = document.getElementById('edu-tips');
  const eduKesalahan = document.getElementById('edu-kesalahan');

  // Header Panel Elements
  const topicNameEl = document.getElementById('workspace-topic-name');
  const topicDescEl = document.getElementById('workspace-topic-desc');
  const topicBadgeEl = document.getElementById('workspace-topic-badge');

  let activeMaterialKey = 'glbb';

  // Function to switch materials in the workspace
  function selectMaterial(key) {
    if (!knowledgeBase[key]) return;
    activeMaterialKey = key;

    // Highlight sidebar item
    sidebarItems.forEach(item => {
      if (item.getAttribute('data-type') === key) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const info = knowledgeBase[key];

    // Update Workspace Header Panel
    if (topicNameEl) topicNameEl.textContent = info.nama;
    if (topicDescEl) topicDescEl.textContent = info.deskripsi;
    if (topicBadgeEl) {
      if (key === 'glbb' || key === 'parabola') {
        topicBadgeEl.textContent = 'Kinematika';
        topicBadgeEl.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
        topicBadgeEl.style.color = '#2563EB';
      } else if (key === 'newton' || key === 'lorentz') {
        topicBadgeEl.textContent = 'Dinamika';
        topicBadgeEl.style.backgroundColor = 'rgba(124, 58, 237, 0.08)';
        topicBadgeEl.style.color = '#7C3AED';
      } else if (key === 'pascal') {
        topicBadgeEl.textContent = 'Fluida';
        topicBadgeEl.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
        topicBadgeEl.style.color = '#10B981';
      } else if (key === 'gelombang') {
        topicBadgeEl.textContent = 'Gelombang';
        topicBadgeEl.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
        topicBadgeEl.style.color = '#F59E0B';
      } else {
        topicBadgeEl.textContent = 'Kelistrikan';
        topicBadgeEl.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
        topicBadgeEl.style.color = '#EF4444';
      }
    }

    // Update Educational Panel Contents
    const edu = info.eduPanel;
    if (edu) {
      if (eduDefinisi) eduDefinisi.innerHTML = edu.definisi;
      if (eduKonsep) eduKonsep.innerHTML = edu.konsep;
      if (eduRumus) eduRumus.innerHTML = edu.rumusDasar;
      if (eduSatuan) eduSatuan.innerHTML = edu.satuan;
      if (eduTips) eduTips.innerHTML = edu.tips;
      if (eduKesalahan) eduKesalahan.innerHTML = edu.kesalahan;
    }

    // Update Example Library Grid
    if (exampleLibraryGrid) {
      exampleLibraryGrid.innerHTML = '';
      const examples = info.contohLibrary || [info.contohSoal];
      examples.forEach((ex, idx) => {
        const item = document.createElement('button');
        item.className = 'example-library-item';
        item.innerHTML = `
          <span>${ex}</span>
          <i class="fas fa-arrow-right"></i>
        `;
        item.addEventListener('click', () => {
          textarea.value = ex;
          // Smooth focus effect
          textarea.focus();
          textarea.classList.add('ring-2', 'ring-primary');
          setTimeout(() => textarea.classList.remove('ring-2', 'ring-primary'), 600);
        });
        exampleLibraryGrid.appendChild(item);
      });
    }
  }

  // Sidebar item click binding
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const type = item.getAttribute('data-type');
      selectMaterial(type);
    });
  });

  // Search logic for materials
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      sidebarItems.forEach(item => {
        const title = item.querySelector('.sidebar-item-title').textContent.toLowerCase();
        const subtitle = item.querySelector('.sidebar-item-subtitle').textContent.toLowerCase();
        if (title.includes(query) || subtitle.includes(query)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Action Reset Form
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      textarea.value = '';
      resetToPlaceholder();
    });
  }

  // Initialize workspace to default material (GLBB)
  selectMaterial('glbb');

  function resetToPlaceholder() {
    loadingWrapper.style.display = 'none';
    if (loadingProgress) loadingProgress.style.width = '0%';
    resultsContainer.classList.add('hidden');
    
    // Reset contents to loading placeholder
    resConceptBadge.textContent = 'Kategori';
    resConceptName.textContent = 'Menunggu Analisis AI';
    resConceptDesc.textContent = 'Masukkan soal fisika Anda di atas dan klik "Analisis Soal" untuk memulai pendeteksian AI secara rule-based.';
    resKnownList.innerHTML = '<li class="result-placeholder">Menunggu Analisis AI</li>';
    resTargetText.innerHTML = '<span class="result-placeholder">Menunggu Analisis AI</span>';
    resFormulaMath.textContent = 'v = s / t';
    resFormulaVars.innerHTML = '<li class="result-placeholder">Menunggu Analisis AI</li>';
    resStepsList.innerHTML = '<li class="result-placeholder">Menunggu Analisis AI</li>';
    resAnswerText.innerHTML = '<span class="result-placeholder">Menunggu Analisis AI</span>';
    
    // Reset Canvas Container
    resVisualizerBox.innerHTML = `
      <div class="visualizer-overlay">
        <i class="fas fa-satellite-dish"></i>
        <p class="font-display font-medium text-lg">Area Visualisasi</p>
        <p class="text-xs text-slate-500 max-w-sm text-center">Simulasi fisika interaktif berbasis rumus akan muncul secara dinamis di sini setelah analisis selesai.</p>
      </div>
    `;
  }

  // ======================================================
  // 9. EXPERT SYSTEM WORKFLOW PIPELINE WITH TIMED OVERLAY
  // ======================================================
  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => {
      const text = textarea.value.trim();
      
      if (!text) {
        alert('Silakan tulis atau pilih salah satu contoh soal fisika terlebih dahulu!');
        textarea.focus();
        return;
      }

      // Preprocess Text
      const { cleanText, tokens } = preprocessText(text);

      // Topic Classification
      const topic = detectPhysicsTopic(cleanText);

      // Topic UNKNOWN Handling
      if (topic === "UNKNOWN") {
        alert('Konsep fisika belum dikenali. Silakan sesuaikan keyword atau coba contoh soal yang disediakan!');
        resetToPlaceholder();
        return;
      }

      // Auto-select sidebar material if different from current selection
      if (topic !== activeMaterialKey) {
        selectMaterial(topic);
      }

      // Variable Extraction
      const variables = extractVariables(cleanText, topic);

      // Physics Solver Execution
      const solver = solvers[topic];
      const solverResult = solver(variables);

      // Build Result Object
      const kbEntry = knowledgeBase[topic];
      const Result = {
        topic: kbEntry.nama,
        description: kbEntry.deskripsi,
        variables: variables,
        formula: solverResult.formula || kbEntry.rumus,
        steps: solverResult.steps || [],
        answer: solverResult.answer || "Variabel belum mencukupi.",
        unit: solverResult.unit || "",
        visualizationType: kbEntry.visualizationType,
        status: solverResult.status
      };

      console.log("PhysiViz AI Expert System Result Object:", Result);

      // Variable Incomplete Handling
      if (Result.status === "incomplete") {
        const missingList = solverResult.missing.join(", ");
        alert(`Variabel kurang untuk menyelesaikan perhitungan ${kbEntry.nama}. Variabel yang belum ada: ${missingList}. Silakan lengkapi soal cerita Anda.`);
        
        resultsContainer.classList.remove('hidden');
        resConceptBadge.textContent = "Data Kurang";
        resConceptName.textContent = kbEntry.nama;
        resConceptDesc.innerHTML = `<span class="text-red-600 font-semibold"><i class="fas fa-circle-exclamation"></i> Rumus tidak dapat diselesaikan karena kekurangan variabel fisis:</span> <br> <span class="font-mono text-xs text-slate-600">${missingList}</span>`;
        resKnownList.innerHTML = `<li class="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">Harap lengkapi nilai variabel berikut: <strong class="font-mono">${missingList}</strong></li>`;
        resTargetText.innerHTML = `<span class="text-xs text-slate-500">Silakan tuliskan angka-angka variabel pendukung di atas.</span>`;
        resFormulaMath.textContent = Object.values(kbEntry.rumus)[0] || "";
        resFormulaVars.innerHTML = solverResult.missing.map(m => `
          <div class="flex items-center gap-2 text-xs text-red-600 font-mono">
            <i class="fas fa-circle-xmark"></i> <span>${m}</span>
          </div>
        `).join('');
        resStepsList.innerHTML = `<li class="text-sm text-slate-500 italic">Langkah penyelesaian bertahap tidak tersedia karena variabel belum mencukupi.</li>`;
        resAnswerText.innerHTML = `<span class="text-red-700"><i class="fas fa-triangle-exclamation"></i> Jawaban tidak dapat dihitung. Harap masukkan nilai numerik pendukung.</span>`;
        
        resVisualizerBox.innerHTML = `
          <div class="visualizer-overlay text-red-600">
            <i class="fas fa-circle-exclamation text-3xl"></i>
            <p class="font-display font-medium text-lg mt-2">Variabel Tidak Lengkap</p>
            <p class="text-xs text-slate-500 max-w-sm text-center">Harap masukkan variabel yang hilang agar visualisasi konsep konsep mekanik laboratorium dapat diluncurkan secara presisi.</p>
          </div>
        `;
        
        secHasilAnalisis.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Trigger Loader Screen with sequence simulation
      resetToPlaceholder();
      loadingWrapper.style.display = 'flex';
      loadingWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      let progress = 0;
      let currentStep = 1;

      // Reset all step items
      for (let i = 1; i <= 6; i++) {
        const item = document.getElementById(`load-step-${i}`);
        const icon = document.getElementById(`load-step-${i}-icon`);
        if (item) {
          item.className = 'loading-step-item';
          if (icon) icon.innerHTML = '<i class="fas fa-circle-minus"></i>';
        }
      }

      // Activate first step
      const step1 = document.getElementById('load-step-1');
      const icon1 = document.getElementById('load-step-1-icon');
      if (step1) step1.classList.add('active');
      if (icon1) icon1.innerHTML = '<div class="spinner-mini"></div>';

      function completeStep(n) {
        const el = document.getElementById(`load-step-${n}`);
        const icon = document.getElementById(`load-step-${n}-icon`);
        if (el) {
          el.classList.remove('active');
          el.classList.add('completed');
          if (icon) icon.innerHTML = '<i class="fas fa-circle-check" style="color: #10B981;"></i>';
        }
      }

      function activateStep(n) {
        const el = document.getElementById(`load-step-${n}`);
        const icon = document.getElementById(`load-step-${n}-icon`);
        if (el) {
          el.classList.add('active');
          if (icon) icon.innerHTML = '<div class="spinner-mini"></div>';
        }
      }

      const statusMsgs = [
        "Membaca kueri teks dan merapikan token...",
        "Mengekstrak kata kunci fisis penting...",
        "Mengklasifikasikan ke materi fisika sekolah menengah...",
        "Mengekstrak besaran nilai variabel fisis...",
        "Mengeksekusi perhitungan rumus matematis...",
        "Mempersiapkan area visualisasi visual..."
      ];

      const loadingInterval = setInterval(() => {
        progress += 2;
        if (loadingProgress) loadingProgress.style.width = `${progress}%`;
        
        if (progress >= 15 && currentStep === 1) {
          completeStep(1);
          activateStep(2);
          currentStep = 2;
          loadingStatusText.textContent = statusMsgs[1];
        } else if (progress >= 30 && currentStep === 2) {
          completeStep(2);
          activateStep(3);
          currentStep = 3;
          loadingStatusText.textContent = statusMsgs[2];
        } else if (progress >= 50 && currentStep === 3) {
          completeStep(3);
          activateStep(4);
          currentStep = 4;
          loadingStatusText.textContent = statusMsgs[3];
        } else if (progress >= 70 && currentStep === 4) {
          completeStep(4);
          activateStep(5);
          currentStep = 5;
          loadingStatusText.textContent = statusMsgs[4];
        } else if (progress >= 85 && currentStep === 5) {
          completeStep(5);
          activateStep(6);
          currentStep = 6;
          loadingStatusText.textContent = statusMsgs[5];
        }

        if (progress >= 100) {
          clearInterval(loadingInterval);
          completeStep(6);
          setTimeout(() => {
            loadingWrapper.style.display = 'none';
            injectResults(Result, kbEntry);
          }, 400);
        }
      }, 35);
    });
  }

  function injectResults(Result, kbEntry) {
    resultsContainer.classList.remove('hidden');
    
    // Concept Card
    resConceptBadge.textContent = kbEntry.nama.includes("Hukum") ? "Dinamika" : kbEntry.nama.includes("Gerak") ? "Kinematika" : "Fisika Dasar";
    resConceptName.textContent = Result.topic;
    resConceptDesc.textContent = Result.description;
    
    // Known Variables Card
    resKnownList.innerHTML = solverResultToKnownListHTML(Result.variables, kbEntry);
    
    // Target Card
    resTargetText.innerHTML = `
      <div class="flex justify-between items-center bg-violet-50/50 border border-violet-100 p-3.5 rounded-xl dark:bg-slate-850 dark:border-slate-800">
        <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">Target yang dicari</span>
        <span class="font-mono text-sm bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-bold px-2.5 py-1 rounded-md">
          ${getAskedLabel(kbEntry.id)}
        </span>
      </div>
    `;
    
    // Formula Card
    resFormulaMath.textContent = Result.formula;
    resFormulaVars.innerHTML = Object.entries(kbEntry.variabel).map(([key, v]) => `
      <div class="flex items-start gap-2.5 text-xs text-slate-650 dark:text-slate-300">
        <span class="font-mono font-bold text-primary bg-blue-50 dark:bg-blue-950 dark:text-blue-300 w-6 h-6 rounded flex items-center justify-center flex-shrink-0">${v.simbol}</span>
        <span class="pt-0.5 leading-relaxed"><strong>${v.nama}</strong>: ${v.deskripsi} (${v.unit})</span>
      </div>
    `).join('');
    
    // Steps Card
    resStepsList.innerHTML = Result.steps.map((s, idx) => `
      <li class="flex gap-4">
        <span class="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-900 border border-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold font-display rounded-lg flex items-center justify-center flex-shrink-0 text-sm">
          ${idx + 1}
        </span>
        <p class="text-sm text-slate-650 dark:text-slate-350 pt-0.5 leading-relaxed">${s}</p>
      </li>
    `).join('');
    
    // Final Answer Card
    resAnswerText.innerHTML = Result.answer;
    
    // Inject Custom Physics Simulator Interactive Render with extracted values
    injectPhysicsSimulation(kbEntry.id, Result.variables);
    
    // Scroll down smoothly
    secHasilAnalisis.scrollIntoView({ behavior: 'smooth' });
  }

  function getAskedLabel(topicId) {
    switch (topicId) {
      case "glbb": return "Kecepatan Akhir (vₜ)";
      case "parabola": return "Tinggi Maksimum (H_max)";
      case "newton": return "Percepatan Balok (a)";
      case "pascal": return "Gaya Angkat Output (F₂)";
      case "gelombang": return "Cepat Rambat Gelombang (v)";
      case "kirchhoff": return "Kuat Arus Cabang Kedua (I₂)";
      case "lorentz": return "Gaya Lorentz (F_L)";
      default: return "Hasil Perhitungan";
    }
  }

  function solverResultToKnownListHTML(vars, kbEntry) {
    return Object.entries(vars).map(([key, val]) => {
      let varMeta = kbEntry.variabel[key];
      if (!varMeta) {
        if (key === "massa") varMeta = kbEntry.variabel["m"];
        if (key === "gaya") varMeta = kbEntry.variabel["F"];
        if (key === "waktu") varMeta = kbEntry.variabel["t"];
        if (key === "arus") varMeta = kbEntry.variabel["I"];
      }
      if (!varMeta) return "";
      return `
        <li class="flex justify-between items-center bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800 p-3 rounded-xl">
          <span class="font-medium text-slate-750 dark:text-slate-300 text-sm">${varMeta.nama}</span>
          <span class="font-mono text-sm bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold px-2.5 py-1 rounded-md">
            ${varMeta.simbol} = ${val} ${varMeta.unit}
          </span>
        </li>
      `;
    }).filter(Boolean).join('');
  }

  // ======================================================
  // 10. DYNAMIC PHYSICS SIMULATOR & INTERACTIVE RENDERER
  // ======================================================
  function injectPhysicsSimulation(type, variables) {
    const resultObj = {
      topic: type,
      variables: variables
    };
    window.activeVisualizerManager = new AnimationManager(resVisualizerBox, resultObj);
  }

});

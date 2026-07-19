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
document.addEventListener('DOMContentLoaded', () => {
  
  // ======================================================
  // 1. PRELOADER & LAZY LOAD TRIGGER
  // ======================================================
  console.log("UI Loaded");
  console.log("Knowledge Loaded");
  console.log("AI Ready");

  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    // DOMContentLoaded has fired, wait 800ms before starting fade-out
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
        console.log("Website Ready");
      }, 400);
    }, 800);
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
  const btnVoiceInput = document.getElementById('btn-voice-input');
  const voiceIcon = document.getElementById('voice-icon');
  const voiceStatusText = document.getElementById('voice-status-text');
  const voiceFeedback = document.getElementById('voice-feedback');
  const voiceInterimText = document.getElementById('voice-interim-text');
  
  const loadingWrapper = document.getElementById('loading-wrapper');
  const loadingProgress = document.querySelector('.loading-progress');
  const loadingStatusText = document.getElementById('loading-status-text');
  
  const historyCard = document.getElementById('history-card');
  const historyGrid = document.getElementById('history-grid');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  
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

  // Classification Card Elements
  const cardKlasifikasi = document.getElementById('card-klasifikasi');
  const resGradeBadge = document.getElementById('res-grade-badge');
  const resGradeText = document.getElementById('res-grade-text');
  const resChapterText = document.getElementById('res-chapter-text');
  const resDifficultyText = document.getElementById('res-difficulty-text');
  const resClassificationDesc = document.getElementById('res-classification-desc');
  const gradeIconWrapper = document.getElementById('grade-icon-wrapper');
  const chapterIconWrapper = document.getElementById('chapter-icon-wrapper');
  const difficultyIconWrapper = document.getElementById('difficulty-icon-wrapper');
  const resClassificationDescBox = document.getElementById('res-classification-desc-box');
  const descInfoIcon = document.getElementById('desc-info-icon');
  const klasifikasiTitleIcon = document.getElementById('klasifikasi-title-icon');

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

  // ======================================================
  // TOAST NOTIFICATION UTILITY
  // ======================================================
  function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-notification`;
    
    let iconHTML = '';
    if (type === 'success') {
      iconHTML = '<div class="toast-icon success"><i class="fas fa-circle-check"></i></div>';
    } else if (type === 'error') {
      iconHTML = '<div class="toast-icon error"><i class="fas fa-circle-exclamation"></i></div>';
    } else {
      iconHTML = '<div class="toast-icon info"><i class="fas fa-circle-info"></i></div>';
    }

    toast.innerHTML = `
      ${iconHTML}
      <div class="toast-content" style="flex-grow: 1; min-width: 0;">
        <div class="toast-title" style="font-weight: 600; font-size: 0.85rem; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;">${title}</div>
        <div class="toast-message" style="font-size: 0.75rem; color: #94A3B8; line-height: 1.4; font-family: 'Inter', sans-serif;">${message}</div>
      </div>
      <button class="toast-close" aria-label="Tutup" style="background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; font-size: 0.8rem; transition: color 0.2s; display: flex; align-items: center; justify-content: center;">
        <i class="fas fa-xmark"></i>
      </button>
    `;

    // Append to container
    container.appendChild(toast);

    // Trigger transition
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Close logic
    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        toast.remove();
      }, 400);
    };

    if (closeBtn) {
      closeBtn.addEventListener('click', dismiss);
    }

    // Auto dismiss
    const autoDismissTimeout = setTimeout(dismiss, 5000);
    
    // Pause auto dismiss on hover
    toast.addEventListener('mouseenter', () => clearTimeout(autoDismissTimeout));
  }

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

  // ======================================================
  // 8.5. AUDIO / SPEECH RECOGNITION (MICROPHONE) INTEGRATION
  // ======================================================
  let recognition = null;
  let isRecording = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition && btnVoiceInput) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';

    recognition.onstart = () => {
      isRecording = true;
      btnVoiceInput.classList.add('recording');
      if (voiceIcon) voiceIcon.className = 'fas fa-stop';
      if (voiceStatusText) voiceStatusText.textContent = 'Hentikan';
      if (voiceFeedback) {
        voiceFeedback.style.display = 'flex';
      }
      if (voiceInterimText) {
        voiceInterimText.textContent = 'Mendengarkan... Silakan bicarakan soal Anda sekarang.';
      }
      showToast("Input Suara Aktif", "Silakan bicarakan soal Anda secara langsung.", "info");
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        const currentValue = textarea.value.trim();
        textarea.value = currentValue ? (currentValue + ' ' + finalTranscript) : finalTranscript;
        textarea.dispatchEvent(new Event('input'));
      }

      if (interimTranscript) {
        if (voiceInterimText) {
          voiceInterimText.textContent = `Mendengar: "${interimTranscript}"`;
        }
      } else {
        if (voiceInterimText) {
          voiceInterimText.textContent = 'Mendengarkan... Teruslah berbicara soal Anda.';
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        showToast("Izin Mikrofon Ditolak", "Harap izinkan akses mikrofon di browser Anda.", "error");
        alert('Izin mikrofon ditolak. Harap izinkan akses mikrofon di browser Anda untuk menggunakan fitur ini.');
      } else if (event.error === 'no-speech') {
        if (voiceInterimText) {
          voiceInterimText.textContent = 'Tidak ada suara terdeteksi. Silakan coba bicara lagi.';
        }
        showToast("Tidak Ada Suara", "Tidak ada suara terdeteksi. Silakan coba bicara kembali.", "info");
        return; // Jangan hentikan langsung
      } else {
        showToast("Kesalahan Input Suara", `Terjadi kesalahan: ${event.error}`, "error");
        alert(`Terjadi kesalahan input suara: ${event.error}`);
      }
      stopVoiceRecording();
    };

    recognition.onend = () => {
      stopVoiceRecording();
    };

    btnVoiceInput.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to start recognition:', err);
          stopVoiceRecording();
        }
      }
    });

    function stopVoiceRecording() {
      isRecording = false;
      if (btnVoiceInput) {
        btnVoiceInput.classList.remove('recording');
      }
      if (voiceIcon) {
        voiceIcon.className = 'fas fa-microphone';
      }
      if (voiceStatusText) {
        voiceStatusText.textContent = 'Mulai Bicara';
      }
      if (voiceFeedback) {
        setTimeout(() => {
          if (!isRecording) {
            voiceFeedback.style.display = 'none';
          }
        }, 1500); // Pertahankan feedback sebentar untuk transisi UX yang mulus
      }
    }
  } else if (btnVoiceInput) {
    btnVoiceInput.addEventListener('click', () => {
      alert('Maaf, browser Anda tidak mendukung fitur Input Suara (Web Speech API). Harap gunakan browser modern seperti Google Chrome.');
    });
  }

  // Initialize workspace to default material (GLBB)
  selectMaterial('glbb');

  // ======================================================
  // 8.6. LOCAL STORAGE QUESTION HISTORY SYSTEM
  // ======================================================
  function getHistory() {
    try {
      const data = localStorage.getItem('physiviz_history');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse history from localStorage:', e);
      return [];
    }
  }

  function saveToHistory(text, topicName, topicKey) {
    if (!text || text.trim().length < 5) return;
    let history = getHistory();
    // Move duplicate to the top
    history = history.filter(item => item.text.trim().toLowerCase() !== text.trim().toLowerCase());
    
    history.unshift({
      text: text,
      topicName: topicName,
      topicKey: topicKey,
      timestamp: Date.now()
    });

    // Limit history to 8 items for a clean UI
    if (history.length > 8) {
      history = history.slice(0, 8);
    }

    try {
      localStorage.setItem('physiviz_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }

    renderHistory();
  }

  function renderHistory() {
    if (!historyGrid || !historyCard) return;

    const history = getHistory();
    if (history.length === 0) {
      historyCard.style.display = 'none';
      return;
    }

    historyCard.style.display = 'block';
    historyGrid.innerHTML = '';

    history.forEach((item) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'example-library-item';
      historyItem.style.display = 'flex';
      historyItem.style.justifyContent = 'space-between';
      historyItem.style.alignItems = 'center';
      historyItem.style.gap = '1rem';
      historyItem.style.cursor = 'default';
      
      const displayedText = item.text.length > 105 ? item.text.substring(0, 105) + '...' : item.text;
      
      historyItem.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.25rem; flex: 1; min-width: 0; cursor: pointer;" class="history-click-target">
          <span style="font-weight: 500; font-size: 0.85rem; color: var(--color-text-main); line-height: 1.4;" title="${item.text}">${displayedText}</span>
          <span class="font-mono text-indigo-600 dark:text-indigo-400" style="font-size: 0.7rem; display: flex; align-items: center; gap: 0.35rem;">
            <i class="fas fa-tag" style="font-size: 0.65rem;"></i> ${item.topicName}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          <button class="voice-btn run-history-btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;" title="Analisis Soal Ini">
            <i class="fas fa-play" style="font-size: 0.7rem;"></i> <span>Buka</span>
          </button>
          <button class="delete-history-btn" style="background: none; border: none; color: #EF4444; opacity: 0.6; cursor: pointer; padding: 0.3rem; font-size: 0.85rem; transition: opacity 0.2s;" title="Hapus dari riwayat">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      `;

      // Set click target to fill form
      const fillForm = () => {
        textarea.value = item.text;
        textarea.focus();
        if (item.topicKey) {
          selectMaterial(item.topicKey);
        }
      };

      historyItem.querySelector('.history-click-target').addEventListener('click', fillForm);

      // Run analysis directly on clicking "Buka" / "Analisis"
      historyItem.querySelector('.run-history-btn').addEventListener('click', () => {
        textarea.value = item.text;
        if (item.topicKey) {
          selectMaterial(item.topicKey);
        }
        setTimeout(() => {
          if (btnAnalyze) {
            btnAnalyze.click();
          }
        }, 100);
      });

      // Individual item deletion
      const deleteBtn = historyItem.querySelector('.delete-history-btn');
      deleteBtn.addEventListener('mouseover', () => { deleteBtn.style.opacity = '1'; });
      deleteBtn.addEventListener('mouseout', () => { deleteBtn.style.opacity = '0.6'; });
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.timestamp);
      });

      historyGrid.appendChild(historyItem);
    });
  }

  function deleteHistoryItem(timestamp) {
    let history = getHistory();
    history = history.filter(item => item.timestamp !== timestamp);
    try {
      localStorage.setItem('physiviz_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
    renderHistory();
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin menghapus semua riwayat soal Anda?')) {
        try {
          localStorage.removeItem('physiviz_history');
          showToast("Riwayat Dihapus", "Semua riwayat soal cerita Anda telah dikosongkan.", "info");
        } catch (e) {
          console.error(e);
          showToast("Gagal Menghapus", "Tidak dapat membersihkan riwayat di localStorage.", "error");
        }
        renderHistory();
      }
    });
  }

  // Initial history render
  renderHistory();

  // ======================================================
  // 8.7. PDF REPORT GENERATION & DOWNLOAD
  // ======================================================
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', generatePDFReport);
  }

  async function generatePDFReport() {
    if (!textarea || !resConceptName || !resAnswerText) {
      alert("Belum ada data analisis untuk diunduh. Silakan lakukan analisis soal terlebih dahulu.");
      return;
    }

    const questionText = textarea.value.trim();
    if (!questionText) {
      alert("Silakan masukkan soal fisika Anda dan klik Analisis Soal terlebih dahulu.");
      return;
    }

    // Show loading state on the button
    const originalBtnHTML = btnDownloadPdf.innerHTML;
    btnDownloadPdf.disabled = true;
    btnDownloadPdf.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Menyiapkan PDF...</span>`;

    try {
      // Capture snapshot of active visualizer (canvas or SVG)
      let visualizerImgSrc = null;
      const canvas = resVisualizerBox ? resVisualizerBox.querySelector('canvas') : null;
      const svg = resVisualizerBox ? resVisualizerBox.querySelector('svg') : null;

      if (canvas) {
        try {
          visualizerImgSrc = canvas.toDataURL("image/png");
        } catch (e) {
          console.error("Failed to get canvas data URL:", e);
        }
      } else if (svg) {
        try {
          const svgString = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
          await new Promise((resolve) => {
            img.onload = () => {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = svg.clientWidth || 800;
              tempCanvas.height = svg.clientHeight || 450;
              const ctx = tempCanvas.getContext('2d');
              ctx.fillStyle = '#090D16'; // background
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              ctx.drawImage(img, 0, 0);
              try {
                visualizerImgSrc = tempCanvas.toDataURL("image/png");
              } catch (e) {
                console.error("SVG temporary canvas error:", e);
              }
              resolve();
            };
            img.onerror = () => {
              resolve();
            };
          });
        } catch (e) {
          console.error("Failed to serialize SVG:", e);
        }
      }

      // Create temporary element for the report
      const element = document.createElement('div');
      element.style.padding = '40px';
      element.style.fontFamily = '"Inter", "Helvetica Neue", sans-serif';
      element.style.color = '#1E293B';
      element.style.backgroundColor = '#FFFFFF';
      element.style.width = '790px'; // standard A4 printable safe width
      element.style.boxSizing = 'border-box';

      // Build header
      const dateString = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Get lists and details from current UI
      const knownItems = Array.from(resKnownList.querySelectorAll('li')).map(li => {
        return li.textContent.trim().replace(/\s+/g, ' ');
      });

      const targetText = resTargetText.textContent.trim().replace(/\s+/g, ' ');
      const formulaMath = resFormulaMath.textContent.trim();
      const formulaVars = Array.from(resFormulaVars.querySelectorAll('li')).map(li => {
        return li.textContent.trim().replace(/\s+/g, ' ');
      });

      const steps = Array.from(resStepsList.querySelectorAll('li')).map(li => {
        const text = li.querySelector('p') ? li.querySelector('p').textContent.trim() : li.textContent.trim();
        return text.replace(/\s+/g, ' ');
      });

      const answer = resAnswerText.innerHTML.replace(/<[^>]*>/g, '').trim();

      // Get classification elements if present
      const gradeText = resGradeText ? resGradeText.textContent : '';
      const chapterText = resChapterText ? resChapterText.textContent : '';
      const difficultyText = resDifficultyText ? resDifficultyText.textContent : '';
      const classificationDesc = resClassificationDesc ? resClassificationDesc.textContent : '';
      const hasClassification = cardKlasifikasi && cardKlasifikasi.style.display !== 'none';

      let classificationSectionHTML = '';
      if (hasClassification) {
        let badgeColor = '#2563EB'; // Blue
        let badgeBgColor = '#EFF6FF';
        if (gradeText.includes('XI')) {
          badgeColor = '#10B981'; // Green
          badgeBgColor = '#ECFDF5';
        } else if (gradeText.includes('XII')) {
          badgeColor = '#8B5CF6'; // Purple
          badgeBgColor = '#F5F3FF';
        }
        
        classificationSectionHTML = `
          <!-- Klasifikasi Tingkat Kelas SMA -->
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; margin-bottom: 25px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 12px;">
              <span style="font-size: 14px; font-weight: bold; color: #1E3A8A; font-family: sans-serif; display: flex; align-items: center; gap: 6px;">🎓 Klasifikasi Tingkat Kelas SMA</span>
              <span style="font-size: 11px; background-color: ${badgeBgColor}; color: ${badgeColor}; padding: 3px 8px; border-radius: 999px; font-weight: bold;">🏅 ${gradeText}</span>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 12px;">
              <div style="flex: 1; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; text-align: center;">
                <span style="font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: bold; display: block; margin-bottom: 2px;">Tingkat Materi</span>
                <strong style="font-size: 12px; color: #0F172A;">${gradeText}</strong>
              </div>
              <div style="flex: 1; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; text-align: center;">
                <span style="font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: bold; display: block; margin-bottom: 2px;">Bab</span>
                <strong style="font-size: 12px; color: #0F172A;">${chapterText}</strong>
              </div>
              <div style="flex: 1; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; text-align: center;">
                <span style="font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: bold; display: block; margin-bottom: 2px;">Tingkat Kesulitan</span>
                <strong style="font-size: 12px; color: #0F172A;">${difficultyText}</strong>
              </div>
            </div>
            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #475569; font-style: italic; border-left: 3px solid ${badgeColor}; padding-left: 10px;">${classificationDesc}</p>
          </div>
        `;
      }

      let knownListHTML = knownItems.map(item => `<li style="margin-bottom: 6px; font-size: 13px;">${item}</li>`).join('');
      if (knownItems.length === 0 || (knownItems.length === 1 && knownItems[0].includes('Menunggu'))) {
        knownListHTML = `<li style="font-style: italic; color: #64748B;">Tidak ada variabel yang terdeteksi.</li>`;
      }

      let formulaVarsHTML = formulaVars.map(item => `<li style="margin-bottom: 4px; font-size: 13px; color: #475569;">${item}</li>`).join('');

      let stepsHTML = steps.map((step, idx) => `
        <div style="margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;">
          <span style="background-color: #EEF2F6; color: #1E293B; font-weight: bold; min-width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: monospace;">${idx + 1}</span>
          <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #334155; flex: 1;">${step}</p>
        </div>
      `).join('');

      let visualizerSectionHTML = '';
      if (visualizerImgSrc) {
        visualizerSectionHTML = `
          <div style="margin-top: 25px; margin-bottom: 25px; page-break-inside: avoid;">
            <h3 style="border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; color: #1E3A8A; font-family: 'Space Grotesk', sans-serif; font-size: 16px; margin-top: 0;">📸 Snapshot Simulasi Fisika</h3>
            <div style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background-color: #090D16; text-align: center; padding: 10px;">
              <img src="${visualizerImgSrc}" style="max-width: 100%; height: auto; border-radius: 6px; display: inline-block;" />
            </div>
          </div>
        `;
      }

      element.innerHTML = `
        <!-- Main PDF Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3B82F6; padding-bottom: 15px; margin-bottom: 25px;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-family: 'Space Grotesk', sans-serif; color: #1E3A8A; display: flex; align-items: center; gap: 8px;">
              ⚛️ PhysiViz AI
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">AI Physics Analysis & Interactive Simulator</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; font-family: monospace; background-color: #EFF6FF; color: #1D4ED8; padding: 4px 8px; border-radius: 6px; font-weight: bold;">CATATAN BELAJAR</span>
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748B;">${dateString}</p>
          </div>
        </div>

        <!-- Section 1: Soal Cerita -->
        <div style="background-color: #F8FAFC; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
          <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: bold;">Pertanyaan / Soal Cerita</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0F172A; font-style: italic;">"${questionText}"</p>
        </div>

        ${classificationSectionHTML}

        <!-- Section 2: Pemodelan & Parameter -->
        <div style="display: flex; gap: 20px; margin-bottom: 25px; page-break-inside: avoid;">
          <!-- Kiri: Variabel & Target -->
          <div style="flex: 1; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; background-color: #FFFFFF;">
            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #1E3A8A; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">📋 Variabel Masalah</h3>
            
            <p style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px; text-transform: uppercase;">Diketahui:</p>
            <ul style="margin: 0 0 15px 0; padding-left: 18px; line-height: 1.5;">
              ${knownListHTML}
            </ul>

            <p style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px; text-transform: uppercase;">Ditanyakan:</p>
            <p style="margin: 0; font-size: 13px; color: #0F172A; background-color: #FEF2F2; border: 1px solid #FEE2E2; padding: 8px 12px; border-radius: 6px; font-weight: 500;">
              ❓ ${targetText}
            </p>
          </div>

          <!-- Kanan: Konsep & Persamaan -->
          <div style="flex: 1; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; background-color: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #1E3A8A; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">🧠 Identifikasi Konsep</h3>
              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #0F172A; display: flex; align-items: center; gap: 6px;">
                🌟 ${resConceptName.textContent} <span style="font-size: 11px; background-color: #EEF2F6; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: normal; margin-left: auto;">${resConceptBadge.textContent}</span>
              </p>
              <p style="margin: 0; font-size: 12.5px; line-height: 1.5; color: #64748B;">${resConceptDesc.textContent}</p>
            </div>

            <div style="margin-top: 15px;">
              <p style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px; text-transform: uppercase;">Persamaan Relevan:</p>
              <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 10px; text-align: center; margin-bottom: 10px;">
                <code style="font-size: 16px; font-weight: bold; color: #1D4ED8; font-family: monospace;">${formulaMath}</code>
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.4;">
                ${formulaVarsHTML}
              </ul>
            </div>
          </div>
        </div>

        <!-- Section 3: Snapshot Visualisasi -->
        ${visualizerSectionHTML}

        <!-- Section 4: Langkah-langkah -->
        <div style="margin-top: 25px; margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; color: #1E3A8A; font-family: 'Space Grotesk', sans-serif; font-size: 16px; margin-top: 0; margin-bottom: 15px;">🔢 Langkah Penyelesaian Lengkap</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${stepsHTML}
          </div>
        </div>

        <!-- Section 5: Kesimpulan Akhir -->
        <div style="background: linear-gradient(135deg, #ECFDF5, #F0FDF4); border: 1.5px dashed #10B981; border-radius: 12px; padding: 20px; position: relative; margin-top: 30px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #065F46; font-weight: bold; display: flex; align-items: center; gap: 6px;">
            🎯 Kesimpulan Jawaban Akhir
          </h3>
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #065F46; line-height: 1.5;">
            ${answer}
          </p>
        </div>

        <!-- Document Footer -->
        <div style="margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 15px; text-align: center; font-size: 11px; color: #94A3B8;">
          <p style="margin: 0;">Laporan ini dibuat secara otomatis oleh <strong>PhysiViz AI</strong> - Prototype Media Pembelajaran Interaktif.</p>
          <p style="margin: 4px 0 0 0;">&copy; 2026 PhysiViz AI. Simpan catatan ini untuk dipelajari kembali di kemudian hari.</p>
        </div>
      `;

      // Options for html2pdf
      const opt = {
        margin: 10,
        filename: `PhysiViz_Catatan_Belajar_${resConceptName.textContent.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate the PDF and save
      await html2pdf().from(element).set(opt).save();
      showToast("Unduhan Berhasil!", "Catatan belajar dalam format PDF telah disimpan.", "success");

    } catch (err) {
      console.error("Failed to generate PDF:", err);
      showToast("Unduh PDF Gagal", "Gagal merender data analisis ke bentuk PDF.", "error");
      alert("Gagal membuat dokumen PDF. Silakan coba kembali.");
    } finally {
      // Restore button state
      btnDownloadPdf.disabled = false;
      btnDownloadPdf.innerHTML = originalBtnHTML;
    }
  }

  function resetToPlaceholder() {
    loadingWrapper.style.display = 'none';
    if (loadingProgress) loadingProgress.style.width = '0%';
    resultsContainer.classList.add('hidden');
    if (cardKlasifikasi) cardKlasifikasi.style.display = 'none';
    
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
        showToast("Materi Tidak Dikenali", "Silakan sesuaikan kata kunci soal atau gunakan contoh library.", "error");
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
        description: kbEntry.description || kbEntry.deskripsi,
        grade: kbEntry.grade,
        chapter: kbEntry.chapter,
        difficulty: kbEntry.difficulty,
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
        showToast("Variabel Belum Lengkap", `Butuh variabel: ${missingList}`, "error");
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
    
    // Save successful analysis to localStorage history
    saveToHistory(textarea.value.trim(), kbEntry.nama, kbEntry.id);
    
    // Show classification card and populate details
    if (cardKlasifikasi) {
      cardKlasifikasi.style.display = 'block';
      
      const isDark = document.body.classList.contains('dark');
      let primaryColor = '#3B82F6'; // Blue default
      let badgeLabel = '🏅 Kelas X SMA';
      let bgColor = isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 246, 255, 0.5)';
      let badgeBg = 'rgba(59, 130, 246, 0.08)';
      
      if (Result.grade === 11) {
        primaryColor = '#10B981'; // Green
        badgeLabel = '🏅 Kelas XI SMA';
        bgColor = isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(240, 253, 244, 0.5)';
        badgeBg = 'rgba(16, 185, 129, 0.08)';
      } else if (Result.grade === 12) {
        primaryColor = '#8B5CF6'; // Purple
        badgeLabel = '🏅 Kelas XII SMA';
        bgColor = isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(245, 243, 255, 0.5)';
        badgeBg = 'rgba(139, 92, 246, 0.08)';
      }

      // Main Card styles
      cardKlasifikasi.style.borderLeft = `6px solid ${primaryColor}`;
      cardKlasifikasi.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--color-border)';
      
      // Title Icon color
      if (klasifikasiTitleIcon) klasifikasiTitleIcon.style.color = primaryColor;

      // Badges & texts
      if (resGradeBadge) {
        resGradeBadge.textContent = badgeLabel;
        resGradeBadge.style.backgroundColor = badgeBg;
        resGradeBadge.style.color = primaryColor;
        resGradeBadge.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      }

      if (resGradeText) resGradeText.textContent = `Kelas ${Result.grade === 10 ? 'X' : Result.grade === 11 ? 'XI' : 'XII'} SMA`;
      if (resChapterText) resChapterText.textContent = Result.chapter;
      if (resDifficultyText) resDifficultyText.textContent = Result.difficulty;
      if (resClassificationDesc) resClassificationDesc.textContent = Result.description;

      // Icon wrapper stylings
      if (gradeIconWrapper) {
        gradeIconWrapper.style.backgroundColor = badgeBg;
        gradeIconWrapper.style.color = primaryColor;
      }
      if (chapterIconWrapper) {
        chapterIconWrapper.style.backgroundColor = badgeBg;
        chapterIconWrapper.style.color = primaryColor;
      }
      if (difficultyIconWrapper) {
        difficultyIconWrapper.style.backgroundColor = badgeBg;
        difficultyIconWrapper.style.color = primaryColor;
      }

      // Description container styling
      if (resClassificationDescBox) {
        resClassificationDescBox.style.backgroundColor = bgColor;
        resClassificationDescBox.style.borderLeftColor = primaryColor;
        resClassificationDescBox.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      }
      if (descInfoIcon) {
        descInfoIcon.style.color = primaryColor;
      }
    }
    
    // Concept Card
    resConceptBadge.textContent = kbEntry.nama.includes("Hukum") ? "Dinamika" : kbEntry.nama.includes("Gerak") ? "Kinematika" : "Fisika Dasar";
    resConceptName.textContent = Result.topic;
    resConceptDesc.textContent = kbEntry.deskripsi;
    
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
    
    // Show success toast notification
    showToast("Analisis Berhasil!", `Topik '${kbEntry.nama}' telah berhasil dimodelkan dan disimulasikan secara langsung.`, "success");
    
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
  async function injectPhysicsSimulation(type, variables) {
    const resultObj = {
      topic: type,
      variables: variables
    };
    const { AnimationManager } = await import('../visualization/animationManager.js');
    window.activeVisualizerManager = new AnimationManager(resVisualizerBox, resultObj);
  }

});

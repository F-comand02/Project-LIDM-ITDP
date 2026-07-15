# PhysiViz AI – AI Visualisasi Soal Fisika

**PhysiViz AI** adalah platform pembelajaran berbasis kecerdasan buatan (AI) interaktif prototipe yang dirancang untuk membantu siswa memvisualisasikan soal cerita fisika yang rumit menjadi simulasi gerak mekanis nyata, visualisasi rumus, serta langkah penyelesaian sistematis.

Website ini dibuat dengan mengutamakan performa, aksesibilitas tinggi, serta estetika visual yang modern bertema teknologi pendidikan futuristik (*Deep Blue and Neon-Purple Accent*).

---

## 🚀 Fitur Utama

1. **AI Keyword Extractor**: Sistem deteksi kata kunci dinamis client-side yang menganalisis soal cerita untuk mengidentifikasi kategori fisika, menyaring angka-angka penting, dan mencocokkan satuan fisika secara deterministik.
2. **Interactive Physics Simulations**:
   - **Gerak Lurus Berubah Beraturan (GLBB)**: Simulasi mobil yang melaju di lintasan dengan percepatan konstan lengkap dengan spidometer digital live dan indikator waktu nyata.
   - **Hukum II Newton**: Simulasi balok kayu yang ditarik oleh karakter dengan visualisasi tali tegang dan vektor gaya tarik $F$.
   - **Energi Potensial Gravitasi**: Simulasi jatuh bebas buah kelapa dari atas pohon lengkap dengan bar diagram live yang memperlihatkan konversi energi potensial menjadi energi kinetik (*Hukum Kekekalan Energi Mekanik*).
3. **Analisis Variabel Lengkap**: Menyajikan daftar "Diketahui", "Ditanyakan", persamaan rumus besar yang mudah dibaca, serta langkah-langkah penyederhanaan matematika terurut.
4. **Desain Modern & Responsif**: Menggunakan rancangan responsif Tailwind CSS yang tampak sempurna baik di layar seluler maupun monitor desktop ultra-lebar.

---

## 🛠️ Teknologi yang Digunakan

* **HTML5**: Struktur semantik yang ramah SEO dan aksesibilitas ramah pembaca layar (*screen-reader*).
* **CSS3**: Transisi halus, animasi melayang (*floating animation*), visualisasi bayangan neon (*neon glowing shadow*), dan grid latar belakang.
* **JavaScript Vanilla (ES6+)**: Logika pemrosesan ekspresi reguler (Regex), pembaruan DOM real-time, sinkronisasi siklus animasi, dan integrasi ikon dinamis.
* **Tailwind CSS v3 (via CDN)**: Utility styling modern untuk visual sekelas aplikasi SaaS premium.
* **Lucide Icons**: Koleksi ikon minimalis berbasis SVG yang bersih untuk meningkatkan kejelasan antarmuka.

---

## 📂 Struktur Proyek

```bash
physiviz-ai/
│
├── index.html     # Halaman utama dengan layout bento grid, hero, input, dan hasil
├── style.css      # Animasi fisika kustom, scroll-behavior, dan efek visual neon
├── script.js      # Logika ekstraksi teks, kalkulator rumus, dan engine animasi canvas
└── README.md      # Panduan dokumentasi proyek (file ini)
```

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

Aplikasi ini dirancang sepenuhnya mandiri (*fully standalone*) tanpa membutuhkan database server ataupun proses build Node.js.

1. **Unduh Proyek**: Ekstrak semua file ke dalam satu folder di komputer Anda.
2. **Double-Click index.html**: Cukup klik dua kali pada file `index.html` untuk membukanya secara langsung di peramban (Chrome, Edge, Safari, Firefox).
3. **Server Statis (Alternatif)**: Jika menggunakan Visual Studio Code, Anda dapat klik kanan dan pilih **"Open with Live Server"** untuk menjalankan server lokal statis.

---

## ☁️ Cara Deploy ke GitHub Pages

Sangat mudah untuk memublikasikan aplikasi ini ke internet secara gratis menggunakan GitHub Pages:

1. Buat sebuah repositori baru di akun GitHub Anda dengan nama `physiviz-ai`.
2. Push seluruh file di atas (`index.html`, `style.css`, `script.js`, `README.md`) ke repositori tersebut.
3. Buka tab **Settings** pada repositori Anda di GitHub.
4. Di bilah menu kiri, klik menu **Pages**.
5. Di bagian **Build and deployment**, atur Source ke **Deploy from a branch**.
6. Pilih branch utama Anda (`main` atau `master`) dan folder `/` (root), lalu klik **Save**.
7. Tunggu sekitar 1-2 menit, situs PhysiViz AI Anda akan aktif di URL `https://username.github.io/physiviz-ai/`.

---

*PhysiViz AI dirancang dengan dedikasi penuh terhadap penyederhanaan visual pengajaran ilmu sains fisika.*

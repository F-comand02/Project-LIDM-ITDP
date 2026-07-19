/**
 * Physics Knowledge Base for PhysiViz AI
 * Stores detailed educational metadata, keywords, equations, variables, examples,
 * educational panel contents, and visual configurations for 7 core physics topics.
 */

export const knowledgeBase = {
  glbb: {
    id: "glbb",
    nama: "Gerak Lurus Berubah Beraturan (GLBB)",
    grade: 10,
    chapter: "Kinematika",
    difficulty: "Mudah",
    description: "Soal ini termasuk materi Fisika SMA Kelas X karena membahas konsep Gerak Lurus Berubah Beraturan.",
    keyword: ["kecepatan", "percepatan", "waktu", "jarak", "mobil", "motor", "cepat", "lambat", "detik", "sekon", "m/s", "m/s²"],
    deskripsi: "Studi kinematika gerak linear satu dimensi dengan percepatan tetap konstan di mana kecepatan berubah secara teratur setiap detik.",
    rumus: {
      kecepatanAkhir: "v = v0 + a * t",
      jarakTempuh: "s = v0 * t + 0.5 * a * t²"
    },
    variabel: {
      v: { simbol: "v", nama: "Kecepatan Akhir", unit: "m/s", deskripsi: "Kecepatan partikel pada akhir interval waktu t." },
      v0: { simbol: "v0", nama: "Kecepatan Awal", unit: "m/s", deskripsi: "Kecepatan partikel di awal gerakan." },
      a: { simbol: "a", nama: "Percepatan", unit: "m/s²", deskripsi: "Laju perubahan kecepatan terhadap waktu." },
      t: { simbol: "t", nama: "Interval Waktu", unit: "s", deskripsi: "Durasi waktu berjalannya gerakan." },
      s: { simbol: "s", nama: "Jarak Tempuh", unit: "m", deskripsi: "Total jarak lintasan lurus yang dilewati." }
    },
    contohSoal: "Sebuah mobil mula-mula memiliki kecepatan 10 m/s kemudian dipercepat 2 m/s² selama 5 detik. Berapakah kecepatan akhirnya?",
    contohLibrary: [
      "Sebuah mobil mula-mula memiliki kecepatan 10 m/s kemudian dipercepat 2 m/s² selama 5 detik. Berapakah kecepatan akhirnya?",
      "Sebuah sepeda motor bergerak dengan kecepatan awal 5 m/s lalu dipercepat sebesar 3 m/s² selama 4 detik. Berapakah kecepatan akhirnya?",
      "Kereta api dipercepat dari kecepatan mula-mula 15 m/s dengan percepatan 1.5 m/s² selama 10 sekon. Berapa kecepatan akhirnya?",
      "Sebuah truk dipercepat secara konstan dengan percepatan 4 m/s² dari kecepatan awal 2 m/s selama 3 detik. Hitung kecepatan akhirnya!",
      "Sebuah pesawat lepas landas dengan kecepatan mula-mula 20 m/s dan dipercepat 5 m/s² selama 8 sekon. Berapakah kecepatan akhirnya?"
    ],
    eduPanel: {
      definisi: "Gerak benda pada lintasan lurus dengan percepatan tetap (konstan) sepanjang waktu.",
      konsep: "Kecepatan berubah secara teratur setiap detik. Jika percepatan positif (a > 0), gerakan dipercepat. Jika negatif (a < 0), gerakan diperlambat.",
      rumusDasar: "v_t = v_0 + a * t<br>s = v_0 * t + 0.5 * a * t²<br>v_t² = v_0² + 2 * a * s",
      satuan: "v (m/s), v_0 (m/s), a (m/s²), t (s), s (m)",
      tips: "Perhatikan kata kunci: 'mula-mula diam' berarti kecepatan awal v_0 = 0 m/s; 'direm hingga berhenti' berarti kecepatan akhir v_t = 0 m/s.",
      kesalahan: "Sering lupa mengkuadratkan nilai waktu (t²) pada rumus s, atau keliru memasukkan nilai percepatan negatif (-) untuk kasus pengereman."
    },
    visualizationType: "glbb"
  },
  
  parabola: {
    id: "parabola",
    nama: "Gerak Parabola (Projectile Motion)",
    grade: 10,
    chapter: "Kinematika",
    difficulty: "Sedang",
    description: "Soal ini termasuk materi Fisika SMA Kelas X karena membahas konsep Gerak Parabola.",
    keyword: ["bola", "peluru", "sudut", "elevasi", "parabola", "lempar", "tembak", "proyektil", "derajat", "gravitasi"],
    deskripsi: "Perpaduan gerak lurus beraturan (GLB) arah horizontal dan gerak lurus berubah beraturan (GLBB) vertikal di bawah pengaruh gravitasi.",
    rumus: {
      tinggiMaks: "H = (v0² * sin²θ) / (2 * g)",
      jarakMaks: "R = (v0² * sin(2θ)) / g",
      waktuPuncak: "T = (v0 * sinθ) / g"
    },
    variabel: {
      v0: { simbol: "v0", nama: "Kecepatan Awal", unit: "m/s", deskripsi: "Kecepatan luncur awal proyektil." },
      sudut: { simbol: "θ", nama: "Sudut Elevasi", unit: "°", deskripsi: "Sudut dongkrak arah lemparan terhadap garis mendatar." },
      g: { simbol: "g", nama: "Percepatan Gravitasi", unit: "m/s²", deskripsi: "Konstanta percepatan gravitasi bumi (default 10 m/s²)." },
      H: { simbol: "H", nama: "Tinggi Maksimum", unit: "m", deskripsi: "Ketinggian maksimum tertinggi yang dicapai." },
      R: { simbol: "R", nama: "Jarak Maksimum", unit: "m", deskripsi: "Jarak jangkauan horizontal terjauh." },
      T: { simbol: "T", nama: "Waktu ke Puncak", unit: "s", deskripsi: "Waktu yang dibutuhkan untuk mencapai titik tertinggi." }
    },
    contohSoal: "Sebuah bola ditendang dengan kecepatan awal 20 m/s pada sudut elevasi 30°. Berapakah tinggi maksimum yang dicapai bola tersebut?",
    contohLibrary: [
      "Sebuah bola ditendang dengan kecepatan awal 20 m/s pada sudut elevasi 30°. Berapakah tinggi maksimum yang dicapai bola tersebut?",
      "Sebuah peluru ditembakkan dengan kecepatan awal 50 m/s dan sudut elevasi 45 derajat. Hitunglah tinggi maksimum proyektil!",
      "Atlet melemparkan lembing dengan kecepatan awal 15 m/s pada sudut 60 derajat. Berapakah tinggi maksimum lemparannya?",
      "Sebuah bola basket dilempar dengan kecepatan 10 m/s pada sudut 30 derajat. Berapa tinggi maksimum lintasan bola?",
      "Kiper menendang bola dengan kecepatan awal 25 m/s membentuk sudut elevasi 45°. Hitunglah tinggi maksimum bola itu!"
    ],
    eduPanel: {
      definisi: "Gerak dua dimensi melengkung yang terbentuk dari kombinasi GLB horizontal dan GLBB vertikal.",
      konsep: "Pada sumbu mendatar (X) kecepatan bernilai tetap karena tidak ada hambatan udara. Pada sumbu tegak (Y) kecepatan dipengaruhi gaya tarik gravitasi (g).",
      rumusDasar: "H_max = (v_0² * sin²θ) / (2g)<br>R_max = (v_0² * sin(2θ)) / g<br>t_puncak = (v_0 * sinθ) / g",
      satuan: "v_0 (m/s), θ (derajat °), g (m/s²), H_max (m), R_max (m)",
      tips: "Gunakan percepatan gravitasi g = 10 m/s² secara default jika tidak disebutkan di soal. Perhatikan bahwa tinggi maksimum menggunakan sin²θ sedangkan jarak maksimum menggunakan sin(2θ).",
      kesalahan: "Keliru menyamakan antara sin²θ (mengkuadratkan hasil sin) dengan sin(2θ) (menghitung sin dari sudut yang dikali dua). Hasilnya akan sangat berbeda!"
    },
    visualizationType: "parabola"
  },
  
  newton: {
    id: "newton",
    nama: "Hukum II Newton (Dinamika Gerak)",
    grade: 10,
    chapter: "Dinamika",
    difficulty: "Sedang",
    description: "Soal ini termasuk materi Fisika SMA Kelas X karena membahas konsep Hukum Newton.",
    keyword: ["gaya", "massa", "gesekan", "bidang miring", "normal", "tarik", "dorong", "balok", "newton", "kg"],
    deskripsi: "Hubungan dinamika di mana percepatan benda berbanding lurus dengan gaya bersih luar dan berbanding terbalik dengan massanya.",
    rumus: {
      hukumNewton: "F = m * a"
    },
    variabel: {
      F: { simbol: "F", nama: "Gaya Total", unit: "N", deskripsi: "Resultan gaya penarik atau pendorong yang bekerja pada benda." },
      m: { simbol: "m", nama: "Massa Benda", unit: "kg", deskripsi: "Massa inersia ukuran kelembaman objek." },
      a: { simbol: "a", nama: "Percepatan", unit: "m/s²", deskripsi: "Akselerasi gerak yang timbul akibat gaya bersih." }
    },
    contohSoal: "Sebuah balok bermassa 10 kg ditarik dengan gaya mendatar sebesar 30 Newton di atas permukaan meja yang licin tanpa gesekan. Hitunglah percepatan balok tersebut!",
    contohLibrary: [
      "Sebuah balok bermassa 10 kg ditarik dengan gaya mendatar sebesar 30 Newton di atas permukaan meja yang licin tanpa gesekan. Hitunglah percepatan balok tersebut!",
      "Sebuah kotak kayu bermassa 5 kg didorong dengan gaya horizontal 20 Newton di atas lantai licin. Tentukan percepatannya!",
      "Benda bermassa 8 kg ditarik dengan gaya 16 Newton. Berapakah percepatan gerak benda tersebut?",
      "Sebuah lemari bermassa 50 kg didorong oleh gaya sebesar 150 Newton. Berapakah percepatan lemari tersebut?",
      "Mobil mainan bermassa 2 kg ditarik dengan gaya sebesar 6 Newton. Hitung percepatan mobil mainan itu!"
    ],
    eduPanel: {
      definisi: "Hukum yang menjelaskan bahwa perubahan gerak (percepatan) berbanding lurus dengan resultan gaya yang bekerja pada benda.",
      konsep: "Massa (m) adalah ukuran kelembaman benda (semakin besar massa, semakin malas benda bergerak). Gaya (F) adalah penyebab utama benda mengalami akselerasi.",
      rumusDasar: "F = m * a<br>a = F / m<br>m = F / a",
      satuan: "F (Newton atau kg·m/s²), m (kg), a (m/s²)",
      tips: "Pada bidang licin sempurna, gaya gesek diabaikan (f_gesek = 0). Pastikan satuan massa benda sudah dalam Kilogram (kg), jika masih Gram (g) bagi dengan 1000 terlebih dahulu.",
      kesalahan: "Lupa menjumlahkan gaya jika ada lebih dari satu gaya bekerja, atau lupa mengonversi satuan berat/massa non-SI ke SI."
    },
    visualizationType: "newton"
  },
  
  pascal: {
    id: "pascal",
    nama: "Hukum Pascal (Mekanika Fluida)",
    grade: 11,
    chapter: "Fluida",
    difficulty: "Mudah",
    description: "Soal ini termasuk materi Fisika SMA Kelas XI karena membahas konsep Hukum Pascal.",
    keyword: ["hidrolik", "fluida", "dongkrak", "tekanan", "piston", "penampang", "bejana", "pascal", "cm²"],
    deskripsi: "Prinsip hidrolik di mana tekanan eksternal pada fluida tertutup akan diteruskan ke segala arah secara merata dengan besar sama.",
    rumus: {
      tekananPascal: "F1 / A1 = F2 / A2"
    },
    variabel: {
      F1: { simbol: "F1", nama: "Gaya Piston 1", unit: "N", deskripsi: "Gaya input penekan piston kecil." },
      A1: { simbol: "A1", nama: "Luas Penampang 1", unit: "cm²", deskripsi: "Luas penampang alas piston kecil." },
      F2: { simbol: "F2", nama: "Gaya Piston 2", unit: "N", deskripsi: "Gaya angkat output piston besar." },
      A2: { simbol: "A2", nama: "Luas Penampang 2", unit: "cm²", deskripsi: "Luas penampang alas piston besar." }
    },
    contohSoal: "Penampang kecil sebuah dongkrak hidrolik memiliki luas 5 cm² dan diberi gaya sebesar 10 N. Jika luas penampang besar adalah 100 cm², berapakah gaya angkat pada penampang besar?",
    contohLibrary: [
      "Penampang kecil sebuah dongkrak hidrolik memiliki luas 5 cm² dan diberi gaya sebesar 10 N. Jika luas penampang besar adalah 100 cm², berapakah gaya angkat pada penampang besar?",
      "Sebuah dongkrak hidrolik dengan penampang piston kecil 2 cm² ditekan dengan gaya 20 N. Berapa gaya angkat pada piston besar bermassa luas 50 cm²?",
      "Alat pengangkat mobil hidrolik memiliki piston kecil seluas 10 cm² dan piston besar seluas 500 cm². Jika gaya input adalah 50 N, hitunglah gaya outputnya!",
      "Pada sistem hidrolik, piston kecil berluas 4 cm² diberi gaya penekan sebesar 8 N. Berapakah gaya angkat yang dihasilkan pada piston besar berluas 80 cm²?",
      "Sebuah bejana hidrolik memiliki penampang input 15 cm² dengan gaya tekan 30 N. Berapakah gaya output pada penampang besar 150 cm²?"
    ],
    eduPanel: {
      definisi: "Tekanan yang diberikan pada zat cair dalam wadah tertutup akan diteruskan ke segala bagian fluida dan dinding wadah tanpa mengalami pengurangan.",
      konsep: "Tekanan di kedua piston adalah sama (P_1 = P_2). Gaya berbanding lurus dengan luas penampang, sehingga penampang besar mendapatkan gaya dorong mekanis yang jauh lebih besar.",
      rumusDasar: "F_1 / A_1 = F_2 / A_2<br>F_2 = F_1 * (A_2 / A_1)",
      satuan: "F_1, F_2 (Newton), A_1, A_2 (cm² atau m²)",
      tips: "Anda tidak perlu mengonversi satuan luas penampang dari cm² ke m² asalkan kedua piston (A_1 dan A_2) menggunakan satuan yang sama karena bernilai rasio perbandingan.",
      kesalahan: "Terbalik memasangkan variabel, misalnya mengalikan gaya piston kecil (F_1) dengan luas penampang kecil (A_1) bukannya membaginya."
    },
    visualizationType: "pascal"
  },
  
  gelombang: {
    id: "gelombang",
    nama: "Gelombang Mekanik",
    grade: 11,
    chapter: "Gelombang",
    difficulty: "Sedang",
    description: "Soal ini termasuk materi Fisika SMA Kelas XI karena membahas konsep Gelombang Berjalan atau Gelombang Stasioner.",
    keyword: ["gelombang", "sinus", "amplitudo", "frekuensi", "panjang gelombang", "cepat rambat", "rambat", "periode", "hz", "getaran"],
    deskripsi: "Perambatan getaran energi periodik dalam suatu medium tanpa disertai perpindahan partikel mediumnya secara permanen.",
    rumus: {
      cepatRambat: "v = λ * f",
      frekuensiPeriode: "f = 1 / T"
    },
    variabel: {
      v: { simbol: "v", nama: "Cepat Rambat", unit: "m/s", deskripsi: "Kecepatan merambatnya gelombang dalam medium." },
      lambda: { simbol: "λ", nama: "Panjang Gelombang", unit: "m", deskripsi: "Jarak antara dua puncak atau dua lembah yang berurutan." },
      f: { simbol: "f", nama: "Frekuensi", unit: "Hz", deskripsi: "Banyaknya gelombang penuh yang terbentuk tiap detik." },
      T: { simbol: "T", nama: "Periode", unit: "s", deskripsi: "Waktu yang dibutuhkan untuk menempuh satu gelombang penuh." },
      A: { simbol: "A", nama: "Amplitudo", unit: "m", deskripsi: "Simpangan terjauh dari titik setimbang gelombang." }
    },
    contohSoal: "Sebuah gelombang merambat dengan frekuensi 5 Hz dan memiliki panjang gelombang 4 meter. Hitunglah cepat rambat gelombang tersebut!",
    contohLibrary: [
      "Sebuah gelombang merambat dengan frekuensi 5 Hz dan memiliki panjang gelombang 4 meter. Hitunglah cepat rambat gelombang tersebut!",
      "Gelombang tali merambat dengan frekuensi 10 Hz dan memiliki panjang gelombang 2 m. Berapakah cepat rambat gelombang tali itu?",
      "Gelombang air laut merambat dengan panjang gelombang 6 meter dan frekuensi getaran 2 Hz. Berapa cepat rambat gelombangnya?",
      "Sebuah getaran merambat dengan panjang gelombang 3 m pada frekuensi 4 Hz. Hitunglah cepat rambat gelombang tersebut!",
      "Gelombang transversal merambat pada dawai dengan frekuensi 20 Hz dan panjang gelombang 0.5 m. Berapakah cepat rambatnya?"
    ],
    eduPanel: {
      definisi: "Getaran atau usikan periodik yang merambat membawa energi melalui suatu medium.",
      konsep: "Cepat rambat (v) adalah kecepatan tempuh satu gelombang penuh (λ) dalam satu periode (T). Amplitudo (A) melambangkan kekuatan energi, bukan kecepatan rambat.",
      rumusDasar: "v = λ * f<br>f = 1 / T<br>v = λ / T",
      satuan: "v (m/s), λ (meter), f (Hertz Hz), T (sekon s)",
      tips: "Kecepatan rambat gelombang mekanik hanya bergantung pada sifat elastisitas dan kerapatan medium perambatannya, bukan pada frekuensi getarannya.",
      kesalahan: "Sering terbalik menghitung Frekuensi (f = getaran / detik) dengan Periode (T = detik / getaran), atau salah mengartikan panjang beberapa bukit-lembah sebagai satu λ."
    },
    visualizationType: "gelombang"
  },
  
  kirchhoff: {
    id: "kirchhoff",
    nama: "Hukum I Kirchhoff (Kelistrikan)",
    grade: 12,
    chapter: "Listrik Dinamis",
    difficulty: "Sulit",
    description: "Soal ini termasuk materi Fisika SMA Kelas XII karena membahas Hukum Kirchhoff.",
    keyword: ["resistor", "loop", "arus", "tegangan", "baterai", "kirchhoff", "percabangan", "masuk", "keluar", "ampere"],
    deskripsi: "Hukum kekekalan muatan listrik di mana jumlah arus listrik yang memasuki suatu titik cabang sama dengan jumlah arus yang keluar.",
    rumus: {
      arusKirchhoff: "I_masuk = I1 + I2"
    },
    variabel: {
      I_masuk: { simbol: "I_masuk", nama: "Arus Masuk Total", unit: "A", deskripsi: "Jumlah seluruh arus listrik yang menuju titik percabangan." },
      I1: { simbol: "I1", nama: "Arus Cabang 1", unit: "A", deskripsi: "Arus keluar yang melalui saluran percabangan pertama." },
      I2: { simbol: "I2", nama: "Arus Cabang 2", unit: "A", deskripsi: "Arus keluar yang melalui saluran percabangan kedua." }
    },
    contohSoal: "Pada suatu percabangan listrik, terdapat arus masuk sebesar 10 A. Percabangan tersebut terbagi menjadi dua cabang keluar, di mana cabang pertama membawa arus sebesar 4 A. Hitunglah besar arus pada cabang kedua!",
    contohLibrary: [
      "Pada suatu percabangan listrik, terdapat arus masuk sebesar 10 A. Percabangan tersebut terbagi menjadi dua cabang keluar, di mana cabang pertama membawa arus sebesar 4 A. Hitunglah besar arus pada cabang kedua!",
      "Arus listrik masuk ke percabangan sebesar 15 A. Terbagi menjadi cabang pertama I1 sebesar 6 A. Berapakah besar arus pada cabang kedua I2?",
      "Arus total masuk titik percabangan adalah 8 A. Jika arus cabang pertama adalah 3 A, berapakah arus cabang kedua?",
      "Sebuah rangkaian listrik memiliki arus masuk 5 A. Jika mengalir melalui cabang 1 sebesar 2 A, berapa besar arus yang melalui cabang 2?",
      "Pada persimpangan kawat, arus masuk utama bernilai 12 A. Jika kawat cabang 1 terukur arus 5 A, berapakah arus kawat cabang 2?"
    ],
    eduPanel: {
      definisi: "Hukum kekekalan muatan listrik pada jaringan kawat rangkaian tertutup bercabang.",
      konsep: "Arus total yang masuk ke titik simpul percabangan bernilai persis sama dengan arus total yang keluar meninggalkan simpul tersebut (Muatan kekal).",
      rumusDasar: "ΣI_masuk = ΣI_keluar<br>I_masuk = I_1 + I_2 + ... + I_n",
      satuan: "I (Ampere A)",
      tips: "Perhatikan arah tanda panah arus listrik pada kawat kawat percabangan. Panah mengarah ke simpul simpul = Masuk; menjauhi simpul simpul = Keluar.",
      kesalahan: "Keliru mengelompokkan arah arus listrik (menukar kawat masuk sebagai kawat keluar) sehingga nilai persamaan matematikanya salah."
    },
    visualizationType: "kirchhoff"
  },
  
  lorentz: {
    id: "lorentz",
    nama: "Gaya Lorentz (Elektromagnetisme)",
    grade: 12,
    chapter: "Elektromagnetisme",
    difficulty: "Sulit",
    description: "Soal ini termasuk materi Fisika SMA Kelas XII karena membahas konsep Gaya Lorentz.",
    keyword: ["magnet", "medan magnet", "arus", "gaya lorentz", "muatan", "tesla", "kawat", "konduktor", "lorentz"],
    deskripsi: "Gaya mekanis yang timbul akibat interaksi kawat penghantar berarus listrik yang ditembus medan magnet homogen.",
    rumus: {
      gayaLorentz: "F = B * I * L * sinθ"
    },
    variabel: {
      F: { simbol: "F", nama: "Gaya Lorentz", unit: "N", deskripsi: "Gaya magnetik mekanik penarik kawat penghantar." },
      B: { simbol: "B", nama: "Kerapatan Medan Magnet", unit: "T", deskripsi: "Kuat fluks magnetik homogen luar." },
      I: { simbol: "I", nama: "Arus Listrik", unit: "A", deskripsi: "Kuat arus listrik searah pengalir kawat konduktor." },
      L: { simbol: "L", nama: "Panjang Kawat", unit: "m", deskripsi: "Panjang fisik kawat konduktor di daerah magnetik." },
      sudut: { simbol: "θ", nama: "Sudut Interaksi", unit: "°", deskripsi: "Sudut persilangan antara garis arus dan fluks magnet." }
    },
    contohSoal: "Sebuah kawat penghantar sepanjang 2 meter dialiri arus listrik sebesar 5 A dalam medan magnet homogen 4 Tesla secara tegak lurus. Berapakah besar Gaya Lorentz yang bekerja pada kawat tersebut?",
    contohLibrary: [
      "Sebuah kawat penghantar sepanjang 2 meter dialiri arus listrik sebesar 5 A dalam medan magnet homogen 4 Tesla secara tegak lurus. Berapakah besar Gaya Lorentz yang bekerja pada kawat tersebut?",
      "Kawat lurus berarus 3 A berada dalam medan magnet 2 Tesla dengan panjang kawat 4 m secara tegak lurus. Hitung Gaya Lorentz yang dihasilkan!",
      "Kawat konduktor sepanjang 5 meter dialiri arus listrik 2 A dalam medan magnet 3 Tesla. Hitunglah besar Gaya Lorentz kawat tersebut!",
      "Sebuah kawat 1 meter dialiri arus 10 A berada di bawah pengaruh medan magnet homogen 5 Tesla. Berapakah Gaya Lorentz pada kawat?",
      "Kawat tembaga sepanjang 3 meter dialiri arus listrik sebesar 4 A dan dimasukkan ke dalam medan magnet 1 Tesla. Berapakah Gaya Lorentz yang bekerja?"
    ],
    eduPanel: {
      definisi: "Gaya fisik mekanik yang bekerja pada muatan bergerak atau kawat berarus di dalam ruang berpola medan magnet homogen.",
      konsep: "Arah Gaya Lorentz selalu saling tegak lurus tegak lurus dengan arah Arus listrik (I) dan arah Medan magnet (B) mengikuti aturan tangan kanan.",
      rumusDasar: "F = B * I * L * sinθ",
      satuan: "F (Newton), B (Tesla), I (Ampere), L (meter), θ (derajat)",
      tips: "Gunakan Kaidah Tangan Kanan: Ibu Jari = Kuat Arus (I), Jari Telunjuk = Medan Magnet (B), Jari Tengah / Telapak Tangan = Gaya Lorentz (F). Jika kawat diletakkan tegak lurus, sudut θ = 90° sehingga sin(90°) = 1.",
      kesalahan: "Menggunakan kawat tangan kiri sehingga arah resultan gaya terbalik 180 derajat, atau lupa memasukkan nilai trigonometri sinθ jika sudut interaksi tidak siku-siku."
    },
    visualizationType: "lorentz"
  }
};

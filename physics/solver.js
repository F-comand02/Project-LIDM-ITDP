/**
 * Physics Solver Engine for PhysiViz AI
 * Handles calculations, verification, and step-by-step mathematical derivation
 * for all 7 supported physics topics.
 * 
 * Strictly aligned with standard Indonesian High School Physics Curricula (KTSP, Kurikulum 2013, Kurikulum Merdeka).
 */

/**
 * Utility to check if a value is invalid (missing, null, empty string, or NaN)
 * @param {*} val - Value to check
 * @returns {boolean}
 */
const isInvalid = (val) => {
  return val === undefined || val === null || val === "" || isNaN(Number(val));
};

/**
 * Utility to safely convert a variable to a valid number, avoiding NaN crashes
 * @param {*} val - Any value to convert
 * @param {number} defaultVal - Default fallback if invalid
 * @returns {number}
 */
const safeNum = (val, defaultVal = 0) => {
  if (val === undefined || val === null || val === "") return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
};

/**
 * Utility to format numbers beautifully for Indonesian educational displays.
 * Integers remain integers, decimals are rounded to up to 3 decimal places without trailing zeros.
 * @param {number} num - Number to format
 * @param {number} maxDecimals - Maximum decimal points
 * @returns {string}
 */
const formatNum = (num, maxDecimals = 3) => {
  const parsed = safeNum(num);
  if (Number.isInteger(parsed)) {
    return parsed.toString();
  }
  // Format to fixed decimals, then parseFloat to strip trailing zeros
  return parseFloat(parsed.toFixed(maxDecimals)).toString();
};

/**
 * Solves GLBB (Gerak Lurus Berubah Beraturan)
 * Formula: vt = v0 + a * t
 * @param {Object} vars - Extracted variables
 */
export const solveGLBB = (vars = {}) => {
  const required = ["v0", "a", "waktu"];
  const missing = required.filter(key => isInvalid(vars[key]));

  if (missing.length > 0) {
    return {
      status: "incomplete",
      missing: missing.map(m => m === "waktu" ? "Interval Waktu (t)" : m === "v0" ? "Kecepatan Awal (v₀)" : "Percepatan (a)")
    };
  }

  const v0 = safeNum(vars.v0, 0);
  const a = safeNum(vars.a, 0);
  const t = safeNum(vars.waktu, 0);

  if (t < 0) {
    return {
      status: "incomplete",
      missing: ["Interval Waktu (t) tidak boleh negatif"]
    };
  }

  const vt = v0 + a * t;
  const s = v0 * t + 0.5 * a * (t ** 2);

  const v0Str = formatNum(v0);
  const aStr = formatNum(a);
  const tStr = formatNum(t);
  const vtStr = formatNum(vt);
  const sStr = formatNum(s);
  const atProductStr = formatNum(a * t);

  return {
    status: "success",
    known: [
      { name: "Kecepatan Awal", sym: "v₀", val: v0Str, unit: "m/s" },
      { name: "Percepatan", sym: "a", val: aStr, unit: "m/s²" },
      { name: "Waktu Tempuh", sym: "t", val: tStr, unit: "s" }
    ],
    asked: "Kecepatan Akhir (vₜ)",
    formula: "vₜ = v₀ + a · t",
    steps: [
      `Identifikasi variabel yang diberikan: Kecepatan awal (v₀ = ${v0Str} m/s), percepatan konstan (a = ${aStr} m/s²), dan durasi waktu (t = ${tStr} s).`,
      `Pilih rumus GLBB pertama yang menghubungkan kecepatan akhir (vₜ) dengan variabel tersebut: vₜ = v₀ + a · t.`,
      `Substitusikan nilai ke dalam rumus: vₜ = ${v0Str} + (${aStr} × ${tStr}).`,
      `Hitung hasil perkalian percepatan dan waktu terlebih dahulu: ${aStr} × ${tStr} = ${atProductStr} m/s.`,
      `Tambahkan dengan kecepatan awal untuk mendapatkan hasil akhir: vₜ = ${v0Str} + ${atProductStr} = ${vtStr} m/s.`
    ],
    answer: `Kecepatan akhir benda setelah dipercepat selama ${tStr} detik adalah sebesar <strong>${vtStr} m/s</strong> (benda juga menempuh jarak sejauh ${sStr} meter).`,
    unit: "m/s",
    value: parseFloat(vtStr)
  };
};

/**
 * Solves Gerak Parabola (Projectile Motion)
 * Formula: H_max = (v0^2 * sin^2(theta)) / (2 * g)
 * @param {Object} vars - Extracted variables
 */
export const solveProjectile = (vars = {}) => {
  const required = ["v0", "sudut"];
  const missing = required.filter(key => isInvalid(vars[key]));

  if (missing.length > 0) {
    return {
      status: "incomplete",
      missing: missing.map(m => m === "v0" ? "Kecepatan Awal (v₀)" : "Sudut Elevasi (θ)")
    };
  }

  const v0 = safeNum(vars.v0, 0);
  const theta = safeNum(vars.sudut, 0);
  const g = Math.max(0.1, vars.g !== undefined && !isInvalid(vars.g) && Number(vars.g) > 0 ? Number(vars.g) : 10);

  if (v0 < 0) {
    return {
      status: "incomplete",
      missing: ["Kecepatan Awal (v₀) tidak boleh bernilai negatif"]
    };
  }

  if (theta < 0 || theta > 90) {
    return {
      status: "incomplete",
      missing: ["Sudut Elevasi (θ) harus bernilai antara 0° dan 90°"]
    };
  }

  const rad = (theta * Math.PI) / 180;
  const sinTheta = Math.sin(rad);
  const sinSquared = sinTheta * sinTheta;
  const H = (v0 ** 2 * sinSquared) / (2 * g);
  
  // Extra metrics
  const R = (v0 ** 2 * Math.sin(2 * rad)) / g;
  const T_puncak = (v0 * sinTheta) / g;

  const v0Str = formatNum(v0);
  const thetaStr = formatNum(theta);
  const gStr = formatNum(g);
  const HStr = formatNum(H);
  const RStr = formatNum(R);
  const sinThetaStr = formatNum(sinTheta, 4);
  const sinSquaredStr = formatNum(sinSquared, 4);
  const v0SquaredStr = formatNum(v0 ** 2);
  const numProdStr = formatNum(v0 ** 2 * sinSquared);
  const denProdStr = formatNum(2 * g);

  return {
    status: "success",
    known: [
      { name: "Kecepatan Awal", sym: "v₀", val: v0Str, unit: "m/s" },
      { name: "Sudut Elevasi", sym: "θ", val: thetaStr, unit: "°" },
      { name: "Gravitasi Bumi", sym: "g", val: gStr, unit: "m/s²" }
    ],
    asked: "Tinggi Maksimum (H_max)",
    formula: "H_max = (v₀² · sin²θ) / (2g)",
    steps: [
      `Identifikasi parameter awal: Kecepatan awal (v₀ = ${v0Str} m/s), sudut elevasi (θ = ${thetaStr}°), dan konstanta gravitasi bumi (g = ${gStr} m/s²).`,
      `Gunakan rumus tinggi puncak lintasan gerak parabola: H_max = (v₀² · sin²θ) / (2g).`,
      `Hitung nilai trigonometri sinus sudut: sin(${thetaStr}°) = ${sinThetaStr}. Kuadratkan hasilnya: sin²(${thetaStr}°) = ${sinSquaredStr}.`,
      `Hitung kuadrat kecepatan awal: v₀² = ${v0Str}² = ${v0SquaredStr} m²/s².`,
      `Masukkan seluruh nilai ke dalam persamaan: H_max = (${v0SquaredStr} × ${sinSquaredStr}) / (2 × ${gStr}).`,
      `Sederhanakan operasi pembagian: H_max = ${numProdStr} / ${denProdStr} = ${HStr} meter.`
    ],
    answer: `Tinggi maksimum yang berhasil dicapai oleh proyektil adalah <strong>${HStr} meter</strong> (dengan jangkauan horizontal terjauh ${RStr} meter).`,
    unit: "m",
    value: parseFloat(HStr)
  };
};

/**
 * Solves Hukum II Newton
 * Formula: a = F / m
 * @param {Object} vars - Extracted variables
 */
export const solveNewton = (vars = {}) => {
  const required = ["massa", "gaya"];
  const missing = required.filter(key => isInvalid(vars[key]));

  if (missing.length > 0) {
    return {
      status: "incomplete",
      missing: missing.map(m => m === "massa" ? "Massa Benda (m)" : "Gaya Tarik (F)")
    };
  }

  const m = safeNum(vars.massa, 0);
  const F = safeNum(vars.gaya, 0);

  if (m <= 0) {
    return {
      status: "incomplete",
      missing: ["Massa Benda (m) harus lebih besar dari 0 kg"]
    };
  }

  const a = F / m;

  const mStr = formatNum(m);
  const FStr = formatNum(F);
  const aStr = formatNum(a);

  return {
    status: "success",
    known: [
      { name: "Massa Benda", sym: "m", val: mStr, unit: "kg" },
      { name: "Gaya Tarik", sym: "F", val: FStr, unit: "N" }
    ],
    asked: "Percepatan Balok (a)",
    formula: "a = F / m",
    steps: [
      `Identifikasi variabel dari soal: Massa benda (m = ${mStr} kg), dan gaya bersih mendatar (F = ${FStr} N).`,
      `Terapkan Hukum II Newton yang menyatakan F = m · a.`,
      `Susun ulang persamaan untuk mencari percepatan (a): a = F / m.`,
      `Substitusikan nilai ke rumus: a = ${FStr} / ${mStr}.`,
      `Selesaikan pembagian untuk memperoleh nilai percepatan: a = ${aStr} m/s².`
    ],
    answer: `Percepatan yang dialami oleh balok tersebut akibat gaya tarik horizontal adalah <strong>${aStr} m/s²</strong>.`,
    unit: "m/s²",
    value: parseFloat(aStr)
  };
};

/**
 * Solves Hukum Pascal
 * Formula: F2 = F1 * (A2 / A1)
 * Supports Areas (cm²), Diameters (cm), or Radii (cm)
 * @param {Object} vars - Extracted variables
 */
export const solvePascal = (vars = {}) => {
  const required = ["F1", "A1", "A2"];
  const missing = required.filter(key => isInvalid(vars[key]));

  if (missing.length > 0) {
    return {
      status: "incomplete",
      missing: missing.map(m => m === "F1" ? "Gaya Input (F₁)" : m === "A1" ? "Piston Kecil 1 (A₁/d₁/r₁)" : "Piston Besar 2 (A₂/d₂/r₂)")
    };
  }

  const F1 = safeNum(vars.F1, 0);
  const A1 = safeNum(vars.A1, 0);
  const A2 = safeNum(vars.A2, 0);
  const isDiameter = !!vars.isDiameter;
  const isRadius = !!vars.isRadius;

  if (A1 <= 0 || A2 <= 0) {
    return {
      status: "incomplete",
      missing: [
        A1 <= 0 ? "Luas/Diameter/Radius piston kecil (A₁/d₁/r₁) harus lebih besar dari 0" : "Luas/Diameter/Radius piston besar (A₂/d₂/r₂) harus lebih besar dari 0"
      ]
    };
  }

  let ratio = A2 / A1;
  const F1Str = formatNum(F1);
  const A1Str = formatNum(A1);
  const A2Str = formatNum(A2);

  let ratioExplanation = `Hitung rasio luas penampang: A₂ / A₁ = ${A2Str} / ${A1Str} = ${formatNum(ratio)} kali lipat.`;
  let formulaStr = "F₂ = F₁ · (A₂ / A₁)";
  let stepSubstitution = `Masukkan nilai ke dalam persamaan Hukum Pascal: F₂ = ${F1Str} × (${A2Str} / ${A1Str}).`;
  let stepCalculation = `Kalikan dengan gaya input untuk hasil akhir: F₂ = ${F1Str} × ${formatNum(ratio)} = ${formatNum(F1 * ratio)} N.`;

  if (isDiameter || isRadius) {
    ratio = (A2 / A1) ** 2;
    const term = isDiameter ? "diameter" : "jari-jari";
    const symbol = isDiameter ? "d" : "r";
    const rawRatioStr = formatNum(A2 / A1);
    const sqRatioStr = formatNum(ratio);
    ratioExplanation = `Karena parameter yang diketahui adalah ${term} (${symbol}₁ dan ${symbol}₂), maka gaya berbanding lurus dengan kuadrat rasionya: (${symbol}₂ / ${symbol}₁)² = (${A2Str} / ${A1Str})² = ${sqRatioStr} kali lipat.`;
    formulaStr = isDiameter ? "F₂ = F₁ · (d₂ / d₁)²" : "F₂ = F₁ · (r₂ / r₁)²";
    stepSubstitution = `Masukkan nilai ${term} ke dalam persamaan kuadrat rasio Hukum Pascal: F₂ = ${F1Str} × (${A2Str} / ${A1Str})².`;
    stepCalculation = `Kalikan dengan gaya input untuk memperoleh gaya output mekanis: F₂ = ${F1Str} × ${sqRatioStr} = ${formatNum(F1 * ratio)} N.`;
  }

  const F2 = F1 * ratio;
  const F2Str = formatNum(F2);

  return {
    status: "success",
    known: [
      { name: isDiameter ? "Diameter Piston 1" : isRadius ? "Radius Piston 1" : "Luas Penampang 1", sym: isDiameter ? "d₁" : isRadius ? "r₁" : "A₁", val: A1Str, unit: isDiameter || isRadius ? "cm" : "cm²" },
      { name: "Gaya Penampang 1", sym: "F₁", val: F1Str, unit: "N" },
      { name: isDiameter ? "Diameter Piston 2" : isRadius ? "Radius Piston 2" : "Luas Penampang 2", sym: isDiameter ? "d₂" : isRadius ? "r₂" : "A₂", val: A2Str, unit: isDiameter || isRadius ? "cm" : "cm²" }
    ],
    asked: "Gaya Angkat Output (F₂)",
    formula: formulaStr,
    steps: [
      `Catat data hidrolik yang diketahui: ${isDiameter ? "diameter" : isRadius ? "jari-jari" : "luas"} piston kecil (${isDiameter ? "d₁" : isRadius ? "r₁" : "A₁"} = ${A1Str} ${isDiameter || isRadius ? "cm" : "cm²"}), gaya input (F₁ = ${F1Str} N), dan ${isDiameter ? "diameter" : isRadius ? "jari-jari" : "luas"} piston besar (${isDiameter ? "d₂" : isRadius ? "r₂" : "A₂"} = ${A2Str} ${isDiameter || isRadius ? "cm" : "cm²"}).`,
      `Gunakan prinsip kesamaan tekanan Hukum Pascal: P₁ = P₂ atau F₁/A₁ = F₂/A₂.`,
      `Ubah rumus untuk mengisolasi Gaya Angkat (F₂): ${formulaStr}.`,
      stepSubstitution,
      ratioExplanation,
      stepCalculation
    ],
    answer: `Gaya angkat mekanis yang dihasilkan pada penampang silinder besar adalah sebesar <strong>${F2Str} Newton</strong>.`,
    unit: "N",
    value: parseFloat(F2Str)
  };
};

/**
 * Solves Gelombang Mekanik
 * Formula: v = lambda * f
 * Supports Period (T) to Frequency (f) conversion
 * @param {Object} vars - Extracted variables
 */
export const solveWave = (vars = {}) => {
  let computedFromPeriod = false;
  
  // Fallback defensively: If frequency 'f' is missing, but period 'T' or duration 'waktu' is present, convert it
  if (isInvalid(vars.f)) {
    if (!isInvalid(vars.T) && Number(vars.T) > 0) {
      vars.f = 1 / Number(vars.T);
      computedFromPeriod = true;
    } else if (!isInvalid(vars.waktu) && Number(vars.waktu) > 0) {
      vars.T = vars.waktu;
      vars.f = 1 / Number(vars.waktu);
      computedFromPeriod = true;
    }
  }

  const required = ["lambda", "f"];
  const missing = required.filter(key => isInvalid(vars[key]));

  if (missing.length > 0) {
    return {
      status: "incomplete",
      missing: missing.map(m => m === "lambda" ? "Panjang Gelombang (λ)" : "Frekuensi (f)")
    };
  }

  const lambda = safeNum(vars.lambda, 0);
  const f = safeNum(vars.f, 0);

  if (lambda <= 0 || f <= 0) {
    return {
      status: "incomplete",
      missing: [
        lambda <= 0 ? "Panjang Gelombang (λ) harus lebih besar dari 0 meter" : "Frekuensi (f) harus lebih besar dari 0 Hz"
      ]
    };
  }

  const v = lambda * f;
  const T = computedFromPeriod ? safeNum(vars.T, 1 / f) : 1 / f;

  const lambdaStr = formatNum(lambda);
  const fStr = formatNum(f);
  const vStr = formatNum(v);
  const TStr = formatNum(T);

  const steps = [];
  if (computedFromPeriod) {
    steps.push(`Mengingat periode gelombang (T = ${TStr} s) diberikan di soal, hitung frekuensi getaran (f) terlebih dahulu dengan rumus f = 1 / T: f = 1 / ${TStr} = ${fStr} Hz.`);
  }
  steps.push(`Identifikasi parameter rambatan gelombang: Panjang satu gelombang penuh (λ = ${lambdaStr} meter) dan frekuensi getaran (f = ${fStr} Hz).`);
  steps.push(`Gunakan persamaan utama cepat rambat gelombang mekanik linear: v = λ · f.`);
  steps.push(`Substitusikan parameter ke dalam rumus: v = ${lambdaStr} × ${fStr}.`);
  steps.push(`Selesaikan operasi matematika perkalian tersebut: v = ${vStr} m/s.`);

  return {
    status: "success",
    known: [
      { name: "Panjang Gelombang", sym: "λ", val: lambdaStr, unit: "m" },
      { name: "Frekuensi", sym: "f", val: fStr, unit: "Hz" }
    ],
    asked: "Cepat Rambat Gelombang (v)",
    formula: "v = λ · f",
    steps: steps,
    answer: `Cepat rambat energi gelombang melalui medium tersebut adalah <strong>${vStr} m/s</strong> (dengan periode gelombang T = ${TStr} detik).`,
    unit: "m/s",
    value: parseFloat(vStr)
  };
};

/**
 * Solves Hukum I Kirchhoff
 * Formula: I2 = I_masuk - I1
 * @param {Object} vars - Extracted variables
 */
export const solveKirchhoff = (vars = {}) => {
  const required = ["I_masuk", "I1"];
  const missing = required.filter(key => isInvalid(vars[key]));

  if (missing.length > 0) {
    return {
      status: "incomplete",
      missing: missing.map(m => m === "I_masuk" ? "Arus Masuk Total (I_masuk)" : m === "I1" ? "Arus Cabang Pertama (I₁)" : m)
    };
  }

  const I_masuk = safeNum(vars.I_masuk, 0);
  const I1 = safeNum(vars.I1, 0);
  const I2 = I_masuk - I1;

  const I_masukStr = formatNum(I_masuk);
  const I1Str = formatNum(I1);
  const I2Str = formatNum(I2);

  const isNeg = I2 < 0;
  const extraDirectionNote = isNeg ? " (Tanda negatif menunjukkan arah arus fisis yang berlawanan dengan arah yang diasumsikan keluar)" : "";

  return {
    status: "success",
    known: [
      { name: "Arus Masuk Utama", sym: "I_masuk", val: I_masukStr, unit: "A" },
      { name: "Arus Cabang 1", sym: "I₁", val: I1Str, unit: "A" }
    ],
    asked: "Kuat Arus Cabang 2 (I₂)",
    formula: "I₂ = I_masuk - I₁",
    steps: [
      `Identifikasi parameter aliran listrik: Arus masuk utama (I_masuk = ${I_masukStr} A) dan arus cabang pertama keluar (I₁ = ${I1Str} A).`,
      `Gunakan Hukum I Kirchhoff mengenai kekekalan muatan arus: ΣArus Masuk = ΣArus Keluar.`,
      `Jabarkan persamaan percabangan ini: I_masuk = I₁ + I₂.`,
      `Isolasi variabel yang ingin kita cari (I₂): I₂ = I_masuk - I₁.`,
      `Lakukan pengurangan aritmatika dasar: I₂ = ${I_masukStr} - ${I1Str} = ${I2Str} A.`
    ],
    answer: `Kuat arus listrik yang mengalir melewati cabang kedua adalah sebesar <strong>${I2Str} Ampere</strong>${extraDirectionNote}.`,
    unit: "A",
    value: parseFloat(I2Str)
  };
};

/**
 * Solves Gaya Lorentz
 * Formula: F = B * I * L * sin(theta)
 * @param {Object} vars - Extracted variables
 */
export const solveLorentz = (vars = {}) => {
  const required = ["B", "arus", "L"];
  const missing = required.filter(key => isInvalid(vars[key]));

  if (missing.length > 0) {
    return {
      status: "incomplete",
      missing: missing.map(m => m === "B" ? "Kerapatan Medan Magnet (B)" : m === "arus" ? "Arus Listrik (I)" : "Panjang Kawat Penghantar (L)")
    };
  }

  const B = safeNum(vars.B, 0);
  const I = safeNum(vars.arus, 0);
  const L = safeNum(vars.L, 0);
  const theta = safeNum(!isInvalid(vars.sudut) ? vars.sudut : 90, 90);

  if (L <= 0) {
    return {
      status: "incomplete",
      missing: ["Panjang Kawat Penghantar (L) harus lebih besar dari 0 meter"]
    };
  }

  const rad = (theta * Math.PI) / 180;
  const sinTheta = Math.sin(rad);
  const F = B * I * L * sinTheta;

  const BStr = formatNum(B);
  const IStr = formatNum(I);
  const LStr = formatNum(L);
  const thetaStr = formatNum(theta);
  const sinThetaStr = formatNum(sinTheta, 4);
  const FStr = formatNum(F, 4);

  return {
    status: "success",
    known: [
      { name: "Panjang Kawat", sym: "L", val: LStr, unit: "m" },
      { name: "Kuat Arus Listrik", sym: "I", val: IStr, unit: "A" },
      { name: "Medan Magnet Homogen", sym: "B", val: BStr, unit: "T" },
      { name: "Sudut Interaksi", sym: "θ", val: thetaStr, unit: "°" }
    ],
    asked: "Gaya Lorentz (F_L)",
    formula: "F_L = B · I · L · sinθ",
    steps: [
      `Identifikasi data elektromagnetik kawat: Panjang kawat (L = ${LStr} m), arus listrik (I = ${IStr} A), kerapatan medan magnet (B = ${BStr} T), dan sudut persilangan (θ = ${thetaStr}°).`,
      `Pilih persamaan Gaya Lorentz pada kawat lurus berarus: F_L = B · I · L · sinθ.`,
      `Tentukan nilai sinus sudut persilangan: sin(${thetaStr}°) = ${sinThetaStr}.`,
      `Masukkan seluruh angka ke persamaan perkalian linear: F_L = ${BStr} × ${IStr} × ${LStr} × ${sinThetaStr}.`,
      `Selesaikan operasi perkalian beruntun untuk mendapatkan gaya magnetik mekanis: F_L = ${FStr} N.`
    ],
    answer: `Gaya magnetik mekanis Lorentz yang dialami oleh konduktor kawat penghantar tersebut adalah <strong>${FStr} Newton</strong>.`,
    unit: "N",
    value: parseFloat(FStr)
  };
};

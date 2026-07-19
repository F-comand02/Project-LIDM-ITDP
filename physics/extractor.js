/**
 * Physics Variable Extractor for PhysiViz AI
 * Uses Regular Expressions and context-aware natural language processing rules
 * to extract variables and their values with corresponding units from a physics problem text.
 */

/**
 * Extracts variables from raw or clean problem text.
 * @param {string} text - The input problem text.
 * @param {string} detectedTopic - Optional detected topic to assist with context-aware extraction.
 * @returns {Object} Extracted variables dictionary (e.g., { v0: 10, a: 2, t: 5 })
 */
export const extractVariables = (text, detectedTopic = "") => {
  const variables = {};
  if (!text) return variables;

  const textLower = text.toLowerCase();

  // Helper to extract numeric values (supports decimals like 10, 1.5, 2,5)
  const parseNum = (str) => {
    return parseFloat(str.replace(',', '.'));
  };

  // 1. Regular expression to match: [number] [unit]
  // Matches digits with decimals and suffixes, followed by optional spaces and physics units.
  const regex = /(\d+(?:[.,]\d+)?)\s*(m\/s²|m\/s2|m\/s|kg|newton|n|cm²|cm2|cm|meter|m|detik|sekon|s|°|derajat|volt|v|ampere|a|ohm|hz|hertz|tesla|t)\b/gi;

  const matches = [];
  let match;
  while ((match = regex.exec(textLower)) !== null) {
    matches.push({
      full: match[0],
      value: parseNum(match[1]),
      unit: match[2].toLowerCase(),
      index: match.index
    });
  }

  // Helper to check if a keyword lies near the index in the text
  const isKeywordNear = (keywords, index, range = 35) => {
    const start = Math.max(0, index - range);
    const end = Math.min(textLower.length, index + range + 10);
    const context = textLower.substring(start, end);
    return keywords.some(keyword => context.includes(keyword));
  };

  // State trackers for ordering
  let forceCount = 0;
  let areaCount = 0;
  let currentCount = 0;

  matches.forEach(item => {
    const val = item.value;
    const u = item.unit;
    const idx = item.index;

    // A. Acceleration (m/s² or m/s2)
    if (u === "m/s²" || u === "m/s2") {
      variables.a = val;
    }

    // B. Velocity (m/s)
    else if (u === "m/s") {
      if (isKeywordNear(["awal", "mula", "v0", "v_0"], idx)) {
        variables.v0 = val;
      } else if (isKeywordNear(["akhir", "kecepatan setelah", "vt", "v_t"], idx)) {
        variables.vt = val;
      } else {
        // Fallback: If we don't have v0 yet, assign to v0. Otherwise, vt.
        if (variables.v0 === undefined) {
          variables.v0 = val;
        } else {
          variables.vt = val;
        }
      }
    }

    // C. Mass (kg)
    else if (u === "kg") {
      variables.massa = val;
    }

    // D. Force (n or newton)
    else if (u === "n" || u === "newton") {
      if (detectedTopic === "pascal" || isKeywordNear(["hidrolik", "piston", "penampang", "pascal"], idx)) {
        forceCount++;
        if (isKeywordNear(["kecil", "piston 1", "penampang 1", "input", "diberi gaya"], idx)) {
          variables.F1 = val;
        } else if (isKeywordNear(["besar", "piston 2", "penampang 2", "output", "gaya angkat"], idx)) {
          variables.F2 = val;
        } else {
          if (forceCount === 1) variables.F1 = val;
          else variables.F2 = val;
        }
      } else {
        variables.gaya = val;
      }
    }

    // E. Length / Distance (m or meter)
    else if (u === "m" || u === "meter") {
      if (detectedTopic === "gelombang" || isKeywordNear(["panjang gelombang", "lambda"], idx)) {
        variables.lambda = val;
      } else if (detectedTopic === "lorentz" || isKeywordNear(["kawat", "penghantar", "panjang kawat"], idx)) {
        variables.L = val;
      } else {
        variables.waktu = val; // Wait, "meter" can be distance "s".
        variables.jarak = val;
      }
    }

    // F. Luas Penampang (cm² or cm2 or cm)
    else if (u === "cm²" || u === "cm2" || (u === "cm" && isKeywordNear(["luas", "penampang", "piston", "diameter", "jari", "radius"], idx))) {
      areaCount++;
      const hasDiameter = isKeywordNear(["diameter"], idx);
      const hasRadius = isKeywordNear(["jari", "radius"], idx);

      if (isKeywordNear(["kecil", "piston 1", "penampang 1", "input"], idx)) {
        variables.A1 = val;
        if (hasDiameter) variables.isDiameter = true;
        if (hasRadius) variables.isRadius = true;
      } else if (isKeywordNear(["besar", "piston 2", "penampang 2", "output"], idx)) {
        variables.A2 = val;
        if (hasDiameter) variables.isDiameter = true;
        if (hasRadius) variables.isRadius = true;
      } else {
        if (areaCount === 1) {
          variables.A1 = val;
          if (hasDiameter) variables.isDiameter = true;
          if (hasRadius) variables.isRadius = true;
        } else {
          variables.A2 = val;
          if (hasDiameter) variables.isDiameter = true;
          if (hasRadius) variables.isRadius = true;
        }
      }
    }

    // G. Time / Duration (detik or sekon or s)
    else if (u === "detik" || u === "sekon" || u === "s") {
      if (isKeywordNear(["periode", "t_besar"], idx)) {
        variables.T = val;
      } else {
        variables.waktu = val;
      }
    }

    // H. Angle (° or derajat)
    else if (u === "°" || u === "derajat") {
      variables.sudut = val;
    }

    // I. Frequency (hz or hertz)
    else if (u === "hz" || u === "hertz") {
      variables.f = val;
    }

    // J. Magnetic Field (tesla or t)
    else if (u === "tesla" || (u === "t" && isKeywordNear(["tesla", "medan magnet", "magnet"], idx))) {
      variables.B = val;
    }

    // K. Current (ampere or a)
    else if (u === "ampere" || u === "a") {
      if (detectedTopic === "kirchhoff" || isKeywordNear(["percabangan", "masuk", "keluar", "kirchhoff"], idx)) {
        currentCount++;
        if (isKeywordNear(["masuk", "total"], idx)) {
          variables.I_masuk = val;
        } else if (isKeywordNear(["cabang pertama", "i1", "cabang 1"], idx)) {
          variables.I1 = val;
        } else if (isKeywordNear(["cabang kedua", "i2", "cabang 2"], idx)) {
          variables.I2 = val;
        } else {
          if (currentCount === 1) variables.I_masuk = val;
          else if (currentCount === 2) variables.I1 = val;
          else variables.I2 = val;
        }
      } else {
        variables.arus = val;
      }
    }
  });

  // Handle special numeric cases written without units but with keywords
  // (e.g., "sudut elevasi 30" -> sudut = 30)
  if (variables.sudut === undefined) {
    const angleMatch = /sudut\s*(?:elevasi)?\s*(?:sebesar)?\s*(\d+)/i.exec(textLower);
    if (angleMatch) {
      variables.sudut = parseNum(angleMatch[1]);
    }
  }

  // Newton: Force/Mass match if not captured with unit
  if (variables.massa === undefined) {
    const massMatch = /massa\s*(?:balok|benda)?\s*(?:sebesar)?\s*(\d+(?:[.,]\d+)?)\s*(?:kg)?/i.exec(textLower);
    if (massMatch) {
      variables.massa = parseNum(massMatch[1]);
    }
  }

  // Force without N unit explicitly captured
  if (variables.gaya === undefined && detectedTopic === "newton") {
    const forceMatch = /gaya\s*(?:mendatar|tarik|dorong)?\s*(?:sebesar)?\s*(\d+(?:[.,]\d+)?)\s*(?:newton|n)?/i.exec(textLower);
    if (forceMatch) {
      variables.gaya = parseNum(forceMatch[1]);
    }
  }

  // Default Gravity
  if (detectedTopic === "parabola") {
    variables.g = 10; // Default gravity constant
  }

  return variables;
};

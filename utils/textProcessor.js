/**
 * Text Preprocessing Utility for PhysiViz AI
 * Handles lowercase conversion, unnecessary character cleaning, space normalization, and tokenization.
 */

/**
 * Preprocesses input physics problem text.
 * @param {string} text - The raw input problem text.
 * @returns {Object} { cleanText, tokens }
 */
export const preprocessText = (text) => {
  if (!text) {
    return { cleanText: "", tokens: [] };
  }

  // 1. Lowercase
  let cleanText = text.toLowerCase();

  // 2. Remove unnecessary characters but keep alphanumeric, decimal separators, signs, and physical units
  // Keep: letters, numbers, spaces, dots/commas for decimals, percent, degrees, slash for units, superscripts
  cleanText = cleanText.replace(/[^a-zA-Z0-9\s.,°/²+-]/g, ' ');

  // 3. Normalize multiple spaces
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  // 4. Tokenize by splitting spaces
  const tokens = cleanText.split(' ').filter(token => token.length > 0);

  return {
    cleanText,
    tokens
  };
};

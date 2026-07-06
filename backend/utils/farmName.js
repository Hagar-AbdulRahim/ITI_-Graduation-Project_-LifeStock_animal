/**
 * Utility functions for Farm names
 */

/**
 * Normalizes Arabic text to handle common typos and variations.
 * - Removes diacritics (harakat).
 * - Converts various Alef forms (أ, إ, آ) to bare Alef (ا).
 * - Converts Taa Marbuta (ة) to Haa (ه).
 * - Converts Yaa (ي) or Alif Maksura (ى) to standard Yaa.
 * - Removes extra spaces.
 */
const normalizeArabicText = (text) => {
  if (!text) return "";
  return text
    .toString()
    .replace(/[\u064B-\u065F]/g, "") // Remove harakat (tashkeel)
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .trim()
    .replace(/\s+/g, " ") // Normalize spaces
    .toLowerCase(); // Lowercase just in case there are english letters
};

const areFarmNamesSimilar = (name1, name2) => {
  const norm1 = normalizeArabicText(name1);
  const norm2 = normalizeArabicText(name2);
  
  if (!norm1 || !norm2) return false;
  
  // They are similar if they are exactly the same after normalization,
  // or if one includes the other completely (e.g. "مزرعة الأمل" and "الأمل").
  return norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1);
};

module.exports = {
  areFarmNamesSimilar,
  normalizeArabicText,
};

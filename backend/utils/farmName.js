<<<<<<< HEAD
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
=======
const FARM_NAME_PREFIX = /^(?:مزر(?:عة|عه|ه)|farm)\s+/iu;

const normalizeFarmName = (name) => {
  if (!name || typeof name !== "string") return "";

  let normalized = name
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");

  normalized = normalized.replace(FARM_NAME_PREFIX, "");
  normalized = normalized.replace(/^ال(?=\S)/u, "");

  return normalized.toLowerCase().trim();
};

const areFarmNamesSimilar = (nameA, nameB) => {
  const a = normalizeFarmName(nameA);
  const b = normalizeFarmName(nameB);

  if (!a || !b) return false;
  if (a === b) return true;

  const minLen = 3;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (shorter.length >= minLen && longer.includes(shorter)) return true;

  return false;
};

module.exports = { normalizeFarmName, areFarmNamesSimilar };
>>>>>>> 897a5f7b173236d887d00d5c600c0640d1689977

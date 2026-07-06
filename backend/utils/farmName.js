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
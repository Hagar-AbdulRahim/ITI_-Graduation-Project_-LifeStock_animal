// ─── Animal Feature — Shared Formatting Utilities ────────────────────────────
// Pure helper functions used across all Animal Profile components.
// No side effects, no imports from React or Redux.

/**
 * Calculates a human-readable age string from a birth date.
 * @param {string|Date} birthDate
 * @returns {string} e.g. "3 سنوات و 4 أشهر"
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return '—';
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalMonths = years * 12 + months;
  if (totalMonths < 1) return 'أقل من شهر';
  if (totalMonths < 12) return `${totalMonths} شهر`;
  if (months === 0) return `${years} سنة`;
  return `${years} سنة و ${months} شهر`;
};

/**
 * Formats an ISO date string to a full Arabic date.
 * @param {string|Date|null} dateStr
 * @returns {string} e.g. "١٥ مارس ٢٠٢٤"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

/**
 * Formats an ISO date string to a short numeric date.
 * @param {string|Date|null} dateStr
 * @returns {string} e.g. "15/03/2024"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
};

// ─── Lookup Maps ─────────────────────────────────────────────────────────────

export const SPECIES_MAP = {
  cattle: {
    label: 'أبقار',
    emoji: '🐄',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  sheep: {
    label: 'أغنام',
    emoji: '🐑',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  goat: {
    label: 'ماعز',
    emoji: '🐐',
    badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
};

export const GENDER_MAP = {
  male: { label: 'ذكر', symbol: '♂', color: 'text-blue-600' },
  female: { label: 'أنثى', symbol: '♀', color: 'text-pink-600' },
};

export const HEALTH_STATUS_MAP = {
  healthy: {
    label: 'بصحة جيدة',
    badgeColor: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    ringColor: 'ring-green-400',
    bgLight: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-500',
  },
  sick: {
    label: 'مريض',
    badgeColor: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
    ringColor: 'ring-yellow-400',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-500',
  },
  critical: {
    label: 'حالة حرجة',
    badgeColor: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    ringColor: 'ring-red-400',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
  },
  deceased: {
    label: 'متوفى',
    badgeColor: 'bg-gray-100 text-gray-600 border border-gray-200',
    dot: 'bg-gray-400',
    ringColor: 'ring-gray-300',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-600',
    iconColor: 'text-gray-400',
  },
};

export const SEVERITY_MAP = {
  green: {
    label: 'منخفض',
    badgeColor: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    riskLabel: 'مخاطرة منخفضة',
  },
  yellow: {
    label: 'متوسط',
    badgeColor: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
    riskLabel: 'مخاطرة متوسطة',
  },
  red: {
    label: 'مرتفع',
    badgeColor: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    riskLabel: 'مخاطرة مرتفعة',
  },
};

export const VACCINATION_STATUS_MAP = {
  upcoming: {
    label: 'قادم',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  overdue: {
    label: 'متأخر',
    badgeColor: 'bg-red-50 text-red-700 border border-red-200',
  },
  completed: {
    label: 'مكتمل',
    badgeColor: 'bg-green-50 text-green-700 border border-green-200',
  },
};

export const INPUT_TYPE_MAP = {
  text: { label: 'نص', icon: '📝' },
  voice: { label: 'صوت', icon: '🎙️' },
  image: { label: 'صورة', icon: '📸' },
};

/**
 * Returns a human-readable confidence label based on a 0-100 score.
 */
export const getConfidenceLabel = (score) => {
  if (score >= 85) return { label: 'عالي جداً', color: 'text-green-600' };
  if (score >= 70) return { label: 'عالي', color: 'text-blue-600' };
  if (score >= 55) return { label: 'متوسط', color: 'text-yellow-600' };
  return { label: 'منخفض', color: 'text-red-600' };
};

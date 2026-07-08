/**
 * تحويل اسم المحافظة من العربي (زي اللي في GOVERNORATES بالفرونت)
 * للإنجليزي (زي اللي مسجل في governorate field جوه vet_directorates_egypt.json)
 * + توحيد التهجيات الإنجليزية البديلة (زي اللي بترجع من Geoapify reverse geocoding)
 * لنفس الاسم القياسي المستخدم في الداتا المحلية.
 */
const AR_TO_EN_GOVERNORATE = {
  "القاهرة": "Cairo",
  "الجيزة": "Giza",
  "الإسكندرية": "Alexandria",
  "الدقهلية": "Dakahlia",
  "البحر الأحمر": "Red Sea",
  "البحيرة": "Beheira",
  "الفيوم": "Faiyum",
  "الغربية": "Gharbia",
  "الإسماعيلية": "Ismailia",
  "المنوفية": "Menoufia",
  "المنيا": "Minya",
  "القليوبية": "Qalyubia",
  "الوادي الجديد": "New Valley",
  "السويس": "Suez",
  "أسوان": "Aswan",
  "أسيوط": "Assiut",
  "بني سويف": "Beni Suef",
  "بورسعيد": "Port Said",
  "دمياط": "Damietta",
  "الشرقية": "Sharqia",
  "جنوب سيناء": "South Sinai",
  "كفر الشيخ": "Kafr El Sheikh",
  "مطروح": "Matrouh",
  "الأقصر": "Luxor",
  "قنا": "Qena",
  "شمال سيناء": "North Sinai",
  "سوهاج": "Sohag",
};

/**
 * تهجيات إنجليزية بديلة شائعة (زي اللي بترجع من خدمات reverse geocoding
 * مختلفة زي Geoapify) → الاسم القياسي المستخدم في vet_directorates_egypt.json.
 * المفتاح لازم يكون lowercase ومن غير كلمة "governorate".
 */
const EN_ALIASES = {
  "cairo": "Cairo",
  "giza": "Giza",
  "gizah": "Giza",
  "alexandria": "Alexandria",
  "dakahlia": "Dakahlia",
  "dakahleya": "Dakahlia",
  "red sea": "Red Sea",
  "beheira": "Beheira",
  "buhayrah": "Beheira",
  "faiyum": "Faiyum",
  "fayoum": "Faiyum",
  "gharbia": "Gharbia",
  "gharbeya": "Gharbia",
  "ismailia": "Ismailia",
  "ismailiyah": "Ismailia",
  "menoufia": "Menoufia",
  "monufia": "Menoufia",
  "minya": "Minya",
  "menia": "Minya",
  "qalyubia": "Qalyubia",
  "qalyoubia": "Qalyubia",
  "qalyub": "Qalyubia",
  "new valley": "New Valley",
  "suez": "Suez",
  "aswan": "Aswan",
  "assiut": "Assiut",
  "asyut": "Assiut",
  "assiout": "Assiut",
  "asyoot": "Assiut",
  "beni suef": "Beni Suef",
  "bani suwayf": "Beni Suef",
  "bani sweif": "Beni Suef",
  "bani suwayef": "Beni Suef",
  "beni sweif": "Beni Suef",
  "port said": "Port Said",
  "damietta": "Damietta",
  "sharqia": "Sharqia",
  "sharkia": "Sharqia",
  "south sinai": "South Sinai",
  "kafr el sheikh": "Kafr El Sheikh",
  "kafr el-sheikh": "Kafr El Sheikh",
  "kafr ash shaykh": "Kafr El Sheikh",
  "matrouh": "Matrouh",
  "marsa matrouh": "Matrouh",
  "luxor": "Luxor",
  "qena": "Qena",
  "qina": "Qena",
  "north sinai": "North Sinai",
  "sohag": "Sohag",
  "suhag": "Sohag",
};

/** بيوحّد أي اسم إنجليزي (بأي تهجية شائعة) للاسم القياسي المستخدم في الداتا */
function canonicalizeEnglishGovernorate(name) {
  if (!name) return null;
  const key = name.toLowerCase().replace(/governorate/gi, "").trim();
  return EN_ALIASES[key] || name;
}

/** بيرجع الاسم الإنجليزي القياسي لو لاقى مطابقة، أو نفس المدخل (بعد توحيد التهجية) */
function toEnglishGovernorate(name) {
  if (!name) return null;
  if (AR_TO_EN_GOVERNORATE[name]) return AR_TO_EN_GOVERNORATE[name];
  // لو جاي إنجليزي أصلاً (من reverse geocoding أو غيره)، وحّدي التهجية
  return canonicalizeEnglishGovernorate(name);
}

module.exports = { AR_TO_EN_GOVERNORATE, toEnglishGovernorate, canonicalizeEnglishGovernorate };
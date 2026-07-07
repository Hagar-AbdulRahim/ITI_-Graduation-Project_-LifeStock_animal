/**
 * تحويل اسم المحافظة من العربي (زي اللي في GOVERNORATES بالفرونت)
 * للإنجليزي (زي اللي مسجل في governorate field جوه vet_directorates_egypt.json)
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

/** بيرجع الاسم الإنجليزي لو لاقى مطابقة، أو نفس المدخل لو مكتوب إنجليزي أصلاً */
function toEnglishGovernorate(name) {
  if (!name) return null;
  if (AR_TO_EN_GOVERNORATE[name]) return AR_TO_EN_GOVERNORATE[name];
  // لو جاي إنجليزي أصلاً (من reverse geocoding) رجّعه زي ما هو
  return name;
}

module.exports = { AR_TO_EN_GOVERNORATE, toEnglishGovernorate };

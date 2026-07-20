const XLSX = require("xlsx");

// ── قبول القيم بالعربي أو الإنجليزي في العمودين species وgender ────────────
// عشان مزارع بيملى الشيت بالعربي متعقدش عليه
const SPECIES_MAP = {
  cattle: "cattle", أبقار: "cattle", بقر: "cattle",
  sheep: "sheep", أغنام: "sheep", غنم: "sheep", خراف: "sheep",
  goat: "goat", ماعز: "goat",
};
const GENDER_MAP = {
  male: "male", ذكر: "male",
  female: "female", أنثى: "female",
};
const AGE_UNIT_MAP = {
  months: "months", شهور: "months", شهر: "months", أشهر: "months",
  years: "years", سنة: "years", سنوات: "years", سنين: "years",
};

const EXPECTED_HEADERS = ["tag_number", "species", "gender", "age_value", "age_unit", "breed", "weight_kg", "notes"];

const normalize = (val) => (val === undefined || val === null ? "" : String(val).trim());

/**
 * بيقرأ ملف Excel/CSV (Buffer) ويرجّع صفوف خام (raw rows) كـ array of objects
 * حسب أول صف (headers)
 */
const parseSpreadsheetBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
};

/**
 * بيتحقق من صف واحد ويرجّع { valid: true, data } أو { valid: false, errors }
 */
const validateRow = (row, rowNumber) => {
  const errors = [];

  const tag_number = normalize(row.tag_number);
  if (!tag_number) errors.push("رقم الوسم (tag_number) مطلوب");
  if (tag_number.length > 50) errors.push("رقم الوسم أطول من 50 حرف");

  const speciesRaw = normalize(row.species).toLowerCase();
  const species = SPECIES_MAP[speciesRaw] || SPECIES_MAP[normalize(row.species)];
  if (!species) errors.push('نوع الحيوان (species) لازم يكون cattle أو sheep أو goat (أو أبقار/أغنام/ماعز)');

  const genderRaw = normalize(row.gender).toLowerCase();
  const gender = GENDER_MAP[genderRaw] || GENDER_MAP[normalize(row.gender)];
  if (!gender) errors.push("الجنس (gender) لازم يكون male أو female (أو ذكر/أنثى)");

  const age_value = parseFloat(row.age_value);
  if (row.age_value === "" || isNaN(age_value) || age_value < 0) {
    errors.push("العمر (age_value) لازم يكون رقم أكبر من أو يساوي صفر");
  }

  const ageUnitRaw = normalize(row.age_unit).toLowerCase();
  const age_unit = AGE_UNIT_MAP[ageUnitRaw] || AGE_UNIT_MAP[normalize(row.age_unit)] || "months"; // افتراضي شهور لو فاضي

  let weight_kg = null;
  if (normalize(row.weight_kg) !== "") {
    weight_kg = parseFloat(row.weight_kg);
    if (isNaN(weight_kg) || weight_kg <= 0) errors.push("الوزن (weight_kg) لازم يكون رقم أكبر من صفر لو موجود");
  }

  const breed = normalize(row.breed) || null;
  if (breed && breed.length > 100) errors.push("اسم السلالة أطول من 100 حرف");

  const notes = normalize(row.notes) || null;
  if (notes && notes.length > 1000) errors.push("الملاحظات أطول من 1000 حرف");

  if (errors.length > 0) {
    return { valid: false, row: rowNumber, errors, raw: row };
  }

  return {
    valid: true,
    row: rowNumber,
    data: { tag_number, species, gender, age_value, age_unit, weight_kg, breed, notes },
  };
};

/**
 * بيقرأ الملف ويتحقق من كل صفوفه، ويرجّع { validRows, invalidRows }
 */
const parseAndValidateAnimalsSheet = (buffer) => {
  const rawRows = parseSpreadsheetBuffer(buffer);

  if (!rawRows.length) {
    const err = new Error("الملف فاضي أو مفيش صفوف بيانات فيه");
    err.isEmptySheet = true;
    throw err;
  }

  const validRows = [];
  const invalidRows = [];

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // +2 لأن الصف 1 هو الـ headers، والعد بيبدأ من 1
    const result = validateRow(row, rowNumber);
    if (result.valid) validRows.push(result);
    else invalidRows.push(result);
  });

  return { validRows, invalidRows, totalRows: rawRows.length };
};

/**
 * بيبني ملف Excel قالب فاضي (headers + صف مثال) عشان المزارع يحمّله ويملاه
 */
const buildAnimalImportTemplate = () => {
  const exampleRow = {
    tag_number: "EG-1023",
    species:    "cattle",
    gender:     "female",
    age_value:  18,
    age_unit:   "months",
    breed:      "بلدي",
    weight_kg:  250,
    notes:      "",
  };

  const worksheet = XLSX.utils.json_to_sheet([exampleRow], { header: EXPECTED_HEADERS });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "الحيوانات");

  const instructions = [
    { العمود: "tag_number", الوصف: "رقم وسم الحيوان (مطلوب، فريد لكل مزرعة)" },
    { العمود: "species",    الوصف: "النوع: cattle أو أبقار / sheep أو أغنام / goat أو ماعز (مطلوب)" },
    { العمود: "gender",     الوصف: "الجنس: male أو ذكر / female أو أنثى (مطلوب)" },
    { العمود: "age_value",  الوصف: "العمر كرقم (مطلوب)" },
    { العمود: "age_unit",   الوصف: "وحدة العمر: months أو شهور / years أو سنوات (افتراضي: months)" },
    { العمود: "breed",      الوصف: "السلالة (اختياري)" },
    { العمود: "weight_kg",  الوصف: "الوزن بالكيلو (اختياري)" },
    { العمود: "notes",      الوصف: "ملاحظات (اختياري)" },
  ];
  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "تعليمات");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
};

module.exports = { parseAndValidateAnimalsSheet, buildAnimalImportTemplate, EXPECTED_HEADERS };
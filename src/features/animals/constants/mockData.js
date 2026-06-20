// ─── Animal Profile Feature — Mock Data ──────────────────────────────────────
// All data structures mirror the backend MongoDB schemas exactly.
// Replace each section with real API responses when the backend is ready.
// See: backend/models/animal.js, vaccination.js, healthCase.js

// ─── Single Animal Profile ────────────────────────────────────────────────────
export const MOCK_ANIMAL = {
  _id: 'animal-mock-001',
  name: 'مبروكة',
  tag_number: 'BQR-2024-001',
  species: 'cattle',
  breed: 'فريزيان هولندي',
  gender: 'female',
  birth_date: '2021-03-15T00:00:00.000Z',
  weight_kg: 480,
  health_status: 'healthy',
  notes: 'حيوان ممتاز، عالية الإنتاج، تحتاج متابعة منتظمة للتغذية.',
  is_active: true,
  farm_id: {
    _id: 'farm-mock-001',
    name: 'مزرعة النيل الخضراء',
    governorate: 'الجيزة',
  },
  created_at: '2024-01-10T00:00:00.000Z',
  updated_at: '2024-11-20T00:00:00.000Z',
};

// ─── Vaccination History ──────────────────────────────────────────────────────
// Source: backend/models/vaccination.js
export const MOCK_VACCINATIONS = [
  {
    _id: 'vac-mock-001',
    vaccine_name: 'لقاح الحمى القلاعية',
    last_date: '2024-10-01T00:00:00.000Z',
    next_due_date: '2025-04-01T00:00:00.000Z',
    dose_ml: 2,
    administered_by: 'د. أحمد سالم',
    batch_number: 'FMD-2024-X1',
    notes: 'تمت بنجاح دون آثار جانبية',
    status: 'upcoming',
  },
  {
    _id: 'vac-mock-002',
    vaccine_name: 'لقاح التهاب الكبد الوبائي',
    last_date: '2024-06-15T00:00:00.000Z',
    next_due_date: '2024-12-15T00:00:00.000Z',
    dose_ml: 1.5,
    administered_by: 'د. سارة محمود',
    batch_number: 'HEP-2024-A3',
    notes: null,
    status: 'overdue',
  },
  {
    _id: 'vac-mock-003',
    vaccine_name: 'لقاح الجمرة الخبيثة',
    last_date: '2024-02-20T00:00:00.000Z',
    next_due_date: '2025-02-20T00:00:00.000Z',
    dose_ml: 1,
    administered_by: 'د. أحمد سالم',
    batch_number: 'ANT-2024-B2',
    notes: 'لا توجد آثار جانبية ملحوظة',
    status: 'completed',
  },
  {
    _id: 'vac-mock-004',
    vaccine_name: 'لقاح البروسيلا',
    last_date: '2024-01-05T00:00:00.000Z',
    next_due_date: '2025-01-05T00:00:00.000Z',
    dose_ml: 2.5,
    administered_by: 'د. محمد علي',
    batch_number: 'BRC-2024-C1',
    notes: 'الجرعة الأولى — لا مشاكل',
    status: 'upcoming',
  },
  {
    _id: 'vac-mock-005',
    vaccine_name: 'لقاح الكلوستريديا',
    last_date: '2023-11-10T00:00:00.000Z',
    next_due_date: '2024-11-10T00:00:00.000Z',
    dose_ml: 1,
    administered_by: 'د. سارة محمود',
    batch_number: 'CLO-2023-D5',
    notes: null,
    status: 'overdue',
  },
  {
    _id: 'vac-mock-006',
    vaccine_name: 'لقاح الحمى القلاعية',
    last_date: '2023-04-01T00:00:00.000Z',
    next_due_date: '2023-10-01T00:00:00.000Z',
    dose_ml: 2,
    administered_by: 'د. أحمد سالم',
    batch_number: 'FMD-2023-X0',
    notes: null,
    status: 'completed',
  },
];

// ─── Medical History (Health Cases) ──────────────────────────────────────────
// Source: backend/models/healthCase.js
export const MOCK_MEDICAL_HISTORY = [
  {
    _id: 'case-mock-001',
    disease_name: 'التهاب الضرع',
    symptoms: ['تورم الضرع', 'ألم عند اللمس', 'انخفاض إنتاج الحليب'],
    ai_diagnosis: 'التهاب الضرع البكتيري',
    severity: 'yellow',
    vet_consulted: true,
    resolved: true,
    resolved_at: '2024-08-20T00:00:00.000Z',
    created_at: '2024-08-10T00:00:00.000Z',
  },
  {
    _id: 'case-mock-002',
    disease_name: 'الحمى الحادة',
    symptoms: ['ارتفاع درجة الحرارة', 'فقدان الشهية', 'ضعف عام وخمول'],
    ai_diagnosis: 'التهاب تنفسي حاد',
    severity: 'red',
    vet_consulted: true,
    resolved: true,
    resolved_at: '2024-05-30T00:00:00.000Z',
    created_at: '2024-05-25T00:00:00.000Z',
  },
  {
    _id: 'case-mock-003',
    disease_name: 'إسهال حاد',
    symptoms: ['إسهال متكرر', 'جفاف خفيف', 'خمول ملحوظ'],
    ai_diagnosis: 'التهاب معدي معوي',
    severity: 'green',
    vet_consulted: false,
    resolved: true,
    resolved_at: '2024-03-18T00:00:00.000Z',
    created_at: '2024-03-15T00:00:00.000Z',
  },
];

// ─── AI Diagnosis History ─────────────────────────────────────────────────────
export const MOCK_DIAGNOSIS_HISTORY = [
  {
    _id: 'diag-mock-001',
    symptoms: ['سعال متكرر', 'إفرازات أنفية', 'ارتفاع الحرارة'],
    ai_diagnosis: 'التهاب الرئة البكتيري',
    confidence_score: 87,
    severity: 'yellow',
    input_type: 'text',
    created_at: '2024-09-14T00:00:00.000Z',
  },
  {
    _id: 'diag-mock-002',
    symptoms: ['ضعف عام', 'شحوب الأغشية المخاطية', 'قلة النشاط'],
    ai_diagnosis: 'فقر الدم الناتج عن نقص الحديد',
    confidence_score: 72,
    severity: 'green',
    input_type: 'text',
    created_at: '2024-07-02T00:00:00.000Z',
  },
  {
    _id: 'diag-mock-003',
    symptoms: ['عرج في الرجل الأمامية', 'تورم المفصل', 'ألم عند الضغط'],
    ai_diagnosis: 'التهاب المفاصل الروماتويدي',
    confidence_score: 91,
    severity: 'red',
    input_type: 'image',
    created_at: '2024-04-18T00:00:00.000Z',
  },
];

// ─── Weight History ───────────────────────────────────────────────────────────
// NOTE: Backend team needs to create GET /api/animals/:id/weights endpoint.
export const MOCK_WEIGHT_HISTORY = [
  { month: 'يناير', weight: 380, date: '2024-01-01' },
  { month: 'فبراير', weight: 392, date: '2024-02-01' },
  { month: 'مارس', weight: 405, date: '2024-03-01' },
  { month: 'أبريل', weight: 418, date: '2024-04-01' },
  { month: 'مايو', weight: 428, date: '2024-05-01' },
  { month: 'يونيو', weight: 440, date: '2024-06-01' },
  { month: 'يوليو', weight: 452, date: '2024-07-01' },
  { month: 'أغسطس', weight: 460, date: '2024-08-01' },
  { month: 'سبتمبر', weight: 468, date: '2024-09-01' },
  { month: 'أكتوبر', weight: 473, date: '2024-10-01' },
  { month: 'نوفمبر', weight: 478, date: '2024-11-01' },
  { month: 'ديسمبر', weight: 480, date: '2024-12-01' },
];

// ─── Notes ───────────────────────────────────────────────────────────────────
// NOTE: Backend team needs to create GET /api/animals/:id/notes endpoint.
export const MOCK_NOTES = {
  vet_notes: [
    {
      _id: 'note-v-001',
      content:
        'الحيوان في حالة صحية ممتازة. يُنصح بمتابعة الوزن أسبوعياً وضمان وفرة المياه النظيفة والنظيفة. الأسنان سليمة والعيون صافية لا توجد إفرازات.',
      created_by: 'د. أحمد سالم',
      created_at: '2024-11-15T00:00:00.000Z',
    },
    {
      _id: 'note-v-002',
      content:
        'تمت جلسة الفحص الدوري الشهري بنجاح. لا توجد مشاكل صحية ظاهرة. ينصح باستمرار التغذية الحالية مع إضافة مكملات الكالسيوم.',
      created_by: 'د. سارة محمود',
      created_at: '2024-09-20T00:00:00.000Z',
    },
  ],
  farmer_notes: [
    {
      _id: 'note-f-001',
      content:
        'بدأت في تناول علف مركز إضافي لتحسين الإنتاج. المزاج العام جيد جداً وتتفاعل بشكل طبيعي مع بقية القطيع.',
      created_by: 'المزارع — حاج عبد الله',
      created_at: '2024-11-10T00:00:00.000Z',
    },
    {
      _id: 'note-f-002',
      content:
        'لاحظت انخفاضاً طفيفاً في الشهية خلال الأسبوع الماضي. سيتم إخطار الطبيب البيطري إذا استمر الأمر.',
      created_by: 'المزارع — حاج عبد الله',
      created_at: '2024-10-05T00:00:00.000Z',
    },
  ],
};

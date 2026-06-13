// ============================================================
// MOCK DATA — استبدل بـ API calls لاحقاً من services/
// ============================================================

export const FARM_INFO = {
  name: 'مزرعة Green Pastures',
  veterinarian: 'د. سارة مِيلر',
  title: 'طبيبة بيطرية أولى',
  avatar: null,
};

// -------- Stats Cards --------
export const DASHBOARD_STATS = [
  {
    id: 'total',
    label: 'إجمالي الحيوانات',
    value: '١٬٢٤٠',
    rawValue: 1240,
    change: '+٤٪',
    changeType: 'positive',
    icon: 'paw',
    color: 'green',
  },
  {
    id: 'sick',
    label: 'الحيوانات المريضة',
    value: '١٢',
    rawValue: 12,
    change: '-٢٪',
    changeType: 'negative',
    icon: 'medical',
    color: 'rose',
  },
  {
    id: 'vaccinations',
    label: 'التطعيمات القادمة',
    value: '٤٥',
    rawValue: 45,
    badge: 'الـ ٧ أيام القادمة',
    icon: 'syringe',
    color: 'blue',
  },
  {
    id: 'emergencies',
    label: 'حالات الطوارئ',
    value: '٢',
    rawValue: 2,
    icon: 'alert',
    color: 'red',
    urgent: true,
  },
];

// -------- Donut Chart --------
export const ANIMAL_DISTRIBUTION = [
  { name: 'الأبقار', value: 744, percentage: 60, color: '#3d6b47' },
  { name: 'الخيول', value: 310, percentage: 25, color: '#5b9bd5' },
  { name: 'أخرى', value: 186, percentage: 15, color: '#7c4d8a' },
];

// -------- Weekly Health Bar Chart --------
export const WEEKLY_HEALTH_TRENDS = [
  { day: 'الاثنين', score: 85, label: 'Mon' },
  { day: 'الثلاثاء', score: 78, label: 'Tue' },
  { day: 'الأربعاء', score: 92, label: 'Wed' },
  { day: 'الخميس', score: 45, label: 'Thu' }, // anomaly — highlighted in pink
  { day: 'الجمعة', score: 88, label: 'Fri' },
  { day: 'السبت', score: 76, label: 'Sat' },
  { day: 'الأحد', score: 70, label: 'Sun' },
];

// -------- AI Recommendations --------
export const AI_RECOMMENDATIONS = [
  {
    id: 1,
    priority: 'متوسطة',
    priorityLevel: 'medium',
    title: 'تعديل مزيج المعادن في العلف',
    description:
      'يشير تحليل الذكاء الاصطناعي إلى انخفاض طفيف في مستويات الكالسيوم في المرعى الشمالي الشرقي. يوصى بتعديل المزيج بنسبة ٥٪.',
  },
  {
    id: 2,
    priority: 'عالية',
    priorityLevel: 'high',
    title: 'عزل #4052 فوراً',
    description:
      'تم اكتشاف خلل حيوي. خطر محتمل لعدوى تنفسية في مرحلة مبكرة. ينصح بالحجر الصحي الفوري.',
  },
];

// -------- Recent Activities --------
export const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'vaccination',
    text: 'اكتمل تطعيم الحمرة الخبيثة لـ القطيع ب',
    time: 'اليوم، ٩:٤٥ صباحاً',
    actor: 'د. سارة مِيلر',
    icon: 'syringe',
  },
  {
    id: 2,
    type: 'alert',
    text: 'تم رصد ارتفاع في الحرارة للمعرف: #4052',
    time: 'اليوم، ٧:٢٠ صباحاً',
    actor: 'مراقب الذكاء الاصطناعي',
    icon: 'thermometer',
  },
  {
    id: 3,
    type: 'success',
    text: 'تمت معالجة إدخال جديد: ١٢ عجلاً',
    time: 'أمس، ٤:١٥ مساءً',
    actor: 'جون كارتر',
    icon: 'check',
  },
];

// -------- Sidebar Navigation --------
export const SIDEBAR_LINKS = [
  {
    id: 'dashboard',
    label: 'نظرة عامة',
    icon: 'grid',
    color: 'text-stone-400',
    path: '/',
  },
  {
    id: 'animals',
    label: 'الحيوانات',
    icon: 'paw',
    color: 'text-green-500',
    path: '/animals',
  },
  {
    id: 'ai-assistant',
    label: 'مساعد الذكاء الاصطناعي',
    icon: 'bot',
    color: 'text-green-600',
    path: '/ai-assistant',
  },
  {
    id: 'diagnosis',
    label: 'التشخيص',
    icon: 'plus-circle',
    color: 'text-green-700',
    path: '/diagnosis',
  },
  {
    id: 'image-analysis',
    label: 'تحليل الصور',
    icon: 'camera',
    color: 'text-blue-400',
    path: '/image-analysis',
  },
  {
    id: 'vaccinations',
    label: 'التطعيمات',
    icon: 'syringe-icon',
    color: 'text-blue-500',
    path: '/vaccinations',
  },
  {
    id: 'emergencies',
    label: 'حالات النفسي',
    icon: 'alert-circle',
    color: 'text-purple-500',
    path: '/emergencies',
  },
  {
    id: 'library',
    label: 'المكتبة',
    icon: 'book',
    color: 'text-indigo-500',
    path: '/library',
  },
  {
    id: 'reports',
    label: 'التقارير',
    icon: 'bar-chart',
    color: 'text-cyan-500',
    path: '/reports',
  },
];

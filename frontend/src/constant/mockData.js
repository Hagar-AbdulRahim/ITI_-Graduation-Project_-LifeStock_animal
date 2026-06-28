// ============================================================
// MOCK DATA — استبدل بـ API calls لاحقاً من services/
// ============================================================

export const FARM_INFO = {
  name: 'مزرعة Green Pastures',
  veterinarian: 'د. سارة مِيلر',
  title: 'طبيبة بيطرية أولى',
  avatar: null,
}

// -------- Stats Cards --------
export const DASHBOARD_STATS = [
  {
    id: 'total',
    label: 'إجمالي الحيوانات',
    value: '٠',
    rawValue: 0,
    change: '٠٪',
    changeType: 'neutral',
    icon: 'paw',
    color: 'green',
  },
  {
    id: 'sick',
    label: 'الحيوانات المريضة',
    value: '٠',
    rawValue: 0,
    change: '٠٪',
    changeType: 'neutral',
    icon: 'medical',
    color: 'rose',
  },
  {
    id: 'vaccinations',
    label: 'التطعيمات القادمة',
    value: '٠',
    rawValue: 0,
    badge: 'الـ ٧ أيام القادمة',
    icon: 'syringe',
    color: 'blue',
  },
  {
    id: 'emergencies',
    label: 'حالات الطوارئ',
    value: '٠',
    rawValue: 0,
    icon: 'alert',
    color: 'red',
    urgent: true,
  },
]

// -------- Donut Chart --------
export const ANIMAL_DISTRIBUTION = [
  { name: 'لا توجد بيانات', value: 1, percentage: 100, color: '#e5e7eb' },
]

// -------- Weekly Health Bar Chart --------
export const WEEKLY_HEALTH_TRENDS = [
  { day: 'الاثنين', score: 0, label: 'Mon' },
  { day: 'الثلاثاء', score: 0, label: 'Tue' },
  { day: 'الأربعاء', score: 0, label: 'Wed' },
  { day: 'الخميس', score: 0, label: 'Thu' },
  { day: 'الجمعة', score: 0, label: 'Fri' },
  { day: 'السبت', score: 0, label: 'Sat' },
  { day: 'الأحد', score: 0, label: 'Sun' },
]

// -------- AI Recommendations --------
export const AI_RECOMMENDATIONS = [
  {
    id: 1,
    priority: 'منخفضة',
    priorityLevel: 'low',
    title: 'مرحباً بك في المزرعة',
    description:
      'لا توجد بيانات كافية للذكاء الاصطناعي لتحليلها بعد. قم بإضافة حيواناتك الأولى للبدء.',
  },
]

// -------- Recent Activities --------
export const RECENT_ACTIVITIES = []

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
    id: 'notifications',
    label: 'الإشعارات',
    icon: 'bell',
    color: 'text-amber-500',
    path: '/notifications',
    isStandalone: true,
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
    id: 'vaccine-agent',
    label: 'مستشار اللقاحات',
    icon: 'bot',
    color: 'text-green-600',
    path: '/vaccine-agent',
    isStandalone: true,
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
]

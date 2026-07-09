export const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
]

export const ADMIN_SIDEBAR_LINKS = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    path: '/admin/dashboard',
    icon: 'dashboard',
  },
  { id: 'users', label: 'المستخدمون', path: '/admin/users', icon: 'users' },
  { id: 'farms', label: 'المزارع', path: '/admin/farms', icon: 'farms' },
  { id: 'animals', label: 'الحيوانات', path: '/admin/animals', icon: 'animals' },
  {
    id: 'consultations',
    label: 'الاستشارات',
    path: '/admin/consultations',
    icon: 'ai',
  },
  {
    id: 'knowledge',
    label: 'قاعدة المعرفة',
    path: '/admin/knowledge',
    icon: 'ai',
  },
  {
    id: 'outbreaks',
    label: 'الفاشيات',
    path: '/admin/outbreaks',
    icon: 'emergency',
  },
  {
    id: 'outbreak-analytics',
    label: 'تحليل الأوبئة',
    path: '/admin/outbreak-analytics',
    icon: 'emergency',
  },
]


export const ROLE_LABELS = {
  user: 'مزارع',
  admin: 'مدير',
}

export const SPECIES_LABELS = {
  cattle: 'أبقار',
  sheep: 'أغنام',
  goat: 'ماعز',
}

export const HEALTH_STATUS_LABELS = {
  healthy: 'سليم',
  sick: 'مريض',
  critical: 'حرج',
  deceased: 'نافق',
}

export const SEVERITY_LABELS = {
  green: 'منخفض',
  yellow: 'متوسط',
  red: 'عالي',
}

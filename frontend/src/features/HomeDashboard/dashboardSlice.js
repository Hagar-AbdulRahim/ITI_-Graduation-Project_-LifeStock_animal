import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  heroStats: [
    { value: '2.4M+', label: 'حيوان مراقب' },
    { value: '850+', label: 'مزرعة نشطة حول العالم' },
    { value: '98.2%', label: 'دقة توقع' },
  ],
  features: [
    {
      id: 1,
      title: 'تحليل الصور',
      description: 'تحليل الصور وتحديد الأمراض من خلال تحليل حيوي الحيوان باستخدام الذكاء الاصطناعي',
      icon: 'camera',
      hasImage: true,
      bg: 'white',
      span: 'small',
    },
    {
      id: 2,
      title: 'اكتشاف الأمراض',
      description: 'كشف مبكر لأكثر من 40 مرضاً خطيراً بالذاكاء الاصطناعي، تشخيص تلقائي، ونمط نبض الحيوانات بدقة عالية',
      icon: 'search',
      hasImage: false,
      bg: 'white',
      span: 'large',
    },
    {
      id: 3,
      title: 'تتبع التطعيمات',
      description: 'حل موحد لتتبع القطعان الكبيرة، القطعان الكبيرة، مع تذكيرات تلقائية بمواعيد القيت',
      icon: 'syringe',
      hasImage: false,
      bg: 'white',
      span: 'small',
    },
    {
      id: 4,
      title: 'مساعد صوتي',
      description: 'إدارة سهلة من استخدام أوامر الأصوات للأطباء البيطريين، تحليل بيانات بصوتك',
      icon: 'mic',
      hasImage: false,
      bg: 'dark-green',
      span: 'small',
    },
    {
      id: 5,
      title: 'تقرير صحية',
      description: 'تقارير تفصيلية لتتبع الإشارات الحيوية والاتجاهات والاحتياجات البيطرية',
      icon: 'chart',
      hasImage: false,
      bg: 'white',
      span: 'small',
    },
    {
      id: 6,
      title: 'التنبيهات الفعلي',
      description: 'تنبيهات، كاشف الأعراض، الأعراض الفعلية الفورية بالأخطار الحيوانية الصحي',
      icon: 'bell',
      hasImage: false,
      bg: 'white',
      span: 'small',
    },
  ],
  testimonials: [
    {
      id: 1,
      quote: 'رعاية الماشية AI غيرت طريقة إدارتي للمزرعة بالكامل. يمكنني الآن تتبع صحة كل حيوان بدقة وسرعة لم أكن أتخيلها من قبل.',
      author: 'د. سارة جنسن',
      role: 'مديرة المزرعة البيطرية — أستراليا',
      avatar: null,
      rating: 5,
    },
  ],
}

const dashboardSlice = createSlice({
  name: 'homeDashboard',
  initialState,
  reducers: {
    setHeroStats: (state, action) => {
      state.heroStats = action.payload
    },
    setFeatures: (state, action) => {
      state.features = action.payload
    },
    setTestimonials: (state, action) => {
      state.testimonials = action.payload
    },
  },
})

export const { setHeroStats, setFeatures, setTestimonials } = dashboardSlice.actions
export const selectHeroStats = (state) => state.homeDashboard.heroStats
export const selectFeatures = (state) => state.homeDashboard.features
export const selectTestimonials = (state) => state.homeDashboard.testimonials

export default dashboardSlice.reducer

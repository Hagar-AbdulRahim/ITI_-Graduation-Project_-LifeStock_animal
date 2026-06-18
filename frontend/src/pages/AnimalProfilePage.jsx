// pages/AnimalProfilePage.jsx
// ────────────────────────────────────────────────────────────
// صفحة ملف الحيوان التفصيلية — LivestockCare AI
// ────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Zap, 
  Plus, 
  Send,
  User,
  Heart,
  ChevronRight,
  ChevronDown,
  Edit,
  Syringe,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import cowImg from '../assets/images/cow.jpg';

// ── Mock Animals Profile Database ──────────────────
const MOCK_PROFILES = {
  'm3': { // بيسي
    id: 'LIV-00482',
    name: 'بيسي (Bessie)',
    species: 'أبقار',
    breed: 'هولشتاين فريزيان',
    gender: 'أنثى',
    birthDate: '12 مايو 2019',
    age: '4 سنوات و 10 أشهر',
    regNo: 'REG-88293-FR',
    weight: '720 كجم',
    weightChange: '+1.2%',
    yield: '28.4 لتر/يوم',
    yieldGroup: 'قطيع الحليب أ',
    status: 'ممتازة',
    statusTag: 'سليم',
    risk: 'مستقر',
    riskTag: 'متوسط',
    lastCheck: '15 مارس 2024',
    aiAlerts: '3 تنبيهات',
    treatment: {
      diagnosis: 'التهاب ضرع خفيف',
      protocol: 'تنظيف موضعي يومي مع وضع جل الغدد الثديية (10 جم) لمدة 5 أيام.',
      progress: 75
    },
    history: [
      {
        date: '15 مارس 2024',
        type: 'checkup',
        title: 'فحص جسدي روتيني',
        description: 'الحيوان في حالة بدنية مثالية. أصوات الرئة والمشية طبيعية.',
        doctor: 'د. سارة جينكنز',
        dotColor: 'bg-emerald-500'
      },
      {
        date: '28 فبراير 2024',
        type: 'blood',
        title: 'تحليل دم: نقص كالسيوم',
        description: 'اكتشاف نقص طفيف في الكالسيوم. التوصية بتعديل المكملات الغذائية.',
        doctor: 'د. سارة جينكنز',
        dotColor: 'bg-blue-500'
      }
    ],
    vaccinations: [
      { name: 'الاسهال الفيروسي البقري (BVD)', date: '12 أكتوبر 2023', batch: 'BVD-449-X', nextDate: '12 أكتوبر 2024', nextDateColor: 'text-stone-600', status: 'محدث' },
      { name: 'الحمى القلاعية (FMD)', date: '05 يناير 2024', batch: 'FMD-221-Z', nextDate: '05 يوليو 2024', nextDateColor: 'text-red-600 font-bold', status: 'مستحق قريباً' }
    ],
    aiPrediction: "بناءً على اتجاهات الوزن الحالية واستقرار إنتاج الحليب، من المتوقع أن تدخل 'بيسي' ذروة دورة الإنتاج خلال 14 يوماً. يقترح زيادة تناول الفوسفور بنسبة 5% لدعم كثافة العظام.",
    aiConfidence: '94%',
    notes: [
      { author: 'أحمد (مربي الحيوان)', role: 'مربي', text: 'لوحظ انخفاض طفيف في الشهية مساء أمس، لكنها عادت للأكل بشكل طبيعي اليوم.', time: 'منذ يومين' }
    ],
    weightHistory: [480, 520, 580, 620, 680, 705, 715, 720]
  },
  'm1': { // وولي
    id: 'CV-3301#',
    name: 'وولي (Woolly)',
    species: 'أغنام',
    breed: 'ميرينو استرالي',
    gender: 'أنثى',
    birthDate: '10 أبريل 2022',
    age: '2.2 سنة',
    regNo: 'REG-99120-AU',
    weight: '86 كجم',
    weightChange: '+0.8%',
    yield: '1.2 لتر/يوم',
    yieldGroup: 'قطيع الحلوب ب',
    status: 'ممتازة',
    statusTag: 'سليم',
    risk: 'مستقر',
    riskTag: 'متوسط',
    lastCheck: '10 مارس 2024',
    aiAlerts: '1 تنبيه',
    treatment: null,
    history: [
      {
        date: '10 مارس 2024',
        type: 'checkup',
        title: 'فحص جز الرأس والصوف',
        description: 'جودة الصوف عالية ولا توجد طفيليات خارجية. صحة الجلد ممتازة.',
        doctor: 'د. سارة جينكنز',
        dotColor: 'bg-emerald-500'
      }
    ],
    vaccinations: [
      { name: 'التسمم المعوي (Clostridial)', date: '14 نوفمبر 2023', batch: 'CLS-802-A', nextDate: '14 نوفمبر 2024', nextDateColor: 'text-stone-600', status: 'محدث' }
    ],
    aiPrediction: "معدل نمو الصوف طبيعي جداً ومستقر. ينصح بالحفاظ على النمط الغذائي الحالي لضمان الحفاظ على مستويات اللانولين الطبيعية.",
    aiConfidence: '91%',
    notes: [
      { author: 'سعيد (مربي الأغنام)', role: 'مربي', text: 'النشاط والحركة ممتازة في المرعى اليوم.', time: 'منذ ٣ أيام' }
    ],
    weightHistory: [60, 65, 70, 75, 78, 82, 84, 86]
  },
  'm2': { // سبيريت
    id: 'EQ-10428',
    name: 'سبيريت (Spirit)',
    species: 'ماعز',
    breed: 'ماعز دمشقي',
    gender: 'ذكر',
    birthDate: '15 يناير 2020',
    age: '6.1 سنة',
    regNo: 'REG-20412-SY',
    weight: '85 كجم',
    weightChange: '-1.5%',
    yield: '—',
    yieldGroup: '',
    status: 'مراقبة',
    statusTag: 'مراقبة',
    risk: 'متوسط',
    riskTag: 'متوسط',
    lastCheck: '14 مارس 2024',
    aiAlerts: '2 تنبيهين',
    treatment: {
      diagnosis: 'نزلة برد طفيفة',
      protocol: 'تدفئة الحظيرة وتجريع الحيوان بفيتامين سي لمدة ٣ أيام.',
      progress: 40
    },
    history: [
      {
        date: '14 مارس 2024',
        type: 'checkup',
        title: 'فحص الجهاز التنفسي',
        description: 'احتقان بسيط في المجاري التنفسية العليا. لا توجد مؤشرات حرارة حرجة.',
        doctor: 'د. سارة جينكنز',
        dotColor: 'bg-amber-500'
      }
    ],
    vaccinations: [
      { name: 'لقاح التهاب الرئة (Pneumonia)', date: '10 سبتمبر 2023', batch: 'PN-421-C', nextDate: '10 سبتمبر 2024', nextDateColor: 'text-stone-600', status: 'محدث' }
    ],
    aiPrediction: "انخفاض طفيف في الوزن بمعدل ١.٥٪ بسبب الخمول الأخير. يوصى بإضافة مكملات الفيتامين لتعزيز المناعة لتلافي تطور المرض.",
    aiConfidence: '88%',
    notes: [
      { author: 'محمد (المشرف الميداني)', role: 'مشرف', text: 'الحيوان يظهر عطاساً خفيفاً في الصباح الباكر.', time: 'أمس' }
    ],
    weightHistory: [88, 87.5, 87, 86.2, 86, 85.5, 85.2, 85]
  },
  'm4': { // بومبا
    id: 'PR-5529#',
    name: 'بومبا (Pumba)',
    species: 'أبقار',
    breed: 'بلدي هجين',
    gender: 'ذكر',
    birthDate: '12 نوفمبر 2024',
    age: '1.6 سنة',
    regNo: 'REG-33410-EG',
    weight: '110 كجم',
    weightChange: '-4.5%',
    yield: '—',
    yieldGroup: '',
    status: 'حالة حرجة',
    statusTag: 'حرج',
    risk: 'حرج',
    riskTag: 'حرج',
    lastCheck: '15 مارس 2024',
    aiAlerts: '4 تنبيهات',
    treatment: {
      diagnosis: 'اشتباه بمرض تنفسي بقري (BRD)',
      protocol: 'عزل فوري في حظيرة الحجر الصحي وإعطاء ٢٠ مل مضاد حيوي فلوفينيكول.',
      progress: 20
    },
    history: [
      {
        date: '15 مارس 2024',
        type: 'emergency',
        title: 'رصد شذوذ حراري وخمول حاد',
        description: 'ارتفاع درجة الحرارة لـ ٤٠.٥ درجة مئوية مع خمول شديد وانقطاع عن الأكل.',
        doctor: 'د. سارة جينكنز',
        dotColor: 'bg-red-500'
      }
    ],
    vaccinations: [
      { name: 'لقاح التسمم الدموي (Pasteurella)', date: '01 ديسمبر 2023', batch: 'PAS-109-D', nextDate: '01 يونيو 2024', nextDateColor: 'text-red-600 font-bold', status: 'منتهي' }
    ],
    aiPrediction: "ارتفاع حاد في مؤشر الخطورة للعدوى الرئوية. يوصى بالتدخل البيطري العاجل وتوزيع جرعات وقائية للحيوانات المخالطة في نفس الحظيرة.",
    aiConfidence: '95%',
    notes: [
      { author: 'أحمد (مربي الحيوان)', role: 'مربي', text: 'الحيوان لا يتحرك منذ الصباح الباكر ويرفض شرب الماء.', time: 'اليوم، ٦ صباحاً' }
    ],
    weightHistory: [122, 120, 118, 115, 113, 112, 111, 110]
  }
};

// Fallback profile generator for unknown animal ids
const makeFallbackProfile = (id, name, species, gender, weight) => {
  return {
    id: id || 'LIV-UNKNOWN',
    name: name || 'حيوان غير معروف',
    species: species || 'أبقار',
    breed: 'بلدي مختلط',
    gender: gender || 'ذكر',
    birthDate: '10 أكتوبر 2021',
    age: '4.5 سنة',
    regNo: `REG-${id}-MOCK`,
    weight: weight ? `${weight} كجم` : '420 كجم',
    weightChange: '+0.5%',
    yield: '—',
    yieldGroup: '',
    status: 'ممتازة',
    statusTag: 'سليم',
    risk: 'مستقر',
    riskTag: 'متوسط',
    lastCheck: '15 مارس 2024',
    aiAlerts: 'لا يوجد تنبيهات حيوية',
    treatment: null,
    history: [
      { date: '15 مارس 2024', type: 'checkup', title: 'فحص دوري', description: 'المؤشرات الحيوية طبيعية ولا توجد ملاحظات سريرية.', doctor: 'د. سارة جينكنز', dotColor: 'bg-emerald-500' }
    ],
    vaccinations: [
      { name: 'اللقاح الرباعي', date: '01 يناير 2024', batch: 'VAC-101-X', nextDate: '01 يناير 2025', nextDateColor: 'text-stone-600', status: 'محدث' }
    ],
    aiPrediction: "الحالة مستقرة، يوصى بالمحافظة على جدول التطعيمات وجداول التغذية الحالية دون تعديل.",
    aiConfidence: '90%',
    notes: [],
    weightHistory: [410, 412, 415, 418, 419, 420]
  };
};

export default function AnimalProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reduxAnimal = useSelector((state) => {
    return state.farm?.farmAnimals?.find(a => a._id === id);
  });

  const [profile, setProfile] = useState(MOCK_PROFILES[id] || (reduxAnimal ? makeFallbackProfile(reduxAnimal.tag_number, reduxAnimal.name, reduxAnimal.species === 'cattle' ? 'أبقار' : reduxAnimal.species === 'sheep' ? 'أغنام' : 'ماعز', reduxAnimal.gender === 'female' ? 'أنثى' : 'ذكر', reduxAnimal.weight_kg) : MOCK_PROFILES['m3']));
  const [noteText, setNoteText] = useState('');

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote = {
      author: 'د. سارة ميار',
      role: 'طبيبة بيطرية أولى',
      text: noteText,
      time: 'الآن'
    };

    setProfile(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
    setNoteText('');
    toast.success('تمت إضافة الملاحظة بنجاح!');
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-1 py-4 font-cairo space-y-6 pb-20">
      
      {/* ── BREADCRUMBS & TOP BAR ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/60 pb-4">
        
        {/* Breadcrumb Path & Last updated */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Link to="/farms/dummy/animals" className="hover:text-[#2d5a1b] hover:underline transition-all font-semibold">الحيوانات</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-700 font-bold">{profile.name}</span>
          </div>
          <span className="text-stone-300">•</span>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span>تم التحديث منذ ساعتين</span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toast.success('فتح تعديل الملف')}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 bg-white text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-50 transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>تعديل الملف</span>
          </button>

          <button 
            onClick={() => toast.success('فتح إضافة تطعيم')}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 bg-white text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-50 transition-colors shadow-sm"
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>اضافة تطعيم</span>
          </button>

          <button 
            onClick={() => toast.success('فتح إضافة سجل طبي')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2d5a1b] hover:bg-[#1e4520] text-white rounded-lg text-xs font-bold transition-colors shadow-md flex-row-reverse"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة سجل طبي</span>
          </button>
        </div>

      </div>

      {/* ── LAYOUT GRID (2 Columns, RTL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN: Animal Header details, Summary cards, basic details, weights, vaccines (w-8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Description block inside right column */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex-shrink-0">
                <img 
                  src={cowImg} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2d5a1b] leading-tight">{profile.name}</h2>
                <div className="flex flex-wrap items-center gap-x-2.5 mt-1.5 text-xs text-stone-400 font-medium">
                  <span>معرف: {profile.id}</span>
                  <span className="text-stone-300">•</span>
                  <span>فصيلة: {profile.species}</span>
                  <span className="text-stone-300">•</span>
                  <span>سلالة: {profile.breed}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate(-1)} 
              className="text-stone-400 hover:text-stone-600 transition-colors text-xs font-bold flex items-center gap-1"
            >
              <span>العودة للحيوانات</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Vitals Summary row (4 cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Health General Index */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between min-h-[105px] relative overflow-hidden">
              <div className="absolute left-3 top-3">
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                  {profile.statusTag || 'سليم'}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 block font-bold mt-1">الحالة الصحية العامة</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-emerald-600">{profile.status}</span>
              </div>
            </div>

            {/* Risk Index */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between min-h-[105px] relative overflow-hidden">
              <div className="absolute left-3 top-3">
                <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                  {profile.riskTag || 'متوسط'}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 block font-bold mt-1">مستوى المخاطر</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-stone-700">{profile.risk}</span>
              </div>
            </div>

            {/* Last Check */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between min-h-[105px] relative overflow-hidden">
              <span className="text-[10px] text-stone-400 block font-bold">آخر فحص</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-stone-700">{profile.lastCheck}</span>
              </div>
            </div>

            {/* AI Tips Alerts */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between min-h-[105px] relative overflow-hidden">
              <span className="text-[10px] text-stone-400 block font-bold">توصيات الذكاء الاصطناعي</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#2d5a1b] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-[#2d5a1b]">{profile.aiAlerts}</span>
              </div>
            </div>

          </div>

          {/* Basic Details Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-850">البيانات الأساسية</h3>
              <span className="text-[10px] text-stone-400 font-medium">تم التحقق من البيانات • ID: {profile.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs text-stone-650">
              <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                <span className="text-stone-400 font-medium">تاريخ الميلاد</span>
                <span className="font-bold text-stone-800">{profile.birthDate}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                <span className="text-stone-400 font-medium">العمر</span>
                <span className="font-bold text-stone-800">{profile.age}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                <span className="text-stone-400 font-medium">رقم التسجيل</span>
                <span className="font-bold text-stone-800 font-mono">{profile.regNo}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                <span className="text-stone-400 font-medium">معدل الإنتاج</span>
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <span>{profile.yield}</span>
                  {profile.yieldGroup && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{profile.yieldGroup}</span>}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-50 pb-2 col-span-2">
                <span className="text-stone-400 font-medium">الوزن الحالي</span>
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <span>{profile.weight}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">{profile.weightChange}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Weight Tracking SVG bar chart */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-stone-800">تتبع الوزن (30 يوم)</h3>
                <span className="text-[10px] text-stone-400 mt-0.5 block">زيادة مستقرة وفقاً للمقاييس القياسية</span>
              </div>
              <div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 text-[10px] text-stone-600 hover:bg-stone-100 font-bold">
                  <span>آخر 30 يوم</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>
              </div>
            </div>

            {/* Custom styled bars matching the green shade exactly */}
            <div className="pt-4">
              <div className="relative w-full h-44 flex items-end justify-between border-b border-stone-200 pb-2">
                {profile.weightHistory?.map((w, index) => {
                  const heightPercent = (w / 850) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group relative">
                      <div className="absolute bottom-full mb-1 bg-stone-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold pointer-events-none z-10">
                        {w} كجم
                      </div>
                      
                      <div 
                        style={{ height: `${heightPercent}%` }} 
                        className="w-7 md:w-10 bg-[#3d6b47]/80 hover:bg-[#2d5a1b] rounded-t-sm transition-all duration-300 cursor-pointer shadow-xs"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vaccination History table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-850">تاريخ التطعيمات</h3>
              <button 
                onClick={() => toast.success('تنزيل السجل بالكامل...')}
                className="text-xs font-bold text-[#2d5a1b] hover:underline"
              >
                تحميل السجل بالكامل
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold text-[10px]">
                    <th className="p-3">اللقاح</th>
                    <th className="p-3">تاريخ الاعطاء</th>
                    <th className="p-3">رقم التشغيلة</th>
                    <th className="p-3">الجرعة القادمة</th>
                    <th className="p-3 text-left">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                  {profile.vaccinations?.map((vac, index) => (
                    <tr key={index} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-bold text-stone-850">{vac.name}</td>
                      <td className="p-3 text-stone-400">{vac.date}</td>
                      <td className="p-3 font-mono text-stone-400 text-[10px]">{vac.batch}</td>
                      <td className={`p-3 ${vac.nextDateColor}`}>{vac.nextDate}</td>
                      <td className="p-3 text-left">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          vac.status === 'محدث' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {vac.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* LEFT COLUMN: Plan, timeline logs, predictions, comments (w-4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active treatment plan card (Dark green header theme) */}
          {profile.treatment && (
            <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              {/* Solid dark green header box */}
              <div className="bg-[#2d5a1b] text-white px-5 py-4 font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-200 fill-green-200/20" />
                <span className="text-xs">خطة العلاج النشطة</span>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl space-y-3.5">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">التشخيص</span>
                    <span className="text-xs font-black text-stone-800">{profile.treatment.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold mb-0.5">البروتوكول العلاجي</span>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">{profile.treatment.protocol}</p>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-stone-600">
                      <span>التقدم</span>
                      <span>{profile.treatment.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${profile.treatment.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => toast.success('عرض تفاصيل العلاج الكاملة')}
                  className="w-full text-center text-xs font-bold py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-650 transition-colors shadow-sm active:scale-98"
                >
                  عرض التفاصيل
                </button>
              </div>
            </div>
          )}

          {/* Medical Log timeline list */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-stone-800 border-b border-stone-100 pb-2">السجل الطبي</h3>
            
            {/* Timeline */}
            <div className="relative pr-4 border-r border-stone-250 space-y-6">
              {profile.history?.map((hist, idx) => (
                <div key={idx} className="relative space-y-1 text-xs">
                  {/* Timeline dot */}
                  <span className={`absolute -right-[21px] top-1.5 w-2.5 h-2.5 rounded-full border border-white ${hist.dotColor} shadow-xs`} />
                  
                  <span className="text-[10px] text-stone-400 block font-bold">{hist.date}</span>
                  <h4 className="font-black text-stone-800 text-xs">{hist.title}</h4>
                  <p className="text-[11.5px] text-stone-500 leading-relaxed font-semibold">{hist.description}</p>
                  
                  <div className="flex justify-between text-[10px] text-stone-400 pt-1">
                    <span>الطبيب: {hist.doctor}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => toast.success('تحميل السجلات الطبية القديمة')}
              className="w-full text-center text-xs font-bold py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors shadow-sm mt-2 active:scale-98"
            >
              تحميل السجلات السابقة
            </button>
          </div>

          {/* AI Forecast predictive recommendations */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2d5a1b]/5 to-[#3d6b47]/5 border border-[#2d5a1b]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#2d5a1b]">
              <Zap className="w-5 h-5 fill-[#2d5a1b]/10" />
              <span className="text-xs">توقعات الذكاء الاصطناعي</span>
            </div>
            
            <p className="text-xs text-stone-600 leading-relaxed font-semibold">
              {profile.aiPrediction}
            </p>

            <div className="pt-2 border-t border-stone-200/50 flex justify-between items-center text-[10px] font-bold text-stone-500">
              <span>درجة دقة التنبؤ</span>
              <span className="bg-[#2d5a1b] text-white px-2.5 py-0.5 rounded-full">{profile.aiConfidence} ثقة</span>
            </div>
          </div>

          {/* Doctor/Breeder Notes chat-like form */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-stone-800 border-b border-stone-100 pb-2">ملاحظات الطبيب والمربي</h3>
            
            {/* Notes List */}
            <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
              {profile.notes?.map((note, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-stone-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>{note.author}</span>
                      <span className="text-[9px] font-normal text-stone-400">({note.role})</span>
                    </span>
                    <span className="text-stone-400">{note.time}</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed font-semibold text-[11px]">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Add note input form */}
            <form onSubmit={handleAddNote} className="relative flex items-center bg-stone-50 border border-stone-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-[#2d5a1b]/20 focus-within:border-[#2d5a1b] transition-all">
              <input 
                type="text" 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="إضافة ملاحظة..."
                className="flex-1 pr-3 pl-10 py-2 text-xs bg-transparent outline-none text-stone-700 placeholder:text-stone-400"
              />
              <button 
                type="submit"
                className="absolute left-1.5 p-1.5 bg-[#2d5a1b] hover:bg-[#3d6b47] text-white rounded-lg transition-colors flex items-center justify-center active:scale-95"
              >
                <Send className="w-3.5 h-3.5 transform rotate-180" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}

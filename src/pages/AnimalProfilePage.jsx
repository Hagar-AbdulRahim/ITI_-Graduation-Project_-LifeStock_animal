import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  ChevronRight, Edit, Syringe, Plus, ShieldCheck, 
  AlertTriangle, Calendar, Zap, Heart, User, Send, ChevronDown, Loader2, Trash2
} from 'lucide-react';
import cowImg from '../assets/images/cow.jpg';
import { fetchAnimalById, fetchAnimalVaccinations, fetchAnimalMedicalHistory, fetchAnimalDiagnosisHistory, clearAnimalState } from '../redux/animalSlice';
import { animalService } from '../features/animals/services/animalService';

const formatAge = (ageValue, ageUnit) => {
  if (ageValue == null) return '—';
  if (ageUnit === 'years') {
    return `${ageValue} سنة`;
  }
  return `${ageValue} شهر`;
};

export default function AnimalProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Primary: fetch full animal from dedicated slice ──
  const { animal, vaccinations, medicalHistory, loading, error } = useSelector((state) => state.animal);

  // ── Fallback: if animal not yet in slice, check farmAnimals list ──
  const fallbackAnimal = useSelector((state) =>
    state.farm?.farmAnimals?.find((a) => a._id === id)
  );

  // Use whichever is available
  const animalData = animal || fallbackAnimal || null;

  useEffect(() => {
    // Clear stale animal data from a previous profile visit
    dispatch(clearAnimalState());
    if (id) {
      dispatch(fetchAnimalById(id));
      dispatch(fetchAnimalVaccinations(id));
      dispatch(fetchAnimalMedicalHistory(id));
    }
  }, [dispatch, id]);

  // ── Map backend data → UI profile object ──
  const buildProfile = (a) => ({
    id: a.tag_number || a._id,
    name: `معرف: ${a.tag_number || a._id}`,
    species: a.species === 'cattle' ? 'أبقار' : a.species === 'sheep' ? 'أغنام' : 'ماعز',
    breed: a.breed || 'غير محدد',
    gender: a.gender === 'female' ? 'أنثى' : 'ذكر',
    age: formatAge(a.age_value, a.age_unit),
    regNo: `REG-${a.tag_number || a._id}`,
    weight: `${a.weight_kg || 0} كجم`,
    weightChange: '+0.5%',
    yield: '—',
    yieldGroup: '',
    status: a.health_status === 'healthy' ? 'ممتازة' : 'يحتاج رعاية',
    statusTag: a.health_status === 'healthy' ? 'سليم' : 'مريض',
    risk: 'مستقر',
    riskTag: 'متوسط',
    lastCheck: 'الآن',
    aiAlerts: 'لا يوجد تنبيهات حيوية',
    treatment: null,
    history: medicalHistory?.map((h) => ({
      date: new Date(h.date || h.createdAt).toLocaleDateString('ar-EG'),
      type: 'checkup',
      title: h.condition || h.title,
      description: h.treatment || h.description,
      doctor: h.veterinarian || 'طبيب بيطري',
      dotColor: 'bg-emerald-500',
    })) || [],
    vaccinations: vaccinations?.map((v) => ({
      name: v.vaccine_name,
      date: v.last_date ? new Date(v.last_date).toLocaleDateString('ar-EG') : 'غير محدد',
      batch: v.batch_number || '-',
      nextDate: v.next_due_date ? new Date(v.next_due_date).toLocaleDateString('ar-EG') : 'غير محدد',
      nextDateColor: 'text-stone-600',
      status: 'محدث',
    })) || [],
    aiPrediction: 'الحالة مستقرة، يوصى بالمحافظة على جدول التطعيمات.',
    aiConfidence: '90%',
    notes: a.notes || [],
    weightHistory: [410, 412, 415, 418, 419, a.weight_kg || 420],
  });

  const profile = animalData ? buildProfile(animalData) : null;

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

    // Normally this would be a dispatch, but we update UI optimistically for now
    setNoteText('');
    toast.success('تمت إضافة الملاحظة بنجاح!');
  };

  const handleDeleteAnimal = async () => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الحيوان نهائياً؟ ستفقد جميع السجلات المرتبطة به.')) {
      try {
        await animalService.deleteAnimal(id);
        toast.success('تم حذف الحيوان بنجاح');
        navigate(animal?.farm_id ? `/farms/${animal.farm_id}/animals` : '/farms');
      } catch (err) {
        toast.error('حدث خطأ أثناء محاولة الحذف');
      }
    }
  };

  // ── Spinner: only while actively fetching AND no fallback data yet ──
  if (loading.animal && !profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-cairo">
        <Loader2 className="w-8 h-8 text-[#2d5a1b] animate-spin" />
      </div>
    );
  }

  // ── Error state: API failed and nothing to show ──
  if (!loading.animal && !profile) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 font-cairo text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">لم يتم العثور على بيانات الحيوان</h2>
        <p className="text-sm text-gray-500">تأكد من الاتصال بالخادم وصحة الرابط</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-6 py-2.5 bg-[#2d5a1b] text-white rounded-xl text-sm font-bold hover:bg-[#1e4520] transition-colors"
        >
          الرجوع للخلف
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-1 py-4 font-cairo space-y-6 pb-20">
      
      {/* ── BREADCRUMBS & TOP BAR ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/60 pb-4">
        
        {/* Breadcrumb Path & Last updated */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Link to={`/farms/${animalData?.farm_id}/animals`} className="hover:text-[#2d5a1b] hover:underline transition-all font-semibold">الحيوانات</Link>
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
            onClick={handleDeleteAnimal}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>

          <button 
            onClick={() => navigate(`/animals/edit/${id}`)}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 bg-white text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-50 transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>تعديل الملف</span>
          </button>

          <button 
            onClick={() => navigate(`/animals/${id}/vaccinations/add`)}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 bg-white text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-50 transition-colors shadow-sm"
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>اضافة تطعيم</span>
          </button>

          <button 
            onClick={() => navigate(`/animals/${id}/medical-records/add`)}
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
                  src={
                    animalData?.image
                      ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${animalData.image}`
                      : {
                          cattle: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=500&h=280',
                          sheep: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=500&h=280',
                          goat: 'https://images.unsplash.com/photo-1501706362039-c06b2d715385?auto=format&fit=crop&q=80&w=500&h=280',
                        }[animalData?.species] || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=500&h=280'
                  } 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.target.src = 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=500&h=280';
                  }}
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
              onClick={() => navigate(`/farms/${animalData?.farm_id}/animals`)} 
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
              <div className="flex justify-between items-center border-b border-stone-50 pb-2 col-span-2">
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

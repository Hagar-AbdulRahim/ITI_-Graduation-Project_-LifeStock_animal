import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  ChevronRight,
  Edit,
  Syringe,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Zap,
  Heart,
  Loader2,
  Trash2,
  MapPin,
  Tag,
  Weight,
  Clock,
  Activity,
  Home,
  StickyNote,
} from 'lucide-react'
import {
  fetchAnimalById,
  fetchAnimalVaccinations,
  fetchAnimalMedicalHistory,
  clearAnimalState,
  deleteExistingAnimal,
} from '../redux/animalSlice'

const BASE_URL = 'http://localhost:5000'

const SPECIES_MAP = {
  cattle: { label: 'أبقار', emoji: '🐄' },
  sheep:  { label: 'أغنام', emoji: '🐑' },
  goat:   { label: 'ماعز', emoji: '🐐' },
}

const HEALTH_STATUS_MAP = {
  healthy:  { label: 'سليم',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  sick:     { label: 'مريض',       color: 'bg-red-100 text-red-700 border-red-200',             dot: 'bg-red-500' },
  critical: { label: 'حالة حرجة', color: 'bg-orange-100 text-orange-700 border-orange-200',    dot: 'bg-orange-500' },
  deceased: { label: 'نافق',       color: 'bg-gray-100 text-gray-600 border-gray-200',          dot: 'bg-gray-400' },
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className={`text-sm font-bold text-gray-800 ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function AnimalProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { animal, loading, error } = useSelector((state) => state.animal)
  const fallbackAnimal = useSelector((state) =>
    state.farm?.farmAnimals?.find((a) => a._id === id),
  )

  const a = animal || fallbackAnimal || null
  const farmIdForNavigation = a?.farm_id?._id || a?.farm_id || null

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    dispatch(clearAnimalState())
    if (id) {
      dispatch(fetchAnimalById(id))
      dispatch(fetchAnimalVaccinations(id))
      dispatch(fetchAnimalMedicalHistory(id))
    }
  }, [dispatch, id])

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await dispatch(deleteExistingAnimal(id)).unwrap()
      toast.success('تم حذف الحيوان بنجاح')
      setShowDeleteModal(false)
      navigate(farmIdForNavigation ? `/farms/${farmIdForNavigation}/animals` : '/farms')
    } catch (err) {
      toast.error(err || 'حدث خطأ أثناء محاولة الحذف')
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Loading ──
  if (loading.animal && !a) {
    return (
      <div className="min-h-screen flex items-center justify-center font-cairo">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#2d5a1b] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">جاري تحميل بيانات الحيوان...</p>
        </div>
      </div>
    )
  }

  // ── Error / Not Found ──
  if (!loading.animal && !a) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center gap-4 font-cairo text-center px-4"
      >
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
    )
  }

  // ── Derived display values ──
  const species      = SPECIES_MAP[a.species] || { label: a.species, emoji: '🐾' }
  const healthStatus = HEALTH_STATUS_MAP[a.health_status] || HEALTH_STATUS_MAP.healthy
  const farmName     = a.farm_id?.name || '—'
  const governorate  = a.farm_id?.governorate || null
  const imageUrl     = a.image ? `${BASE_URL}${a.image}` : null
  const gender       = a.gender === 'female' ? 'أنثى' : 'ذكر'
  const age          = a.age_value !== undefined
    ? `${a.age_value} ${a.age_unit === 'years' ? 'سنة' : 'شهر'}`
    : 'غير محدد'
  const weight       = a.weight_kg != null ? `${a.weight_kg} كجم` : 'غير محدد'
  const breed        = a.breed || 'غير محدد'
  const notes        = a.notes || null
  const createdAt    = a.created_at
    ? new Date(a.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 py-6 font-cairo pb-20 space-y-6">

      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link
          to={farmIdForNavigation ? `/farms/${farmIdForNavigation}/animals` : '/farms'}
          className="hover:text-[#2d5a1b] font-semibold transition-colors"
        >
          الحيوانات
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-bold">{a.tag_number}</span>
      </nav>

      {/* ── HERO PROFILE CARD ── */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg border border-[#2d5a1b]/15">
        {/* Green gradient header */}
        <div className="bg-gradient-to-l from-[#2d5a1b] to-[#3d7a25] px-6 pt-8 pb-16 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black leading-tight flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#a8d5a2]" />
                {a.tag_number}
              </h1>
              {(farmName || governorate) && (
                <p className="text-[#c4e8be] text-sm mt-1.5 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  {farmName}{governorate ? ` — ${governorate}` : ''}
                </p>
              )}
            </div>

            {/* Animal image / emoji */}
            <div className="relative flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={a.name}
                  className="w-20 h-20 rounded-2xl object-cover border-3 border-white/40 shadow-lg"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-5xl shadow-inner">
                  {species.emoji}
                </div>
              )}
              {/* Active indicator */}
              {a.is_active && (
                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-[9px] font-black">✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${healthStatus.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.dot}`} />
              {healthStatus.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30">
              {species.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30">
              {gender}
            </span>
          </div>
        </div>

        {/* White body overlapping the green header */}
        <div className="relative bg-white -mt-8 mx-4 mb-4 rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
          {/* Quick stats strip */}
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100">
            <div className="flex flex-col items-center gap-1 px-4 py-2">
              <span className="text-lg font-black text-[#2d5a1b]">{age}</span>
              <span className="text-[10px] text-gray-400 font-semibold">العمر</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-2">
              <span className="text-lg font-black text-[#2d5a1b]">{weight}</span>
              <span className="text-[10px] text-gray-400 font-semibold">الوزن</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-2">
              <span className="text-lg font-black text-[#2d5a1b]">{breed}</span>
              <span className="text-[10px] text-gray-400 font-semibold">السلالة</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: 'تشخيص ذكي',      icon: Zap,         color: 'text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-300', action: () => navigate(`/diagnosis?animalId=${id}`) },
          { label: 'السجل الطبي',     icon: Heart,        color: 'text-red-500 border-red-100 hover:bg-red-50 hover:border-red-300',                 action: () => navigate(`/animals/${id}/medical-records`) },
          { label: 'التطعيمات',       icon: Syringe,      color: 'text-blue-500 border-blue-100 hover:bg-blue-50 hover:border-blue-300',             action: () => navigate(`/animals/${id}/vaccinations`) },
          { label: 'مستشار اللقاحات', icon: ShieldCheck,  color: 'text-[#2d5a1b] border-[#2d5a1b]/20 hover:bg-[#2d5a1b]/5 hover:border-[#2d5a1b]/40', action: () => navigate('/vaccine-agent') },
          { label: 'تعديل البيانات',  icon: Edit,         color: 'text-amber-600 border-amber-100 hover:bg-amber-50 hover:border-amber-300',         action: () => navigate(`/animals/edit/${id}`) },
        ].map(({ label, icon: Icon, color, action }) => (
          <button
            key={label}
            onClick={action}
            className={`flex flex-col items-center gap-2 p-4 bg-white border-2 rounded-2xl transition-all shadow-sm font-cairo ${color}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-bold text-gray-700 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Basic Data Card ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-[#2d5a1b]/3">
              <div className="w-8 h-8 rounded-xl bg-[#2d5a1b]/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#2d5a1b]" />
              </div>
              <h2 className="text-sm font-black text-gray-800">البيانات الأساسية</h2>
              <span className="mr-auto text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-md">
                {a.tag_number}
              </span>
            </div>

            <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              <InfoRow label="رقم الوسم" value={a.tag_number} mono />
              <InfoRow label="النوع"            value={`${species.emoji} ${species.label}`} />
              <InfoRow label="الجنس"            value={gender} />
              <InfoRow label="السلالة"          value={breed} />
              <InfoRow label="العمر"            value={age} />
              <InfoRow label="الوزن"            value={weight} />
              <InfoRow label="الحالة الصحية"   value={healthStatus.label} />
              <InfoRow label="المزرعة"          value={farmName} />
              {governorate && <InfoRow label="المحافظة" value={governorate} />}
              <InfoRow label="تاريخ الإضافة"   value={createdAt} />
            </div>
          </div>

          {/* Notes card — only shown if notes exist */}
          {notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-[#2d5a1b]/3">
                <div className="w-8 h-8 rounded-xl bg-[#2d5a1b]/10 flex items-center justify-center">
                  <StickyNote className="w-4 h-4 text-[#2d5a1b]" />
                </div>
                <h2 className="text-sm font-black text-gray-800">ملاحظات</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">{notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Status + Actions sidebar ── */}
        <div className="space-y-4">

          {/* Health status card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider">
              الحالة الصحية
            </h3>
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${healthStatus.color}`}>
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${healthStatus.dot}`} />
              <span className="text-sm font-black">{healthStatus.label}</span>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> تاريخ الإضافة
                </span>
                <span className="font-bold text-gray-700">{createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> رقم الوسم
                </span>
                <span className="font-bold text-gray-700 font-mono">{a.tag_number}</span>
              </div>
              {governorate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> المحافظة
                  </span>
                  <span className="font-bold text-gray-700">{governorate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delete Action */}
          <div className="pt-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              حذف الحيوان نهائياً
            </button>
          </div>

        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-cairo">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-center space-y-4" dir="rtl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">تأكيد الحذف</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              حذف الحيوان سيؤدي إلى إزالة جميع سجلاته الطبية والتطعيمات المرتبطة به بشكل نهائي.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
  User,
  Send,
  Loader2,
  Trash2,
  MapPin,
  Tag,
  Weight,
  Clock,
  Activity,
  Home,
  StickyNote,
  Stethoscope,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'
import {
  fetchAnimalById,
  fetchAnimalVaccinations,
  fetchAnimalMedicalHistory,
  clearAnimalState,
  deleteExistingAnimal,
} from '../redux/animalSlice'
import Topbar from '../layout/Topbar'
import cowImg from '../assets/images/Profile/cow.png'
import goatImg from '../assets/images/Profile/goat.png'
import sheepImg from '../assets/images/Profile/sheep.png'

const SPECIES_IMAGE = { cattle: cowImg, sheep: sheepImg, goat: goatImg }

const BASE_URL = 'http://localhost:5000'

const SPECIES_MAP = {
  cattle: { label: 'أبقار', emoji: '🐄' },
  sheep: { label: 'أغنام', emoji: '🐑' },
  goat: { label: 'ماعز', emoji: '🐐' },
}

const HEALTH_STATUS_MAP = {
  healthy: {
    label: 'سليم',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  sick: {
    label: 'مريض',
    color: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  critical: {
    label: 'حالة حرجة',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  deceased: {
    label: 'نافق',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
  },
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center gap-4 py-2.5 px-4 rounded-2xl bg-[#f8f9fa] border border-stone-100 transition-all hover:bg-white hover:border-[#1b4d2c]/30 hover:shadow-sm group">
      <div className="flex-1">
        <span className="block text-xs font-bold text-stone-500 mb-1">{label}</span>
        <span
          className={`block text-[15px] font-black text-stone-800 ${mono ? 'font-mono text-[#1b4d2c] tracking-wider text-base' : ''}`}
        >
          {value || '—'}
        </span>
      </div>
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
  const aiAssistantPath = farmIdForNavigation
    ? `/farms/${farmIdForNavigation}/ai-assistant?animalId=${encodeURIComponent(id)}`
    : `/ai-assistant?animalId=${encodeURIComponent(id)}`

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
      navigate(
        farmIdForNavigation
          ? `/farms/${farmIdForNavigation}/animals`
          : '/farms',
      )
    } catch (err) {
      toast.error(err || 'حدث خطأ أثناء محاولة الحذف')
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Loading ──
  if (loading.animal && !a) {
    return (
      <div className="min-h-screen flex items-center justify-center font-cairo bg-[#f5f2eb]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#2d5a1b] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            جاري تحميل بيانات الحيوان...
          </p>
        </div>
      </div>
    )
  }

  // ── Error / Not Found ──
  if (!loading.animal && !a) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center gap-4 font-cairo text-center px-4 bg-[#f5f2eb]"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">
          لم يتم العثور على بيانات الحيوان
        </h2>
        <p className="text-sm text-gray-500">
          تأكد من الاتصال بالخادم وصحة الرابط
        </p>
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
  const species = SPECIES_MAP[a.species] || { label: a.species, emoji: '🐾' }
  const healthStatus =
    HEALTH_STATUS_MAP[a.health_status] || HEALTH_STATUS_MAP.healthy
  const farmName = a.farm_id?.name || null
  const governorate = a.farm_id?.governorate || null
  const imageUrl = a.image ? `${BASE_URL}${a.image}` : null
  const gender = a.gender === 'female' ? 'أنثى' : 'ذكر'
  const age =
    a.age_value !== undefined
      ? `${a.age_value} ${a.age_unit === 'years' ? 'سنة' : 'شهر'}`
      : 'غير محدد'
  const weight = a.weight_kg != null ? `${a.weight_kg} كجم` : 'غير محدد'
  const breed = a.breed || 'غير محدد'
  const notes = a.notes || null
  const createdAt = a.created_at
    ? new Date(a.created_at).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '—'

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#f5f2eb] font-['Cairo',sans-serif]">
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <Topbar farmIdProp={farmIdForNavigation} farmNameProp={farmName} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-[#f5f2eb]">
          <div className="bg-white rounded-[32px] border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden min-h-[calc(100vh-140px)] flex flex-col">
            
            <div className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full space-y-6">

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
                  {farmName}
                  {governorate ? ` (${governorate})` : ''}
                </p>
              )}
            </div>

            {/* Animal image */}
            <div className="relative flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={a.name}
                  className="w-20 h-20 rounded-2xl object-cover border-3 border-white/40 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-white/60 p-1">
                  {SPECIES_IMAGE[a.species]
                    ? <img src={SPECIES_IMAGE[a.species]} alt={species.label} className="w-full h-full object-contain select-none" />
                    : <span className="text-5xl select-none">{species.emoji}</span>}
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
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${healthStatus.color}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${healthStatus.dot}`}
              />
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
              <span className="text-[10px] text-gray-400 font-semibold">
                العمر
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-2">
              <span className="text-lg font-black text-[#2d5a1b]">
                {weight}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">
                الوزن
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-2">
              <span className="text-lg font-black text-[#2d5a1b]">{breed}</span>
              <span className="text-[10px] text-gray-400 font-semibold">
                السلالة
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'استشارة بيطرية',
            icon: Stethoscope,
            action: () => navigate(aiAssistantPath),
          },
          {
            label: 'السجل الطبي',
            icon: ClipboardList,
            action: () => navigate(`/animals/${id}/medical-records`),
          },
          {
            label: 'التطعيمات',
            icon: Syringe,
            action: () => navigate(`/animals/${id}/vaccinations`),
          },
          {
            label: 'الطوارئ',
            icon: AlertTriangle,
            action: () => navigate(farmIdForNavigation ? `/farms/${farmIdForNavigation}/emergencies` : '/emergencies'),
          },
          {
            label: 'تعديل البيانات',
            icon: Edit,
            action: () => navigate(`/animals/edit/${id}`),
          },
        ].map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="group relative flex flex-col items-center justify-center gap-3 p-5 bg-white border border-stone-200 border-t-4 border-t-[#2d5a1b] rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-cairo"
          >
            <div className="w-12 h-12 rounded-full bg-[#f8f9fa] border border-stone-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[#1b4d2c]">
              <Icon className="w-5 h-5 text-[#1b4d2c] transition-colors duration-300 group-hover:text-white" />
            </div>
            <span className="text-[13px] font-bold text-stone-700 transition-colors duration-300 group-hover:text-[#1b4d2c]">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Basic Data Card ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-l from-[#2d5a1b] to-[#3d7a25] text-white">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">
                البيانات الأساسية
              </h2>
              <span className="mr-auto text-[10px] text-white/90 font-mono bg-black/15 border border-white/10 px-2.5 py-1 rounded-lg">
                {a.tag_number}
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="رقم التعريف" value={a.tag_number} mono icon={Tag} />
              <InfoRow label="النوع" value={species.label} icon={Activity} />
              <InfoRow label="الجنس" value={gender} icon={User} />
              <InfoRow label="السلالة" value={breed} icon={ShieldCheck} />
              <InfoRow label="العمر" value={age} icon={Clock} />
              <InfoRow label="الوزن" value={weight} icon={Weight} />
              <InfoRow label="الحالة الصحية" value={healthStatus.label} icon={Heart} />
              <InfoRow label="المزرعة" value={farmName || '—'} icon={Home} />
              {governorate && <InfoRow label="المحافظة" value={governorate} icon={MapPin} />}
              <InfoRow label="تاريخ الإضافة" value={createdAt} icon={Calendar} />
            </div>
          </div>

          {/* Notes card — only shown if notes exist */}
          {notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-l from-[#2d5a1b] to-[#3d7a25] text-white">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                  <StickyNote className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-black text-white">ملاحظات</h2>
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-l from-[#2d5a1b] to-[#3d7a25] text-white">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">الحالة الصحية</h2>
            </div>
            <div className="p-5 space-y-4">
              <div
              className={`flex items-center gap-3 p-3 rounded-xl border ${healthStatus.color}`}
            >
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${healthStatus.dot}`}
              />
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
                  <Tag className="w-3 h-3" /> رقم التعريف
                </span>
                <span className="font-bold text-gray-700 font-mono">
                  {a.tag_number}
                </span>
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

            </div>
          </div>
        </main>
        
        {/* ── DELETE MODAL ── */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-cairo">
            <div
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-center space-y-4"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">تأكيد الحذف</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                حذف الحيوان سيؤدي إلى إزالة جميع سجلاته الطبية والتطعيمات المرتبطة
                به بشكل نهائي.
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
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

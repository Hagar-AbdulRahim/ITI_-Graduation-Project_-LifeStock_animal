import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRight, AlertTriangle, ChevronLeft, Edit2, Syringe, FileText, 
  ShieldCheck, Calendar, Zap, Activity, CheckCircle, ChevronDown, 
  Download, Sparkles, Send, Check
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

import {
  fetchAnimalById,
  fetchAnimalVaccinations,
  fetchAnimalMedicalHistory,
  fetchAnimalDiagnosisHistory,
  fetchAnimalWeightHistory,
  clearAnimalState,
} from '../redux/animalSlice';

const AnimalProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    animal,
    vaccinations,
    medicalHistory,
    loading,
    error,
  } = useSelector((state) => state.animal);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchAnimalById(id));
    dispatch(fetchAnimalVaccinations(id));
    dispatch(fetchAnimalMedicalHistory(id));
    dispatch(fetchAnimalDiagnosisHistory(id));
    dispatch(fetchAnimalWeightHistory(id));

    return () => {
      dispatch(clearAnimalState());
    };
  }, [id, dispatch]);

  if (loading.animal && !animal) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-cairo" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm font-bold">جارٍ تحميل بيانات الحيوان…</p>
        </div>
      </div>
    );
  }

  if (error.animal && !animal) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-cairo" dir="rtl">
        <div className="bg-white rounded-[20px] shadow-sm border border-red-100 p-8 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="font-bold text-gray-900 mb-2 text-lg">تعذّر تحميل البيانات</h2>
          <p className="text-sm text-gray-500 mb-6">{error.animal}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  // --- MOCK DATA FOR CHART AND UI TO MATCH EXACTLY ---
  const weightData = [
    { weight: 680 }, { weight: 650 }, { weight: 600 }, { weight: 620 },
    { weight: 580 }, { weight: 550 }, { weight: 560 }, { weight: 520 }, { weight: 530 }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-cairo flex flex-col" dir="rtl">
      
      {/* ── Top Navbar Placeholder ── */}
      <div className="bg-white h-20 border-b border-gray-100 flex items-center px-8 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-[#2E7D32]">LivestockCare AI</h1>
      </div>

      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 flex-1">
        
        {/* 1. Header Area */}
        <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="flex items-center gap-6">
            <div className="relative w-[100px] h-[100px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=400&auto=format&fit=crop" 
                alt="Bessie" 
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#154b23] border-[3px] border-white rounded-full flex items-center justify-center z-10 shadow-sm">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                <button onClick={() => navigate('/farms')} className="hover:text-gray-600 transition-colors">الحيوانات</button>
                <ChevronLeft className="w-3 h-3" />
                <span className="text-gray-600">بيسي</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">بيسي (Bessie)</h1>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <span>معرف: LIV-00482</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>فصيلة: بقر</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>سلالة: هولشتاين فريزيان</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                <Edit2 className="w-4 h-4" />
                تعديل الملف
              </button>
              <button className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                <Syringe className="w-4 h-4" />
                إضافة تطعيم
              </button>
              <button className="flex items-center gap-2 bg-[#154b23] hover:bg-[#0f3619] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                <FileText className="w-4 h-4" />
                إضافة سجل طبي
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              تم التحديث منذ ساعتين
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* RIGHT COLUMN (Takes 8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold mb-2">سليم</span>
                <p className="text-xs text-gray-500 font-bold mb-1">الحالة الصحية العامة</p>
                <h4 className="font-bold text-gray-900 text-sm">ممتازة</h4>
              </div>

              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-[10px] font-bold mb-2">متوسط</span>
                <p className="text-xs text-gray-500 font-bold mb-1">مستوى المخاطر</p>
                <h4 className="font-bold text-gray-900 text-sm">مستقر</h4>
              </div>

              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-[#1E88E5]" />
                </div>
                <span className="text-transparent px-2 py-0.5 mb-2 block h-[18px]"></span> {/* Spacer */}
                <p className="text-xs text-gray-500 font-bold mb-1">آخر فحص</p>
                <h4 className="font-bold text-gray-900 text-sm">15 مارس 2024</h4>
              </div>

              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#154b23] border border-green-900 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-transparent px-2 py-0.5 mb-2 block h-[18px]"></span>
                <p className="text-xs text-gray-500 font-bold mb-1">توصيات الذكاء الاصطناعي</p>
                <h4 className="font-bold text-gray-900 text-sm">3 تنبيهات</h4>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-base">البيانات الأساسية</h3>
                <span className="text-xs font-bold text-gray-400">تم التحقق من البيانات • ID: LIV-00482</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 font-bold mb-1.5">تاريخ الميلاد</p>
                  <p className="font-bold text-gray-900 text-sm">12 مايو 2019</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 font-bold mb-1.5">رقم التسجيل</p>
                  <p className="font-bold text-gray-900 text-sm">REG-88293-FR</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 font-bold mb-1.5">العمر</p>
                  <p className="font-bold text-gray-900 text-sm">4 سنوات و 10 أشهر</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-[11px] text-gray-400 font-bold mb-1.5">الوزن الحالي</p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm">720 كجم</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+1.2%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 font-bold mb-1.5">معدل الإنتاج</p>
                  <p className="font-bold text-gray-900 text-sm">28.4 لتر / يوم</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 font-bold mb-1.5">المجموعة</p>
                  <p className="font-bold text-gray-900 text-sm">قطيع الحليب أ</p>
                </div>
              </div>
            </div>

            {/* Weight Tracking */}
            <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    آخر 30 يوم
                  </button>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 text-base mb-1">تتبع الوزن (30 يوم)</h3>
                  <p className="text-[10px] text-gray-500 font-bold">زيادة مستقرة وفقاً للمعايير القياسية</p>
                </div>
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weightData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                      {weightData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#154b23' : '#a3bfa8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vaccination History */}
            <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <button className="text-[11px] font-bold text-gray-600 hover:text-gray-900 transition-colors">
                  تحميل السجل بالكامل
                </button>
                <h3 className="font-bold text-gray-900 text-base">تاريخ التطعيمات</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/30">
                      <th className="px-6 py-4 font-bold text-gray-500 text-[11px] text-center">اللقاح</th>
                      <th className="px-6 py-4 font-bold text-gray-500 text-[11px] text-center">تاريخ الإعطاء</th>
                      <th className="px-6 py-4 font-bold text-gray-500 text-[11px] text-center">رقم التشغيلة</th>
                      <th className="px-6 py-4 font-bold text-gray-500 text-[11px] text-center">الجرعة القادمة</th>
                      <th className="px-6 py-4 font-bold text-gray-500 text-[11px] text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-gray-900 text-xs">
                        الإسهال الفيروسي البقري (BVD)
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-xs">12 أكتوبر</span>
                          <span className="text-[10px] text-gray-500">2023</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 text-[11px] font-bold">
                        BVD-449-X
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-xs">12 أكتوبر</span>
                          <span className="text-[10px] text-gray-500">2024</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-600 text-[10px] font-bold">محدث</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-gray-900 text-xs">
                        الحمى القلاعية (FMD)
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-xs">05 يناير</span>
                          <span className="text-[10px] text-gray-500">2024</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 text-[11px] font-bold">
                        FMD-221-Z
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-red-600 text-xs">05 يوليو</span>
                          <span className="text-[10px] font-bold text-red-600">2024</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-yellow-600 text-[10px] font-bold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">مستحق</span>
                          <span className="text-yellow-600 text-[9px] font-bold mt-0.5">قريباً</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* LEFT COLUMN (Takes 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Active Treatment Plan */}
            <div className="bg-[#2a5c2a] rounded-[20px] shadow-sm p-6 text-white">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-white/80" />
                <h3 className="font-bold text-lg">خطة العلاج النشطة</h3>
              </div>
              
              <div className="bg-white/10 rounded-xl p-5 mb-5 border border-white/10">
                <p className="text-[10px] text-white/60 font-bold mb-1">التشخيص</p>
                <h4 className="font-bold text-base mb-4">التهاب ضرع خفيف</h4>
                
                <p className="text-[10px] text-white/60 font-bold mb-1">البروتوكول</p>
                <p className="text-xs font-bold leading-relaxed mb-5">
                  تنظيف موضعي يومي مع وضع جل الغدد الثديية (10 جم) لمدة 5 أيام.
                </p>

                <div className="mb-2 flex justify-between items-center text-[10px] font-bold">
                  <span>تقدم</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-[#81c784] h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <button className="w-full bg-white text-[#2a5c2a] hover:bg-gray-50 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">
                عرض التفاصيل
              </button>
            </div>

            {/* Medical Record */}
            <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-6 text-right">السجل الطبي</h3>
              
              <div className="relative border-r-2 border-gray-100 pr-5 space-y-6 mb-6">
                
                <div className="relative">
                  <div className="absolute -right-[29px] top-1 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center z-10">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">15 مارس 2024</p>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">فحص جسدي روتيني</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      "الحيوان في حالة بدنية مثالية، أصوات الرئة والمعدة طبيعية."
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold mt-2">د. سارة منير</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -right-[29px] top-1 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center z-10">
                    <Activity className="w-3 h-3 text-[#1E88E5]" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">28 فبراير 2024</p>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">تحليل دم: نقص كالسيوم</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      اكتشاف نقص طفيف في الكالسيوم. التوصية بتعديل المكملات الغذائية.
                    </p>
                  </div>
                </div>

              </div>

              <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors">
                تحميل السجلات السابقة
              </button>
            </div>

            {/* AI Predictions */}
            <div className="bg-[#fcfdfa] border border-[#eaf5eb] rounded-[20px] shadow-sm p-5 relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2a5c2a]" />
                  <h4 className="text-xs font-bold text-gray-900">توقعات الذكاء الاصطناعي</h4>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed text-right mb-4">
                بناءً على اتجاهات الوزن الحالية واستقرار إنتاج الحليب، من المتوقع أن تدخل "بيسي" ذروة دورة الإنتاج خلال 14 يوماً. يُقترح زيادة تناول الفوسفور بنسبة 5% لدعم كثافة العظام.
              </p>
              <div className="bg-[#eaf5eb] px-3 py-1.5 rounded-lg border border-[#c3e6c6] w-fit flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2a5c2a]" />
                <span className="text-[10px] font-bold text-[#154b23]">مستوى الثقة: 94%</span>
              </div>
            </div>

            {/* Vet & Breeder Notes */}
            <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-4 text-right">ملاحظات الطبيب والمربي</h3>
              
              <div className="mb-4 text-right">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] text-gray-400 font-bold">منذ يومين</span>
                  <span className="text-xs font-bold text-gray-900">أحمد (مربي الحيوان)</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  لوحظ انخفاض طفيف في الشهية مساء أمس، لكنها عادت للأكل بشكل طبيعي اليوم.
                </p>
              </div>

              <div className="relative mt-2">
                <input 
                  type="text" 
                  placeholder="إضافة ملاحظة..." 
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 pr-10 text-[11px] text-gray-700 outline-none focus:border-[#2a5c2a] focus:ring-1 focus:ring-[#2a5c2a] transition-all"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#154b23] hover:bg-[#0f3619] text-white rounded-lg flex items-center justify-center transition-colors">
                  <Send className="w-3.5 h-3.5 -ml-0.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Placeholder */}
      <footer className="px-4 md:px-8 py-5 bg-white border-t border-gray-200 flex items-center justify-between text-[11px] font-bold text-gray-500 mt-auto">
        <div className="flex items-center gap-6">
          <button className="hover:text-gray-800 transition-colors">الدعم الفني</button>
          <button className="hover:text-gray-800 transition-colors">وثائق API</button>
          <button className="hover:text-gray-800 transition-colors">شروط الخدمة</button>
          <button className="hover:text-gray-800 transition-colors">سياسة الخصوصية</button>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-gray-900 text-xs">LivestockCare AI</span>
          <span>© 2024 LivestockCare AI، ذكاء بيطري لزراعة مستدامة.</span>
        </div>
      </footer>
    </div>
  );
};

export default AnimalProfilePage;

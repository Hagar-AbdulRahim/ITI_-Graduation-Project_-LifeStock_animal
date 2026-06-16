import React, { useState, useEffect } from 'react';
import { 
  Plus, CheckCircle, Calendar, AlertCircle, Syringe, History, 
  Sparkles, Filter, MoreVertical, Edit2, AlertTriangle, 
  ChevronDown, RotateCcw, Activity
} from 'lucide-react';
import api from '../../services/api';

const VaccinationsPage = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data simulation
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVaccinations([
        {
          id: '1',
          animalName: 'بيلا',
          animalId: 'COW-#042',
          animalType: 'البقر الحلوب - الجناح أ',
          vaccineName: 'الحمى القلاعية (FMD)',
          doseNumber: 'الجرعة 2',
          date: '24 مايو 2024',
          status: 'متأخر',
        },
        {
          id: '2',
          animalName: 'غيمة',
          animalId: 'SHP-#118',
          animalType: 'أغنام المارينو',
          vaccineName: 'داء البروسيلات',
          doseNumber: 'الجرعة 1',
          date: '12 يونيو 2024',
          status: 'مكتمل',
        },
        {
          id: '3',
          animalName: 'زعفران',
          animalId: 'GT-009#',
          animalType: 'ماعز شامي',
          vaccineName: 'اللقاح الرباعي',
          doseNumber: 'تنشيطي',
          date: '30 يونيو 2024',
          status: 'مجدول',
        },
        {
          id: '4',
          animalName: 'ديزي',
          animalId: 'COW-#088',
          animalType: 'البقر الحلوب - الجناح ب',
          vaccineName: 'الالتهاب الرئوي',
          doseNumber: 'الجرعة 3',
          date: '05 يوليو 2024',
          status: 'قيد الانتظار',
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'متأخر':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 w-fit"><div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>{status}</span>;
      case 'مكتمل':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100 w-fit"><div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>{status}</span>;
      case 'مجدول':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E88E5] rounded-full text-xs font-bold border border-blue-100 w-fit"><div className="w-1.5 h-1.5 rounded-full bg-[#1E88E5]"></div>{status}</span>;
      case 'قيد الانتظار':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200 w-fit"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>{status}</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-cairo" dir="rtl">
      
      {/* Top Navbar Placeholder */}
      <div className="bg-white h-20 border-b border-gray-100 flex items-center px-8 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-[#2E7D32]">نظام رعاية الماشية AI</h1>
      </div>

      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="text-right">
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">إدارة التطعيمات</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              تتبع وتحسين الصحة المناعية لقطيعك باستخدام الذكاء الاصطناعي
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#154b23] hover:bg-[#0f3619] text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            إضافة جدول تطعيم جديد
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Completion */}
          <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-gray-500 mt-1">ممتاز</span>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">معدل الإنجاز</p>
            <h3 className="text-3xl font-black text-gray-900">98.2%</h3>
          </div>

          {/* Card 2: Upcoming */}
          <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-gray-500 mt-1">7 أيام قادمة</span>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">قادم قريباً</p>
            <h3 className="text-3xl font-black text-gray-900">86</h3>
          </div>

          {/* Card 3: Overdue */}
          <div className="bg-white border border-red-200 rounded-[20px] shadow-sm p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-600"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-red-600 mt-1">عالي الخطورة</span>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">تطعيمات متأخرة</p>
            <h3 className="text-3xl font-black text-gray-900">14</h3>
          </div>

          {/* Card 4: Total */}
          <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-green-600 mt-1">+12% هذا الشهر</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <Syringe className="w-5 h-5 text-[#1E88E5]" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">إجمالي التطعيمات</p>
            <h3 className="text-3xl font-black text-gray-900">1,284</h3>
          </div>

        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Table Area (Right Side, 8 cols) */}
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
            
            {/* Filters */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-gray-700 ml-2">تصفية حسب:</span>
              
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                كل الحالات
              </button>
              
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                نوع الحيوان (الكل)
              </button>
              
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                نطاق التاريخ
              </button>
              
              <button className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-bold transition-colors flex items-center gap-1.5 mr-auto">
                <RotateCcw className="w-4 h-4" />
                إعادة تعيين
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 font-bold text-gray-500 text-xs">الحيوان (الاسم/المعرف)</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-xs text-center">اسم اللقاح</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-xs text-center">رقم الجرعة</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-xs text-center">التاريخ المجدول</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-xs text-center">الحالة</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-xs text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                        جاري تحميل البيانات...
                      </td>
                    </tr>
                  ) : vaccinations.map((vac) => (
                    <tr key={vac.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${vac.animalType.includes('البقر') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#1E88E5]'}`}>
                            {/* Paw or generic animal icon mockup */}
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{vac.animalName}</p>
                            <p className="font-bold text-gray-900">{vac.animalId}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{vac.animalType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-800">{vac.vaccineName}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                          {vac.doseNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-gray-900">{vac.date.split(' ')[0]}</span>
                          <span className="text-xs text-gray-500">{vac.date.split(' ').slice(1).join(' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(vac.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <button className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                عرض جميع السجلات
              </button>
            </div>
          </div>

          {/* Sidebar Area (Left Side, 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-[#1E88E5]" />
                <h3 className="font-bold text-gray-900 text-lg">النشاط الأخير</h3>
              </div>

              <div className="relative border-r-2 border-gray-100 pr-5 space-y-6">
                
                {/* Item 1 */}
                <div className="relative">
                  <div className="absolute -right-[29px] top-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center"></div>
                  <p className="text-xs text-gray-400 mb-1">منذ ساعتين</p>
                  <p className="text-sm font-bold text-gray-900">تم تطعيم #COW-045</p>
                  <p className="text-xs text-gray-500 mt-1">لقاح الحمى القلاعية - الجرعة الأولى</p>
                </div>

                {/* Item 2 */}
                <div className="relative">
                  <div className="absolute -right-[29px] top-1 w-4 h-4 rounded-full bg-[#1E88E5] border-[3px] border-white shadow-sm flex items-center justify-center"></div>
                  <p className="text-xs text-gray-400 mb-1">منذ 5 ساعات</p>
                  <p className="text-sm font-bold text-gray-900">تحديث جدول #SHP-092</p>
                  <p className="text-xs text-gray-500 mt-1">تم تأجيل الجرعة التنشيطية ليومين</p>
                </div>

                {/* Item 3 */}
                <div className="relative">
                  <div className="absolute -right-[29px] top-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center"></div>
                  <p className="text-xs text-gray-400 mb-1">أمس، 04:30 م</p>
                  <p className="text-sm font-bold text-gray-900">تم تطعيم #GT-221</p>
                  <p className="text-xs text-gray-500 mt-1">اللقاح الرباعي - مكتمل</p>
                </div>

                {/* Item 4 */}
                <div className="relative">
                  <div className="absolute -right-[29px] top-1 w-4 h-4 rounded-full bg-red-400 border-[3px] border-white shadow-sm flex items-center justify-center"></div>
                  <p className="text-xs text-gray-400 mb-1">أمس، 09:15 ص</p>
                  <p className="text-sm font-bold text-gray-900">تنبيه: تأخر تطعيم #COW-012</p>
                  <p className="text-xs text-gray-500 mt-1">لقاح داء البروسيلات متأخر بـ 3 أيام</p>
                </div>

                {/* Item 5 */}
                <div className="relative">
                  <div className="absolute -right-[29px] top-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center"></div>
                  <p className="text-xs text-gray-400 mb-1">10 مايو 2024</p>
                  <p className="text-sm font-bold text-gray-900">تم تطعيم 12 رأس غنم</p>
                  <p className="text-xs text-gray-500 mt-1">حملة تحصين دورية مجمعة</p>
                </div>

              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-[#154b23] rounded-[20px] shadow-sm p-6 text-white relative overflow-hidden">
              <div className="absolute -left-4 -top-4 opacity-10">
                <Sparkles className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-bold text-lg">رؤى الذكاء الاصطناعي</h3>
                </div>
                <p className="text-[13px] text-white/90 leading-relaxed mb-6 font-medium">
                  تشير البيانات الحالية إلى احتمالية نقص في مخزون لقاح FMD خلال الأسبوعين القادمين. نوصي بإعادة الطلب الآن لضمان استمرارية الحملة.
                </p>
                <button className="w-full bg-white text-[#154b23] hover:bg-gray-50 font-bold py-3 rounded-xl text-sm transition-colors shadow-sm">
                  إدارة المخزون
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Placeholder */}
      <footer className="px-4 md:px-8 py-6 bg-white border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-[12px] font-semibold text-gray-500 mt-auto gap-4">
        <div className="flex flex-wrap justify-center items-center gap-6">
          <button className="hover:text-gray-800 transition-colors">دعم تواصل</button>
          <button className="hover:text-gray-800 transition-colors">توثيق API</button>
          <button className="hover:text-gray-800 transition-colors">شروط الخدمة</button>
          <button className="hover:text-gray-800 transition-colors">سياسة الخصوصية</button>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
          <span className="text-gray-900 font-bold">LivestockCare AI</span>
          <span>© 2026 LivestockCare AI، ذكاء بيطري لزراعة مستدامة.</span>
        </div>
      </footer>
    </div>
  );
};

export default VaccinationsPage;

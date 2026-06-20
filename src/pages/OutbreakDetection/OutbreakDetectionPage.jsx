import React, { useState, useEffect } from 'react';
import { 
  Share2, Filter, ZoomIn, ZoomOut, Layers, ChevronLeft, 
  Bell, History, Gavel, Network, Mail, ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import api from '../../services/api';

const OutbreakDetectionPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [outbreaks, setOutbreaks] = useState([]);

  useEffect(() => {
    // API Simulation for /api/outbreaks, /api/outbreaks/map, /api/outbreaks/trends
    setIsLoading(true);
    setTimeout(() => {
      setOutbreaks([
        { id: 1, type: 'critical' },
        { id: 2, type: 'active' }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const trendData = [
    { name: '1', value: 30 },
    { name: '2', value: 45 },
    { name: '3', value: 40 },
    { name: '4', value: 60 },
    { name: '5', value: 50 },
    { name: '6', value: 75 },
    { name: '7', value: 100, isDanger: true },
    { name: '8', value: 85, isDanger: true },
    { name: '9', value: 55 },
    { name: '10', value: 45 }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-cairo flex flex-col" dir="rtl">
      {/* Top Navbar Placeholder */}
      <div className="bg-white h-20 border-b border-gray-100 flex items-center px-8 sticky top-0 z-30">
        <h1 className="text-xl font-bold text-[#2E7D32]">LivestockCare AI</h1>
      </div>

      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 flex-1">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="text-right">
            <h1 className="text-[28px] font-black text-gray-900 leading-tight">استخبارات الفاشيات</h1>
            <p className="text-[14px] text-gray-500 font-bold mt-1">
              مراقبة في الوقت الفعلي وتحليل تنبئي للأمن الحيوي.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
              <Filter className="w-4 h-4" />
              تصفية العرض
            </button>
            <button className="flex items-center gap-2 bg-[#154b23] hover:bg-[#0f3619] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
              <Share2 className="w-4 h-4" />
              تصدير فاشيات
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* --- TOP ROW --- */}
            {/* MAP (Left Side in UI -> col-span-7 or 8) */}
            <div className="lg:col-span-7 bg-[#ebeae4] border border-gray-200 rounded-[20px] shadow-sm relative overflow-hidden h-[400px]">
              {/* Map Background Simulation */}
              <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
              
              {/* Map Roads lines simulation */}
              <svg className="absolute inset-0 w-full h-full stroke-gray-300 stroke-2 fill-none" viewBox="0 0 800 400">
                <path d="M 0,100 Q 200,150 400,100 T 800,200" />
                <path d="M 300,0 Q 350,200 200,400" />
                <path d="M 500,400 Q 550,250 800,300" />
              </svg>

              {/* Map Labels */}
              <span className="absolute top-[80px] left-[150px] text-gray-500 font-bold text-xs tracking-wider">Lucas</span>
              <span className="absolute top-[160px] left-[350px] text-gray-800 font-black text-sm tracking-wider z-10">Wolf Creek</span>
              <span className="absolute top-[280px] right-[100px] text-gray-500 font-bold text-xs tracking-wider">Sylvan Grove</span>
              <span className="absolute bottom-[20px] left-[100px] text-gray-400 font-bold text-[10px] tracking-wider">Lucas park.</span>

              {/* Outbreak Heat Zones */}
              <div className="absolute top-[140px] left-[340px] w-32 h-32 bg-red-500/20 rounded-full blur-xl"></div>
              <div className="absolute top-[175px] left-[375px] w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg z-10"></div>
              
              <div className="absolute top-[220px] left-[180px] w-24 h-24 bg-red-500/20 rounded-full blur-lg"></div>
              <div className="absolute top-[255px] left-[215px] w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg z-10"></div>

              {/* Map Controls */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                <button className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors mt-2">
                  <Layers className="w-5 h-5" />
                </button>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4 z-20">
                <p className="text-[10px] font-black text-gray-800 mb-3 text-right">دليل المراقبة</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-600">
                    <span>فاشية مؤكدة</span>
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-600">
                    <span>مجموعات مشبوهة</span>
                    <div className="w-3 h-3 rounded-full bg-[#1E88E5]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ALERTS (Right Side in UI -> col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Alert 1 */}
              <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-5 relative overflow-hidden flex justify-between">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-red-600"></div>
                <div className="flex-1 pr-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-gray-400 font-bold">منذ دقيقتين</span>
                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-100">تهديد حرج</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-2">إنفلونزا الطيور (H5N1)</h3>
                  <p className="text-xs text-gray-600 font-bold leading-relaxed mb-4">
                    تأكد انتقال العدوى في قطيع الأبقار المحلي. يوصى بالحجر الصحي الفوري للمنطقة 12-A.
                  </p>
                  <button className="text-xs font-black text-gray-800 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <ChevronLeft className="w-3 h-3" />
                    عرض البيانات
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 pl-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-black text-gray-700">12</div>
                  <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-xs font-black shadow-sm">A</div>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="bg-white border border-gray-200 rounded-[20px] shadow-sm p-5 relative overflow-hidden flex justify-between">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-[#1E88E5]"></div>
                <div className="flex-1 pr-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-gray-400 font-bold">منذ ٤٥ دقيقة</span>
                    <span className="bg-blue-50 text-[#1E88E5] text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100">مراقبة نشطة</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-2">سل البقر</h3>
                  <p className="text-xs text-gray-600 font-bold leading-relaxed mb-4">
                    زيادة في الأعراض التنفسية التي تم اكتشافها عبر أجهزة الاستشعار الصوتية في القطاع الغربي.
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <button className="text-xs font-black text-gray-800 hover:text-gray-600 flex items-center gap-1 transition-colors">
                      <ChevronLeft className="w-3 h-3" />
                      عرض البيانات
                    </button>
                    <span className="text-[10px] font-bold text-[#1E88E5]">٨ حالات مشتبه بها</span>
                  </div>
                </div>
              </div>

              {/* Custom Alert Settings */}
              <div className="bg-[#e4e4dd]/40 border border-gray-200 rounded-[20px] shadow-sm p-6 flex items-center justify-between mt-auto">
                <div>
                  <h4 className="text-sm font-black text-gray-900 mb-1">ضبط تنبيه مخصص</h4>
                  <p className="text-[11px] text-gray-500 font-bold">تهيئة حالات الذكاء الاصطناعي</p>
                </div>
                <button className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </div>

            </div>


            {/* --- BOTTOM ROW --- */}
            {/* COMMUNICATIONS (Left Side in UI -> col-span-5) */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-[20px] shadow-sm p-6">
              <div className="flex items-center justify-center gap-2 mb-8">
                <h3 className="font-black text-gray-900 text-lg">سجل الاتصالات</h3>
                <History className="w-5 h-5 text-red-700" />
              </div>

              <div className="space-y-4">
                
                {/* Item 1 */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="flex-1 text-right">
                    <h4 className="text-xs font-black text-gray-900 mb-1.5">توجيه حكومي</h4>
                    <p className="text-[11px] text-gray-600 font-bold leading-relaxed mb-2">
                      بدء الاختبار الإلزامي لجميع الماشية ضمن نطاق ٥٠ كم من القطاع ٥.
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold">اليوم ١١:٢٢</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-5 h-5 text-red-500" />
                  </div>
                </div>

                {/* Item 2 */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="flex-1 text-right">
                    <h4 className="text-xs font-black text-gray-900 mb-1.5">تحديث توقعات الذكاء الاصطناعي</h4>
                    <p className="text-[11px] text-gray-600 font-bold leading-relaxed mb-2">
                      تحديث لنموذج انتشار الممرضات بناءً على أنماط الرياح من الشمال الشرقي.
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold">اليوم ١١:٠٩</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Network className="w-5 h-5 text-[#1E88E5]" />
                  </div>
                </div>

                {/* Item 3 */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="flex-1 text-right">
                    <h4 className="text-xs font-black text-gray-900 mb-1.5">تم استلام تقرير المختبر</h4>
                    <p className="text-[11px] text-gray-600 font-bold leading-relaxed mb-2">
                      نتائج الأمصال لدفعة ٩٩٣٤ متاحة الآن في قسم التشخيص.
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold">أمس ١٦:٤٥</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

              </div>
            </div>

            {/* TRENDS (Right Side in UI -> col-span-7) */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-[20px] shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <button className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-[11px] font-black shadow-sm hover:bg-gray-100 transition-colors">
                  عرض شهري
                </button>
                <div className="text-right">
                  <h3 className="font-black text-gray-900 text-lg mb-1">اتجاهات الحالات الإقليمية</h3>
                  <p className="text-[11px] text-gray-500 font-bold">آخر 30 يوماً مقابل مسار الذكاء الاصطناعي المتوقع</p>
                </div>
              </div>

              <div className="flex-1 min-h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <ReferenceLine y={60} stroke="#cbd5e1" strokeDasharray="5 5" />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35}>
                      {trendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isDanger ? '#ffcdd2' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Reference Line Label */}
                <div className="absolute right-0 top-[35%] translate-y-[-50%] text-[9px] font-black text-gray-400 text-right pr-2">
                  توقعات<br/>الذكاء<br/>الاصطناعي
                </div>
              </div>

              <div className="border-t border-gray-100 mt-6 pt-6 grid grid-cols-3 divide-x divide-x-reverse divide-gray-100">
                <div className="text-center">
                  <h4 className="text-2xl font-black text-gray-900 mb-1">94%</h4>
                  <p className="text-[10px] text-gray-500 font-bold">دقة الذكاء الاصطناعي</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-black text-[#1E88E5] mb-1">0.82</h4>
                  <p className="text-[10px] text-gray-500 font-bold">عامل R0</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-black text-red-600 mb-1 flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-5 h-5" />
                    24%+
                  </h4>
                  <p className="text-[10px] text-gray-500 font-bold">معدل النمو</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer Placeholder */}
      <footer className="px-4 md:px-8 py-5 bg-white border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-[11px] font-bold text-gray-500 mt-auto gap-4">
        <div className="flex items-center gap-6">
          <button className="hover:text-gray-800 transition-colors">دعم التواصل</button>
          <button className="hover:text-gray-800 transition-colors">وثائق API</button>
          <button className="hover:text-gray-800 transition-colors">شروط الخدمة</button>
          <button className="hover:text-gray-800 transition-colors">سياسة الخصوصية</button>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
          <span className="text-gray-900 font-black text-xs">LivestockCare AI</span>
          <span>© 2024 LivestockCare AI، استخبارات بيطرية لزراعة مستدامة.</span>
        </div>
      </footer>
    </div>
  );
};

export default OutbreakDetectionPage;

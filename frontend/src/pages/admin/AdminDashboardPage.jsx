import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import adminService from '../../services/adminService';
import StatsCard from '../../features/dashboard/components/StatsCard';
import Loader from '../../components/common/Loader';

const SPECIES_MAP = { cattle: 'أبقار', sheep: 'أغنام', goat: 'ماعز' };
const PIE_COLORS = ['#2a5c2a', '#4ade80', '#22c55e', '#16a34a'];

const MONTH_NAMES = ['', 'ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [healthTrends, setHealthTrends] = useState([]);
  const [vaccinations, setVaccinations] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch stats first
        try {
          const statsRes = await adminService.getDashboardStats();
          setStats(statsRes.data?.data || null);
        } catch (err) {
          console.error('Failed to load dashboard stats:', err.response?.data || err);
        }

        // Fetch growth
        try {
          const growthRes = await adminService.getUsersGrowth({ months: 6 });
          setGrowth(
            (growthRes.data?.data || []).map((item) => ({
              name: `${MONTH_NAMES[item._id.month]} ${item._id.year}`,
              count: item.count,
            }))
          );
        } catch (err) {
          console.error('Failed to load growth data:', err);
        }

        // Fetch trends
        try {
          const trendsRes = await adminService.getHealthTrends();
          setHealthTrends(
            (trendsRes.data?.data || []).slice(0, 10).map((item, i) => ({
              name: `${item._id.governorate?.slice(0, 8) || i}`,
              count: item.count,
              severity: item._id.severity,
            }))
          );
        } catch (err) {
          console.error('Failed to load health trends:', err);
        }

        // Fetch vaccinations
        try {
          const vacRes = await adminService.getVaccinationAnalytics();
          setVaccinations(vacRes.data?.data || null);
        } catch (err) {
          console.error('Failed to load vaccination analytics:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="lg" color="#2a5c2a" />
      </div>
    );
  }

  const kpiCards = [
    { label: 'إجمالي المستخدمين', value: stats?.total_users ?? 0, icon: 'users', color: 'blue' },
    { label: 'المزارع', value: stats?.total_farms ?? 0, icon: 'farm', color: 'green' },
    { label: 'الحيوانات', value: stats?.total_animals ?? 0, icon: 'animals', color: 'green' },
    { label: 'حيوانات مريضة', value: stats?.sick_animals ?? 0, icon: 'diagnosis', color: 'red', urgent: stats?.sick_animals > 0 },
    { label: 'فاشيات نشطة', value: stats?.active_outbreaks ?? 0, icon: 'emergency', color: 'rose', urgent: stats?.active_outbreaks > 0 },
    { label: 'استشارات معلقة', value: stats?.pending_consultations ?? 0, icon: 'ai', color: 'blue' },
  ];

  const speciesData = (stats?.animals_by_species || []).map((s) => ({
    name: SPECIES_MAP[s._id] || s._id,
    value: s.count,
  }));

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-300/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-40 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#2a5c2a] to-[#3d8c40] rounded-3xl p-8 shadow-xl shadow-green-900/10 text-white transition-all duration-300 hover:shadow-green-900/20">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-3 drop-shadow-sm">نظرة عامة على المنصة</h2>
          <p className="text-green-50 text-sm md:text-base max-w-xl leading-relaxed">
            مرحباً بك في لوحة تحكم الإدارة. تابع إحصائيات حية ومؤشرات الأداء الرئيسية من قاعدة البيانات للحفاظ على صحة ونشاط الثروة الحيوانية.
          </p>
        </div>
        {/* Decorative elements in banner */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute -top-10 right-20 w-32 h-32 bg-green-200/20 rounded-full blur-xl"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((stat, i) => (
          <StatsCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Area Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-stone-800">نمو المستخدمين</h3>
            <span className="px-3 py-1 bg-green-50 text-[#2a5c2a] text-xs font-bold rounded-full">آخر 6 أشهر</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a5c2a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2a5c2a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#2a5c2a', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="count" stroke="#2a5c2a" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health Trends Bar Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-stone-800">الحالات المرضية حسب المحافظة</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={healthTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#2a5c2a" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Animals Pie Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <h3 className="font-bold text-lg text-stone-800 mb-6">توزيع الحيوانات حسب النوع</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={speciesData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={70} 
                outerRadius={100} 
                paddingAngle={5}
                stroke="none"
              >
                {speciesData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity duration-300 outline-none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {speciesData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                <span className="text-sm text-stone-600 font-medium">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vaccinations Overview */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col">
          <h3 className="font-bold text-lg text-stone-800 mb-6">إحصائيات التطعيمات</h3>
          
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="relative overflow-hidden group bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 flex flex-col justify-center items-center border border-red-100 transition-all hover:scale-[1.02] cursor-default">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-4xl font-black text-red-600 mb-2 relative z-10">{vaccinations?.overdue ?? 0}</p>
              <p className="text-sm font-semibold text-red-800/70 relative z-10">جرعات متأخرة</p>
            </div>
            
            <div className="relative overflow-hidden group bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 flex flex-col justify-center items-center border border-amber-100 transition-all hover:scale-[1.02] cursor-default">
              <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-amber-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-4xl font-black text-amber-600 mb-2 relative z-10">{vaccinations?.upcoming ?? 0}</p>
              <p className="text-sm font-semibold text-amber-800/70 relative z-10">قادمة (30 يوم)</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-stone-50/80 rounded-2xl border border-stone-100/80 text-center">
             <p className="text-xs text-stone-500 font-medium leading-relaxed">
               يُرجى متابعة التطعيمات المتأخرة لتجنب حدوث فاشيات جديدة والحفاظ على صحة القطيع.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

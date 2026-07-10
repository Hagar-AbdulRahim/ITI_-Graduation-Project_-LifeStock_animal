import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import adminService from '../../services/adminService';
import StatsCard from '../../features/dashboard/components/StatsCard';
import Loader from '../../components/common/Loader';

const SPECIES_MAP = { cattle: 'أبقار', sheep: 'أغنام', goat: 'ماعز' };
const PIE_COLORS = ['#1b4d2c', '#2a5c2a', '#4ade80', '#16a34a'];

const MONTH_NAMES = ['', 'ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState([]);


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
    <div className="space-y-7 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#1b4d2c] via-[#1e5530] to-[#2a5c2a] rounded-2xl px-8 py-9 shadow-[0_8px_32px_-4px_rgba(27,77,44,0.40)] text-white border border-[#2a5c2a]/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/15 border border-white/20 rounded-full text-[11px] font-black uppercase tracking-widest">لوحة التحكم</span>
          </div>
          <h2 className="text-3xl font-black mb-2 leading-tight drop-shadow-sm">نظرة عامة على المنصة</h2>
          <p className="text-green-50/80 text-sm max-w-xl leading-relaxed">
            مرحباً بك في لوحة تحكم الإدارة. تابع إحصائيات حية ومؤشرات الأداء الرئيسية من قاعدة البيانات للحفاظ على صحة ونشاط الثروة الحيوانية.
          </p>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-8 right-16 w-36 h-36 bg-green-300/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiCards.map((stat, i) => (
          <StatsCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Area Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_30px_-4px_rgba(27,77,44,0.14)] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-stone-800 text-base leading-tight">نمو المستخدمين</h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">الإحصائيات الشهرية للتسجيل</p>
            </div>
            <span className="px-3 py-1.5 bg-[#f0f8f2] text-[#1b4d2c] text-[11px] font-black rounded-full border border-[#1b4d2c]/15">
              آخر 6 أشهر
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b4d2c" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#1b4d2c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999', fontFamily: 'Cairo' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'Cairo' }}
                itemStyle={{ color: '#1b4d2c', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="count" stroke="#1b4d2c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrowth)" dot={{ fill: '#1b4d2c', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#1b4d2c' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Animals Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_30px_-4px_rgba(27,77,44,0.14)] transition-all duration-300">
          <div className="mb-6">
            <h3 className="font-black text-stone-800 text-base leading-tight">توزيع الحيوانات حسب النوع</h3>
            <p className="text-xs text-stone-400 font-medium mt-0.5">الإحصائيات الكاملة للقطيع</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={speciesData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                stroke="none"
              >
                {speciesData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity duration-300 outline-none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'Cairo' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center flex-wrap gap-5 mt-4">
            {speciesData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-sm text-stone-600 font-bold">{s.name}</span>
                <span className="text-xs text-stone-400 font-medium">({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

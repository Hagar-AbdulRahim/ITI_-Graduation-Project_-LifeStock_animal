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
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#1b4d2c] to-[#2a5c2a] rounded-2xl p-8 shadow-[0_4px_24px_-4px_rgba(27,77,44,0.4)] text-white border border-[#2a5c2a]/30">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2">نظرة عامة على المنصة</h2>
          <p className="text-green-50/90 text-sm max-w-xl leading-relaxed">
            مرحباً بك في لوحة تحكم الإدارة. تابع إحصائيات حية ومؤشرات الأداء الرئيسية من قاعدة البيانات للحفاظ على صحة ونشاط الثروة الحيوانية.
          </p>
        </div>
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
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_24px_-4px_rgba(42,92,42,0.12)] transition-shadow">
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



        {/* Animals Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_24px_-4px_rgba(42,92,42,0.12)] transition-shadow">
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


      </div>
    </div>
  );
}

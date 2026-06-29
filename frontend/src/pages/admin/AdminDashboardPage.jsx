import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import adminService from '../../services/adminService';
import StatsCard from '../../features/dashboard/components/StatsCard';
import Loader from '../../components/common/Loader';

const SPECIES_MAP = { cattle: 'أبقار', sheep: 'أغنام', goat: 'ماعز' };
const PIE_COLORS = ['#2d5a1b', '#3d6b47', '#6b8f71'];

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
        const [statsRes, growthRes, trendsRes, vacRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUsersGrowth({ months: 6 }),
          adminService.getHealthTrends(),
          adminService.getVaccinationAnalytics(),
        ]);
        setStats(statsRes.data.data);
        setGrowth(
          (growthRes.data.data || []).map((item) => ({
            name: `${MONTH_NAMES[item._id.month]} ${item._id.year}`,
            count: item.count,
          }))
        );
        setHealthTrends(
          (trendsRes.data.data || []).slice(0, 10).map((item, i) => ({
            name: `${item._id.governorate?.slice(0, 8) || i}`,
            count: item.count,
            severity: item._id.severity,
          }))
        );
        setVaccinations(vacRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" color="#2d5a1b" />
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-800">نظرة عامة على المنصة</h2>
        <p className="text-sm text-stone-500 mt-1">إحصائيات حية من قاعدة البيانات</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map((stat, i) => (
          <StatsCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4">نمو المستخدمين</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2d5a1b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4">الحالات المرضية حسب المحافظة</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={healthTrends}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3d6b47" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4">توزيع الحيوانات حسب النوع</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={speciesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {speciesData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4">التطعيمات</h3>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <p className="text-3xl font-black text-red-600">{vaccinations?.overdue ?? 0}</p>
              <p className="text-sm text-stone-600 mt-1">متأخرة</p>
            </div>
            <div className="text-center p-6 bg-amber-50 rounded-xl">
              <p className="text-3xl font-black text-amber-600">{vaccinations?.upcoming ?? 0}</p>
              <p className="text-sm text-stone-600 mt-1">قادمة (30 يوم)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

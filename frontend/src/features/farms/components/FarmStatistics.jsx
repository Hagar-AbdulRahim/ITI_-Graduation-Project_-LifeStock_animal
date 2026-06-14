import { PawPrint, HeartPulse, Stethoscope, Loader2 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, colorClass, bgClass }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
);

// farmStats shape from backend: { farm, stats: { total_animals, by_species, by_health_status } }
// by_species = [{ _id: 'cattle'|'sheep'|'goat', count }]
// by_health_status = [{ _id: 'healthy'|'sick'|'critical'|'deceased', count }]

const FarmStatistics = ({ farm, farmStats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = farmStats?.stats;

  const totalAnimals = stats?.total_animals ?? farm?.total_animals ?? 0;

  const getHealthCount = (statuses) => {
    if (!stats?.by_health_status) return 0;
    return stats.by_health_status
      .filter(s => statuses.includes(s._id))
      .reduce((sum, s) => sum + s.count, 0);
  };

  const getSpeciesCount = (species) => {
    if (!stats?.by_species) return 0;
    const found = stats.by_species.find(s => s._id === species);
    return found?.count ?? 0;
  };

  const healthyCount = getHealthCount(['healthy']);
  const sickCount = getHealthCount(['sick', 'critical']);
  const cattleCount = getSpeciesCount('cattle');
  const sheepCount = getSpeciesCount('sheep');
  const goatCount = getSpeciesCount('goat');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        icon={PawPrint}
        label="إجمالي الحيوانات"
        value={totalAnimals}
        colorClass="text-indigo-600"
        bgClass="bg-indigo-50"
      />
      <StatCard
        icon={HeartPulse}
        label="حيوانات سليمة"
        value={healthyCount}
        colorClass="text-green-600"
        bgClass="bg-green-50"
      />
      <StatCard
        icon={Stethoscope}
        label="حالات مريضة"
        value={sickCount}
        colorClass="text-red-600"
        bgClass="bg-red-50"
      />
      <StatCard
        icon={() => <span className="text-2xl">🐄</span>}
        label="أبقار"
        value={cattleCount}
        colorClass="text-amber-600"
        bgClass="bg-amber-50"
      />
      <StatCard
        icon={() => <span className="text-2xl">🐑</span>}
        label="أغنام وماعز"
        value={sheepCount + goatCount}
        colorClass="text-teal-600"
        bgClass="bg-teal-50"
      />
    </div>
  );
};

export default FarmStatistics;

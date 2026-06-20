import React from 'react';
import { History, Plus, Syringe, Stethoscope } from 'lucide-react';

const ActivityTimeline = ({ farm, animals, vaccinations }) => {
  // Generate activities from animals dynamically to avoid fake data
  const activities = React.useMemo(() => {
    let acts = [];
    if (animals && animals.length > 0) {
      animals.forEach(a => {
        if (a.createdAt || a.created_at || a.birth_date) {
          acts.push({
            _id: `animal_${a._id}`,
            type: 'animal_added',
            message: `تم إضافة الحيوان "${a.name || a.tag_number}"`,
            date: a.createdAt || a.created_at || a.birth_date
          });
        }
      });
    }

    if (vaccinations && vaccinations.length > 0) {
      vaccinations.forEach(v => {
        if (v.date) {
          acts.push({
            _id: `vax_${v._id}`,
            type: 'vaccination_added',
            message: `تم تسجيل تطعيم "${v.name}"`,
            date: v.date
          });
        }
      });
    }

    return acts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [animals, vaccinations]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'animal_added':
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Plus className="w-4 h-4" /></div>;
      case 'vaccination_added':
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Syringe className="w-4 h-4" /></div>;
      case 'diagnosis_created':
        return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"><Stethoscope className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><History className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <History className="w-5 h-5 text-gray-600" />
          </div>
          النشاط الأخير
        </h3>
      </div>

      <div className="relative">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">لا يوجد نشاط مسجل مؤخراً</div>
        ) : (
          <>
            <div className="absolute top-0 bottom-0 right-4 w-px bg-gray-200"></div>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity._id} className="relative flex items-start gap-4">
                  <div className="relative z-10 bg-white pt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.date ? new Date(activity.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;

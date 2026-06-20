import React from 'react';
import { AlertTriangle, Info, AlertCircle, Loader2 } from 'lucide-react';

const AIAlerts = ({ alerts, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-48 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const getAlertStyle = (type) => {
    switch (type) {
      case 'warning':
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-100',
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          textColor: 'text-red-900',
          dateColor: 'text-red-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          textColor: 'text-blue-900',
          dateColor: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-100',
          icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
          textColor: 'text-gray-900',
          dateColor: 'text-gray-500'
        };
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          تنبيهات الذكاء الاصطناعي
        </h3>
      </div>

      <div className="space-y-4">
        {(!alerts || alerts.length === 0) ? (
          <div className="text-center py-6 text-sm text-gray-500">
            لا توجد تنبيهات حالياً
          </div>
        ) : (
          alerts.map(alert => {
            const style = getAlertStyle(alert.type);
            return (
              <div key={alert._id} className={`p-4 rounded-xl border ${style.bg} ${style.border} flex items-start gap-3`}>
                <div className="mt-0.5">{style.icon}</div>
                <div>
                  <p className={`text-sm font-medium ${style.textColor} leading-relaxed`}>{alert.message}</p>
                  <p className={`text-xs mt-2 ${style.dateColor}`}>{alert.date ? new Date(alert.date).toLocaleDateString('ar-EG') : '—'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AIAlerts;

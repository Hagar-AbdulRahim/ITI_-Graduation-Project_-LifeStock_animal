import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRight, HeartPulse, Loader2, Calendar, AlertCircle, Eye,
  Activity, HelpCircle, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { fetchAnimalById } from '../../redux/animalSlice';
import healthCaseService from '../../services/healthCaseService';

const AnimalHealthCasesPage = () => {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animal } = useSelector((state) => state.animal);

  // Cases state
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (animalId) {
      dispatch(fetchAnimalById(animalId));
      fetchCases();
    }
  }, [dispatch, animalId]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthCaseService.getAnimalHealthCases(animalId);
      if (response && response.success && Array.isArray(response.data)) {
        // Sort cases by newest first
        const sorted = [...response.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setCases(sorted);
      } else {
        setCases([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load medical history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSeverityBadge = (severity) => {
    const s = String(severity || '').toLowerCase();
    switch (s) {
      case 'red':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            Critical
          </span>
        );
      case 'yellow':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            Warning
          </span>
        );
      case 'green':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            Stable
          </span>
        );
    }
  };

  const getSeverityCardBorder = (severity) => {
    const s = String(severity || '').toLowerCase();
    switch (s) {
      case 'red': return 'border-l-4 border-l-red-500';
      case 'yellow': return 'border-l-4 border-l-amber-500';
      case 'green':
      default:
        return 'border-l-4 border-l-emerald-500';
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cases.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-cairo" dir="ltr">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900">Medical History</h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Animal: #{animal?.tag_number || '...'} ({animal?.species || '...'})
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          /* Skeletons */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="h-4 bg-slate-200 rounded w-32" />
                    <div className="h-4 bg-slate-100 rounded w-16" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-24" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-semibold text-slate-600">No medical history found</p>
            <p className="text-xs text-slate-400 mt-1">There are no health records registered for this animal yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {currentItems.map((item) => (
                <div 
                  key={item._id} 
                  className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${getSeverityCardBorder(item.severity)}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-slate-500" />
                        {item.ai_diagnosis || 'General Checkup'}
                      </h3>
                      {getSeverityBadge(item.severity)}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Input Method</span>
                          <span className="text-xs font-semibold text-slate-700 capitalize">{item.input_type || 'Text'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Vet Intervention</span>
                          <span className={`text-xs font-bold ${item.vet_required ? 'text-red-600' : 'text-slate-500'}`}>
                            {item.vet_required ? `Required (${item.vet_urgency || 'Urgent'})` : 'Not Required'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-end">
                      <button
                        onClick={() => navigate(`/health-cases/${item._id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages} (Total {cases.length} records)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimalHealthCasesPage;

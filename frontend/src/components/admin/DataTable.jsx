import Loader from '../common/Loader';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  pagination,
  onPageChange,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" color="#2a5c2a" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_4px_30px_-4px_rgba(27,77,44,0.13)]">
      <div className="overflow-x-auto admin-scrollbar">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="bg-gradient-to-l from-[#1b4d2c] via-[#1e5530] to-[#2a5c2a]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-4 text-right text-[11px] font-black uppercase tracking-widest text-white/90 whitespace-nowrap first:rounded-tr-xl last:rounded-tl-xl border-l border-white/10 last:border-l-0"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl">
                      📋
                    </div>
                    <p className="text-stone-400 text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="group hover:bg-gradient-to-l hover:from-[#f6fbf4]/80 hover:to-transparent transition-all duration-200 border-b border-stone-50 last:border-b-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-3.5 text-stone-700 group-hover:text-stone-900 transition-colors duration-200 ${col.className || 'whitespace-nowrap'}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100 bg-gradient-to-l from-stone-50/80 to-white">
          <span className="text-xs text-stone-400 font-medium">
            صفحة <span className="text-[#1b4d2c] font-black">{pagination.page}</span> من{' '}
            <span className="text-[#1b4d2c] font-black">{pagination.pages}</span>
            <span className="mx-2 text-stone-300">•</span>
            <span className="text-stone-500">{pagination.total} عنصر</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1b4d2c]/40 hover:text-[#1b4d2c] hover:bg-[#f6fbf4] transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              السابق
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => onPageChange?.(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all duration-200 ${
                      pageNum === pagination.page
                        ? 'bg-[#1b4d2c] text-white shadow-sm shadow-[#1b4d2c]/30'
                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1b4d2c]/40 hover:text-[#1b4d2c] hover:bg-[#f6fbf4] transition-all duration-200"
            >
              التالي
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

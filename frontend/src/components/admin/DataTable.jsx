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
      <div className="flex justify-center py-16">
        <Loader size="lg" color="#2d5a1b" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar pb-3">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="bg-[#f5f2eb] text-stone-600">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-right font-bold whitespace-nowrap border-l border-stone-200 last:border-l-0">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-stone-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row._id || row.id || idx} className="border-t border-stone-100 hover:bg-stone-50/50">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-stone-700 border-l border-stone-100 last:border-l-0 ${col.className || 'whitespace-nowrap'}`}>
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50/50">
          <span className="text-xs text-stone-500">
            صفحة {pagination.page} من {pagination.pages} — {pagination.total} عنصر
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-white"
            >
              السابق
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-white"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

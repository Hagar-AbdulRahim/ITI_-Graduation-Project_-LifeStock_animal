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
        <Loader size="lg" color="#2a5c2a" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto custom-scrollbar smooth-scroll">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="bg-gradient-to-l from-[#1b4d2c] to-[#2a5c2a] text-white">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3.5 text-right text-xs font-black uppercase tracking-wider whitespace-nowrap first:rounded-tr-xl last:rounded-tl-xl"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-stone-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="border-t border-stone-100 hover:bg-[#f6fbf4]/60 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-stone-700 ${col.className || 'whitespace-nowrap'}`}
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
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-stone-100 bg-stone-50/80">
          <span className="text-xs text-stone-500 font-medium">
            صفحة {pagination.page} من {pagination.pages} — {pagination.total} عنصر
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-stone-200 bg-white text-stone-600 disabled:opacity-40 hover:border-[#2a5c2a]/30 hover:text-[#2a5c2a] transition-all"
            >
              السابق
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-stone-200 bg-white text-stone-600 disabled:opacity-40 hover:border-[#2a5c2a]/30 hover:text-[#2a5c2a] transition-all"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

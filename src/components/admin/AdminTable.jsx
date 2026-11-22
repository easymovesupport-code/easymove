const AdminTable = ({
  columns = [],
  rows = [],
  loading = false,
  emptyText = "لا توجد نتائج",
  emptyIcon: EmptyIcon,
  rowKey = "id",
}) => {
  if (loading) {
    return (
      <p className='p-8 text-center text-slate-400 text-sm'>جاري التحميل...</p>
    );
  }

  if (!rows.length) {
    return (
      <div className='p-10 text-center text-slate-400 text-sm'>
        {EmptyIcon ? (
          <EmptyIcon className='mx-auto mb-2 opacity-40' size={28} />
        ) : null}
        {emptyText}
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='bg-slate-800 text-white text-xs'>
            {columns.map((col) => (
              <th key={col.key} className='text-right px-4 py-3.5 font-bold'>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-stone-100'>
          {rows.map((row) => (
            <tr key={row[rowKey]} className='hover:bg-stone-50/80'>
              {columns.map((col) => (
                <td key={col.key} className='px-4 py-3'>
                  {col.render ? col.render(row) : (row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;

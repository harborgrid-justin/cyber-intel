import React from 'react';

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  renderMobileCard: (item: T) => React.ReactNode;
}

function ResponsiveTable<T>({ data, columns, keyExtractor, renderMobileCard }: ResponsiveTableProps<T>) {
  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-slate-900 border border-slate-800 rounded-sm">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-xs uppercase font-medium text-slate-500 border-b border-slate-800">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-3 tracking-wider ${col.className || ''}`}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-800/50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className="px-6 py-3">{col.render(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div key={keyExtractor(item)} className="bg-slate-900 border border-slate-800 p-4 rounded-lg shadow-sm">
            {renderMobileCard(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResponsiveTable;
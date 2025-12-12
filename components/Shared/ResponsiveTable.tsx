
import React, { useState, useEffect } from 'react';
import { ContextMenu } from './ContextMenu';
import { Icons } from './Icons';

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

// Hook to track window size for conditional rendering
const useIsMobile = () => {
    // Principle 35: Deterministic First Render (Default to desktop/false)
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Handle hydration/resize
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        
        // Set initial value
        handleResize();

        let timeout: any;
        const debouncedHandler = () => {
            clearTimeout(timeout);
            timeout = setTimeout(handleResize, 100);
        };
        window.addEventListener('resize', debouncedHandler);
        return () => window.removeEventListener('resize', debouncedHandler);
    }, []);
    return isMobile;
};

const TableRow = React.memo(({ item, columns, onContextMenu }: { item: any, columns: Column<any>[], onContextMenu: (e: React.MouseEvent, item: any) => void }) => (
  <tr 
    className="hover:bg-slate-800/50 transition-colors cursor-context-menu"
    onContextMenu={(e) => onContextMenu(e, item)}
  >
    {columns.map((col, i) => (
      <td key={i} className="px-6 py-3">{col.render(item)}</td>
    ))}
  </tr>
));

const MobileCard = React.memo(({ item, renderContent }: { item: any, renderContent: (i: any) => React.ReactNode }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg shadow-sm">
    {renderContent(item)}
  </div>
));

function ResponsiveTable<T extends { id: string }>({ data, columns, keyExtractor, renderMobileCard }: ResponsiveTableProps<T>) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: T } | null>(null);
  const isMobile = useIsMobile();

  const handleContextMenu = (e: React.MouseEvent, item: T) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, item });
  };

  const menuItems = contextMenu ? [
    { label: 'Copy ID', icon: <Icons.Code className="w-3 h-3"/>, action: () => { navigator.clipboard.writeText(contextMenu.item.id); window.dispatchEvent(new CustomEvent('notification', { detail: { title: 'Copied', message: `ID ${contextMenu.item.id} copied to clipboard`, type: 'success' } })); } },
    { label: 'Flag as High Priority', icon: <Icons.AlertTriangle className="w-3 h-3"/>, action: () => window.dispatchEvent(new CustomEvent('notification', { detail: { title: 'Flagged', message: 'Item marked for urgent review', type: 'warning' } })) },
    { label: 'Delete Record', icon: <Icons.UserX className="w-3 h-3"/>, action: () => alert("Delete not implemented in demo context"), danger: true },
  ] : [];

  return (
    <div className="w-full h-full flex flex-col">
      {!isMobile ? (
        <div className="overflow-auto custom-scrollbar bg-slate-900 border border-slate-800 rounded-sm flex-1">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-xs uppercase font-medium text-slate-500 border-b border-slate-800 sticky top-0 z-10">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={`px-6 py-3 tracking-wider bg-slate-950 ${col.className || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.map((item) => (
                <TableRow 
                  key={keyExtractor(item)} 
                  item={item} 
                  columns={columns} 
                  onContextMenu={handleContextMenu}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto">
          {data.map((item) => (
            <MobileCard 
              key={keyExtractor(item)} 
              item={item} 
              renderContent={renderMobileCard} 
            />
          ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            items={menuItems} 
            onClose={() => setContextMenu(null)} 
        />
      )}
    </div>
  );
}

export default React.memo(ResponsiveTable) as typeof ResponsiveTable;

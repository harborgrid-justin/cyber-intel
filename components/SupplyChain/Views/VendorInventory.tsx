
import React from 'react';
import { Vendor } from '../../../types';
import { CardHeader, Badge } from '../../Shared/UI';
import { VirtualList } from '../../Shared/VirtualList';
import { Icons } from '../../Shared/Icons';

interface Props {
  vendors: Vendor[];
  onSelect: (id: string) => void;
}

export const VendorInventory: React.FC<Props> = ({ vendors, onSelect }) => {
  const renderRow = (v: Vendor) => (
    <div key={v.id} className="flex justify-between items-center p-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => onSelect(v.id)}>
        <div className="flex items-center gap-3 w-1/3">
            <span className="font-bold text-white">{v.name}</span>
            <span className="text-xs text-slate-500">{v.product}</span>
        </div>
        <div className="w-1/4"><Badge color="slate">{v.category}</Badge></div>
        <div className="w-1/4 text-xs text-slate-300 flex items-center gap-2"><Icons.Globe className="w-3 h-3 text-slate-500" />{v.hqLocation}</div>
        <div className="w-1/6 text-right"><span className={`font-mono font-bold ${v.riskScore > 80 ? 'text-red-500' : 'text-green-500'}`}>{v.riskScore}</span></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <CardHeader title="Third-Party Inventory" action={<Badge>{vendors.length} Vendors</Badge>} />
        <div className="flex-1 min-h-0">
            <VirtualList items={vendors} rowHeight={50} containerHeight={600} renderRow={renderRow} />
        </div>
    </div>
  );
};

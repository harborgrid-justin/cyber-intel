
import React from 'react';
import { Vendor } from '../../../types';
import { CardHeader, Badge } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { Icons } from '../../Shared/Icons';

interface Props {
  vendors: Vendor[];
  onSelect: (id: string) => void;
}

export const VendorInventory: React.FC<Props> = ({ vendors, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <CardHeader title="Third-Party Inventory" action={<Badge>{vendors.length} Vendors</Badge>} />
        <ResponsiveTable<Vendor> 
            data={vendors} 
            keyExtractor={v => v.id}
            columns={[
                { header: 'Vendor Name', render: v => <span className="font-bold text-white cursor-pointer hover:text-cyan-400" onClick={() => onSelect(v.id)}>{v.name}</span> },
                { header: 'Product', render: v => <span className="text-slate-400 text-xs">{v.product}</span> },
                { header: 'Category', render: v => <Badge color="slate">{v.category}</Badge> },
                { header: 'Tier', render: v => <Badge color={v.tier === 'Strategic' ? 'purple' : v.tier === 'Tactical' ? 'blue' : 'slate'}>{v.tier}</Badge> },
                { header: 'Headquarters', render: v => <span className="text-xs text-slate-300 flex items-center gap-2"><Icons.Globe className="w-3 h-3 text-slate-500" />{v.hqLocation}</span> },
                { header: 'Risk Score', render: v => <span className={`font-mono font-bold ${v.riskScore > 80 ? 'text-red-500' : v.riskScore > 50 ? 'text-orange-500' : 'text-green-500'}`}>{v.riskScore}</span> }
            ]}
            renderMobileCard={v => (
                <div onClick={() => onSelect(v.id)} className="flex justify-between items-center">
                    <div><div className="font-bold text-white">{v.name}</div><div className="text-xs text-slate-500">{v.product}</div></div>
                    <Badge color={v.riskScore > 80 ? 'red' : 'green'}>{v.riskScore}</Badge>
                </div>
            )}
        />
    </div>
  );
};

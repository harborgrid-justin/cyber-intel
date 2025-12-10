
import React from 'react';
import { Card, Button, Badge, CardHeader } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { NormalizationRule } from '../../types';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

// Mock ECS Schema Definition for Validation
const ECS_SCHEMA: Record<string, 'String' | 'IP' | 'Long' | 'Geo' | 'Object'> = {
  'client.ip': 'IP',
  'source.ip': 'IP',
  'destination.ip': 'IP',
  'http.request.method': 'String',
  'event.duration': 'Long',
  'user_agent.original': 'String',
  'host.name': 'String',
  'geo.location': 'Geo'
};

const NormalizationView: React.FC = () => {
  const mappings = useDataStore(() => threatData.getNormalizationRules());

  const getStatusColor = (status: NormalizationRule['validation']) => {
    switch (status) {
      case 'VALID': return 'green';
      case 'TYPE_MISMATCH': return 'orange';
      case 'MISSING_FIELD': return 'red';
      default: return 'slate';
    }
  };

  const getFieldType = (field: string) => ECS_SCHEMA[field] || 'Unknown';

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <CardHeader 
          title={<span className="flex items-center gap-2"><span className="text-cyan-500">ECS</span> Schema Mapper</span>} 
          action={
            <div className="flex gap-2">
              <Button variant="secondary" className="text-[10px]">AUTO-MAP</Button>
              <Button className="text-[10px]">VALIDATE ALL</Button>
            </div>
          }
        />
        <div className="p-4 text-xs text-slate-500 bg-slate-900/50">
          Normalize disparate field names to the Elastic Common Schema.
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mappings.map(rule => (
          <Card key={rule.id} className="p-4 relative overflow-hidden group hover:border-cyan-500 transition-colors">
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${rule.validation === 'VALID' ? 'bg-green-500' : rule.validation === 'TYPE_MISMATCH' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
            
            <div className="pl-2 flex flex-col gap-3">
              {/* Responsive Flow Visual */}
              <div className="flex flex-col gap-2">
                
                {/* Source */}
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                   <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Source</span>
                      <span className="text-xs font-mono text-slate-300 truncate" title={rule.sourceField}>{rule.sourceField}</span>
                   </div>
                   <Badge color="slate">Raw</Badge>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center items-center -my-1 z-10">
                   <div className="bg-slate-900 rounded-full p-1 border border-slate-700 text-slate-500">
                      <Icons.Shuffle className="w-3 h-3 rotate-90" />
                   </div>
                </div>

                {/* Target */}
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center shadow-inner">
                   <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-cyan-600 uppercase font-bold">Target (ECS)</span>
                      <span className="text-xs font-mono text-cyan-400 truncate" title={rule.targetField}>{rule.targetField}</span>
                   </div>
                   <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {getFieldType(rule.targetField)}
                   </span>
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-1">
                <div className="text-[9px] text-slate-400 flex items-center gap-1">
                  <span className="uppercase font-bold text-slate-500">Fn:</span> 
                  <span className="font-mono bg-slate-800 px-1 rounded">{rule.transform}</span>
                </div>
                <Badge color={getStatusColor(rule.validation)}>{rule.validation.replace('_', ' ')}</Badge>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Add New Card */}
        <div className="border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center p-8 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900/30 transition-all text-slate-600 hover:text-cyan-500 min-h-[180px]">
           <div className="flex flex-col items-center gap-2">
             <div className="text-2xl font-bold">+</div>
             <div className="text-xs font-bold uppercase tracking-widest">Map Field</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NormalizationView;

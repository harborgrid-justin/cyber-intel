import React from 'react';
import { Card, Button, Badge, Grid } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { MitreItem } from '../../../types';

interface ViewProps {
  data: MitreItem[];
  onView: (id: string, type: string) => void;
  onLink?: (url?: string) => void;
}

export const TacticsGrid: React.FC<ViewProps> = ({ data, onView }) => (
  <Grid cols={2}>
    {data.map(t => (
        <Card key={t.id} className="p-4 border-l-4 border-l-cyan-500 flex flex-col justify-between hover:bg-slate-900/80 transition-colors">
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="font-bold text-white text-lg">{t.name}</h3>
              <span className="font-mono text-xs text-cyan-500 bg-cyan-900/20 px-2 py-1 rounded">{t.id}</span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-3">{t.description}</p>
          </div>
          <div className="mt-4">
            <Button onClick={() => onView(t.id, 'Tactic')} variant="secondary" className="w-full text-xs">VIEW TECHNIQUES</Button>
          </div>
        </Card>
    ))}
  </Grid>
);

export const TechniquesGrid: React.FC<ViewProps> = ({ data, onView, onLink }) => (
  <Grid cols={3}>
    {data.map(t => (
      <Card key={t.id} className="p-4 hover:border-cyan-500 transition-colors cursor-pointer group flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold font-mono text-cyan-500 group-hover:text-cyan-300">{t.id}</span>
            <Badge color="slate">{t.tactic}</Badge>
          </div>
          <h3 className="text-white font-bold mb-2 text-lg leading-tight">{t.name}</h3>
          <p className="text-xs text-slate-400 leading-relaxed flex-1 line-clamp-4">{t.description}</p>
          <div className="mt-4 flex gap-2 pt-2 border-t border-slate-800">
            <Button onClick={() => onView(t.id, 'Technique')} variant="text" className="flex-1 text-xs">DETAILS</Button>
            {onLink && <Button onClick={() => onLink(t.url)} variant="outline" className="flex-1 text-xs">MITRE DB ↗</Button>}
          </div>
      </Card>
    ))}
  </Grid>
);

export const SoftwareGrid: React.FC<ViewProps> = ({ data, onView }) => (
  <Grid cols={3}>
    {data.map(s => (
        <Card key={s.id} className="p-4 border-l-4 border-l-purple-500 flex flex-col justify-between group hover:bg-slate-900/80 cursor-pointer">
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="font-bold text-white group-hover:text-purple-400">{s.name}</h3>
              <Badge color="purple">{s.type}</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-2 line-clamp-3">{s.description}</p>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-950 p-1 rounded inline-block">{s.id}</div>
          </div>
          <Button onClick={() => onView(s.id, 'Software')} className="mt-3 w-full" variant="secondary">ANALYSIS REPORT</Button>
        </Card>
    ))}
  </Grid>
);

export const MitigationsGrid: React.FC<ViewProps> = ({ data, onView }) => (
  <Grid cols={2}>
    {data.map(m => (
        <Card key={m.id} className="p-4 flex gap-4 items-start hover:border-green-500/50 transition-colors">
            <div className="bg-green-900/20 text-green-500 p-2 rounded text-xs font-bold font-mono h-fit shrink-0">{m.id}</div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm mb-1">{m.name}</h4>
              <p className="text-sm text-slate-400 mb-3">{m.description}</p>
              <Button onClick={() => onView(m.id, 'Mitigation')} variant="outline" className="text-[10px] py-1">IMPLEMENTATION GUIDE</Button>
            </div>
        </Card>
    ))}
  </Grid>
);

export const AptTable: React.FC<ViewProps> = ({ data, onView }) => (
  <Card className="p-0 overflow-hidden">
    <ResponsiveTable<MitreItem> data={data} keyExtractor={g => g.id}
        columns={[
          { header: 'ID', render: g => <span className="font-mono text-cyan-500">{g.id}</span> }, 
          { header: 'Name', render: g => <span className="text-white font-bold">{g.name}</span> }, 
          { header: 'Aliases', render: g => <div className="flex gap-1 flex-wrap">{g.aliases?.map(a => <Badge key={a} color="slate">{a}</Badge>)}</div> }, 
          { header: 'Description', render: g => <span className="text-xs text-slate-400 line-clamp-2">{g.description}</span> }, 
          { header: 'Profile', render: g => <Button onClick={() => onView(g.id, 'Group')} variant="outline" className="text-[10px]">OPEN PROFILE</Button> }
        ]}
        renderMobileCard={g => <div>{g.name}</div>}
    />
  </Card>
);

export const SubTechTable: React.FC<ViewProps> = ({ data, onView }) => (
  <Card className="p-0 overflow-hidden">
    <ResponsiveTable<MitreItem> data={data} keyExtractor={s => s.id}
      columns={[
        { header: 'ID', render: s => <span className="text-cyan-400 font-mono font-bold">{s.id}</span> }, 
        { header: 'Name', render: s => <span className="text-white font-bold">{s.name}</span> }, 
        { header: 'Parent', render: s => <Badge color="slate">{s.parent}</Badge> }, 
        { header: 'Description', render: s => <span className="text-slate-400 text-xs line-clamp-1">{s.description}</span> }, 
        { header: 'Action', render: s => <Button onClick={() => onView(s.id, 'Sub')} variant="text" className="text-xs">VIEW</Button> }
      ]}
      renderMobileCard={s => <div>{s.name}</div>}
    />
  </Card>
);
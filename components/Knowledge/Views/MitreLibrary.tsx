
import React from 'react';
import { Card, Button, Badge, Grid, CardHeader } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { MitreItem } from '../../../types';
import { Icons } from '../../Shared/Icons';

interface ViewProps {
  data: MitreItem[];
  onView: (id: string, type: string) => void;
  onLink?: (url?: string) => void;
}

export const TacticsGrid: React.FC<ViewProps> = ({ data, onView }) => (
  <Grid cols={2}>
    {data.map(t => (
        <Card key={t.id} className="p-0 overflow-hidden border-l-4 border-l-cyan-500 flex flex-col justify-between hover:bg-slate-900/80 transition-colors group">
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-white text-2xl tracking-tight group-hover:text-cyan-400">{t.name}</h3>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-500 group-hover:text-cyan-500 group-hover:border-cyan-900">
                <Icons.Shield className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{t.description}</p>
          </div>
          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
            <span className="font-mono text-xs text-cyan-500 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-900/50">{t.id}</span>
            <Button onClick={() => onView(t.id, 'Tactic')} variant="secondary" className="text-xs">VIEW TECHNIQUES</Button>
          </div>
        </Card>
    ))}
  </Grid>
);

export const TechniquesGrid: React.FC<ViewProps> = ({ data, onView, onLink }) => (
  <Grid cols={3}>
    {data.map(t => (
      <Card key={t.id} className="p-4 hover:border-cyan-500 transition-colors cursor-pointer group flex flex-col h-full bg-slate-900/50">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold font-mono text-cyan-500 group-hover:text-cyan-300">{t.id}</span>
            <Badge color="blue">{t.tactic}</Badge>
          </div>
          <h3 className="text-white font-bold mb-2 text-base leading-tight">{t.name}</h3>
          <p className="text-xs text-slate-400 leading-relaxed flex-1 line-clamp-4">{t.description}</p>
          <div className="mt-4 flex gap-2 pt-3 border-t border-slate-800">
            <Button onClick={() => onView(t.id, 'Technique')} variant="secondary" className="flex-1 text-[10px] py-1 h-7">DETAILS</Button>
            {onLink && <Button onClick={() => onLink(t.url)} variant="outline" className="flex-1 text-[10px] py-1 h-7">MITRE DB ↗</Button>}
          </div>
      </Card>
    ))}
  </Grid>
);

export const SoftwareGrid: React.FC<ViewProps> = ({ data, onView }) => (
  <Grid cols={3}>
    {data.map(s => (
        <Card key={s.id} className="p-4 border-l-4 border-l-purple-500 flex flex-col justify-between group hover:bg-slate-900/80 cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-white group-hover:text-purple-400">{s.name}</h3>
              <Icons.Tool className="w-4 h-4 text-purple-400/50" />
            </div>
            <Badge color="purple">{s.type}</Badge>
            <p className="text-xs text-slate-400 my-3 line-clamp-3">{s.description}</p>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">{s.id}</div>
            <Button onClick={() => onView(s.id, 'Software')} variant="text" className="text-xs text-purple-400/80 group-hover:text-purple-400">REPORT →</Button>
          </div>
        </Card>
    ))}
  </Grid>
);

export const MitigationsGrid: React.FC<ViewProps> = ({ data, onView }) => (
  <Grid cols={2}>
    {data.map(m => (
        <Card key={m.id} className="p-4 flex gap-4 items-start hover:border-green-500/50 transition-colors bg-slate-900/50 group">
            <div className="bg-green-900/20 text-green-500 p-2 rounded-lg h-fit shrink-0 border border-green-900/50">
              <Icons.CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm mb-1 group-hover:text-green-400">{m.name}</h4>
              <p className="text-sm text-slate-400 mb-3">{m.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-slate-500">{m.id}</span>
                <Button onClick={() => onView(m.id, 'Mitigation')} variant="outline" className="text-[10px] py-1 h-7 border-slate-700 group-hover:border-green-800">IMPLEMENTATION</Button>
              </div>
            </div>
        </Card>
    ))}
  </Grid>
);

export const AptTable: React.FC<ViewProps> = ({ data, onView }) => (
  <Card className="p-0 overflow-hidden h-full flex flex-col">
    <CardHeader title="Adversary Groups" action={<Badge>{data.length}</Badge>} />
    <div className="flex-1 overflow-y-auto">
      <ResponsiveTable<MitreItem> data={data} keyExtractor={g => g.id}
          columns={[
            { header: 'ID', render: g => <span className="font-mono text-cyan-500">{g.id}</span> }, 
            { header: 'Name', render: g => <span className="text-white font-bold">{g.name}</span> }, 
            { header: 'Aliases', render: g => <div className="flex gap-1 flex-wrap max-w-xs">{g.aliases?.map(a => <Badge key={a} color="slate">{a}</Badge>)}</div> }, 
            { header: 'Description', render: g => <span className="text-xs text-slate-400 line-clamp-2">{g.description}</span> }, 
            { header: 'Profile', render: g => <Button onClick={() => onView(g.id, 'Group')} variant="secondary" className="text-[10px] py-1 h-7">PROFILE</Button> }
          ]}
          renderMobileCard={g => <div>{g.name}</div>}
      />
    </div>
  </Card>
);

export const SubTechTable: React.FC<ViewProps> = ({ data, onView }) => (
  <Card className="p-0 overflow-hidden h-full flex flex-col">
    <CardHeader title="Sub-Techniques" action={<Badge>{data.length}</Badge>} />
    <div className="flex-1 overflow-y-auto">
      <ResponsiveTable<MitreItem> data={data} keyExtractor={s => s.id}
        columns={[
          { header: 'ID', render: s => <span className="text-cyan-400 font-mono font-bold">{s.id}</span> }, 
          { header: 'Name', render: s => <span className="text-white font-bold">{s.name}</span> }, 
          { header: 'Parent', render: s => <Badge color="slate" className="cursor-pointer" onClick={() => onView(s.parent || '', 'Technique')}>{s.parent}</Badge> }, 
          { header: 'Description', render: s => <span className="text-slate-400 text-xs line-clamp-1">{s.description}</span> }, 
          { header: 'Action', render: s => <Button onClick={() => onView(s.id, 'Sub')} variant="text" className="text-xs">VIEW</Button> }
        ]}
        renderMobileCard={s => <div>{s.name}</div>}
      />
    </div>
  </Card>
);

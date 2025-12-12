
import React, { useState, useMemo } from 'react';
import { Playbook, Case } from '../../../types';
import { Card, Badge, Grid, CardHeader, Button } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { threatData } from '../../../services/dataLayer';

interface IncidentPlaybooksProps {
  cases: Case[];
  onApplyPlaybook?: (caseId: string, playbookId: string) => void;
}

export const IncidentPlaybooks: React.FC<IncidentPlaybooksProps> = React.memo(({ cases, onApplyPlaybook }) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  const playbooks = useMemo(() => {
    const pbs = threatData.getPlaybooks();
    return filterRisk === 'ALL'
      ? pbs
      : pbs.filter(pb => pb.riskLevel === filterRisk);
  }, [filterRisk]);

  const playbookStats = useMemo(() => {
    const total = playbooks.length;
    const totalUsage = playbooks.reduce((sum, pb) => sum + (pb.usageCount || 0), 0);
    const totalSkipped = playbooks.reduce((sum, pb) => sum + (pb.skipCount || 0), 0);
    const avgEffectiveness = totalUsage > 0
      ? Math.round((totalUsage / (totalUsage + totalSkipped)) * 100)
      : 0;

    return {
      total,
      totalUsage,
      avgEffectiveness,
      highRisk: playbooks.filter(pb => pb.riskLevel === 'HIGH').length
    };
  }, [playbooks]);

  const getRiskColor = (risk: Playbook['riskLevel']) => {
    switch (risk) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'slate';
    }
  };

  const handleApply = () => {
    if (selectedCase && selectedPlaybook && onApplyPlaybook) {
      onApplyPlaybook(selectedCase, selectedPlaybook.id);
      setSelectedPlaybook(null);
      setSelectedCase(null);
    }
  };

  const activeCases = useMemo(() => cases.filter(c => c.status !== 'CLOSED'), [cases]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <Grid cols={4}>
        <Card className="p-4 text-center border-t-2 border-t-blue-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Playbooks</div>
          <div className="text-2xl font-bold text-white font-mono">{playbookStats.total}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-green-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Executions</div>
          <div className="text-2xl font-bold text-green-500 font-mono">{playbookStats.totalUsage}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-cyan-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Effectiveness</div>
          <div className="text-2xl font-bold text-cyan-500 font-mono">{playbookStats.avgEffectiveness}%</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-red-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">High Risk</div>
          <div className="text-2xl font-bold text-red-500 font-mono">{playbookStats.highRisk}</div>
        </Card>
      </Grid>

      {/* Risk Level Filter */}
      <div className="flex gap-2">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(risk => (
          <button
            key={risk}
            onClick={() => setFilterRisk(risk as any)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filterRisk === risk
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {risk}
          </button>
        ))}
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playbooks.map(playbook => (
          <Card
            key={playbook.id}
            className="p-4 hover:border-blue-500 transition-colors cursor-pointer group"
            onClick={() => setSelectedPlaybook(playbook)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                  {playbook.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {playbook.description}
                </p>
              </div>
              <Badge color={getRiskColor(playbook.riskLevel)} className="text-[10px] ml-2">
                {playbook.riskLevel}
              </Badge>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Tasks</span>
                <span className="font-bold text-cyan-400">{playbook.tasks.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Usage</span>
                <span className="font-bold text-green-400">{playbook.usageCount || 0}</span>
              </div>
              {playbook.skipCount !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Skipped</span>
                  <span className="font-bold text-yellow-400">{playbook.skipCount}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Trigger: {playbook.triggerLabel}</span>
                {playbook.status && (
                  <Badge className="text-[10px]">{playbook.status}</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {playbooks.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-slate-500 mb-2">No playbooks found</div>
          <p className="text-xs text-slate-600">Try adjusting your filters</p>
        </Card>
      )}

      {/* Playbook Detail Modal */}
      {selectedPlaybook && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlaybook(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{selectedPlaybook.name}</h2>
                  <p className="text-sm text-slate-400 mb-3">{selectedPlaybook.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge color={getRiskColor(selectedPlaybook.riskLevel)}>
                      {selectedPlaybook.riskLevel} RISK
                    </Badge>
                    <Badge>{selectedPlaybook.tasks.length} Tasks</Badge>
                    <Badge color="green">Used {selectedPlaybook.usageCount || 0} times</Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlaybook(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <h3 className="text-sm font-bold text-white mb-3">Playbook Tasks</h3>
              <div className="space-y-2">
                {selectedPlaybook.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">{task}</p>
                    </div>
                  </div>
                ))}
              </div>

              {activeCases.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-white mb-3">Apply to Active Case</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {activeCases.map(caseItem => (
                      <button
                        key={caseItem.id}
                        onClick={() => setSelectedCase(caseItem.id)}
                        className={`w-full text-left bg-slate-800/30 border rounded-lg p-3 transition-all hover:border-blue-500 ${
                          selectedCase === caseItem.id ? 'border-blue-600 bg-blue-600/10' : 'border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-slate-400">{caseItem.id}</span>
                          <Badge color={caseItem.priority === 'CRITICAL' ? 'red' : 'blue'} className="text-[10px]">
                            {caseItem.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-200 line-clamp-1">{caseItem.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelectedPlaybook(null)}>
                Close
              </Button>
              {selectedCase && onApplyPlaybook && (
                <Button variant="primary" onClick={handleApply}>
                  Apply to Case
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default IncidentPlaybooks;


import React, { useState, useMemo } from 'react';
import { Artifact, Case, ChainEvent } from '../../../types';
import { Card, Badge, Grid, CardHeader, Button } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';

interface IncidentEvidenceProps {
  cases: Case[];
}

export const IncidentEvidence: React.FC<IncidentEvidenceProps> = React.memo(({ cases }) => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SECURE' | 'COMPROMISED' | 'ARCHIVED'>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Collect all artifacts from all cases
  const allArtifacts = useMemo(() => {
    const artifacts: (Artifact & { caseId: string; caseTitle: string })[] = [];
    cases.forEach(caseItem => {
      if (caseItem.artifacts) {
        caseItem.artifacts.forEach(artifact => {
          artifacts.push({
            ...artifact,
            caseId: caseItem.id,
            caseTitle: caseItem.title
          });
        });
      }
    });
    return artifacts;
  }, [cases]);

  const filteredArtifacts = useMemo(() => {
    return allArtifacts.filter(artifact => {
      const statusMatch = filterStatus === 'ALL' || artifact.status === filterStatus;
      const typeMatch = filterType === 'ALL' || artifact.type === filterType;
      return statusMatch && typeMatch;
    });
  }, [allArtifacts, filterStatus, filterType]);

  const artifactTypes = useMemo(() => {
    const types = new Set(allArtifacts.map(a => a.type));
    return ['ALL', ...Array.from(types)];
  }, [allArtifacts]);

  const evidenceStats = useMemo(() => ({
    total: allArtifacts.length,
    secure: allArtifacts.filter(a => a.status === 'SECURE').length,
    compromised: allArtifacts.filter(a => a.status === 'COMPROMISED').length,
    archived: allArtifacts.filter(a => a.status === 'ARCHIVED').length,
    totalSize: allArtifacts.reduce((sum, a) => {
      const sizeMatch = a.size.match(/(\d+\.?\d*)\s*([KMG]B)/);
      if (sizeMatch) {
        const value = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2];
        if (unit === 'GB') return sum + value * 1024;
        if (unit === 'MB') return sum + value;
        if (unit === 'KB') return sum + value / 1024;
      }
      return sum;
    }, 0)
  }), [allArtifacts]);

  const getArtifactIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'File': <Icons.FileText className="w-5 h-5" />,
      'Image': <Icons.Image className="w-5 h-5" />,
      'Log': <Icons.FileText className="w-5 h-5" />,
      'Memory Dump': <Icons.HardDrive className="w-5 h-5" />,
      'Network Capture': <Icons.Network className="w-5 h-5" />,
      'Disk Image': <Icons.HardDrive className="w-5 h-5" />,
      'Document': <Icons.FileText className="w-5 h-5" />,
      'Executable': <Icons.Code className="w-5 h-5" />
    };
    return icons[type] || <Icons.File className="w-5 h-5" />;
  };

  const getStatusColor = (status?: Artifact['status']) => {
    switch (status) {
      case 'SECURE': return 'green';
      case 'COMPROMISED': return 'red';
      case 'ARCHIVED': return 'gray';
      default: return 'blue';
    }
  };

  const verifyIntegrity = (artifact: Artifact) => {
    if (!artifact.hash || !artifact.originalHash) return null;
    return artifact.hash === artifact.originalHash;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <Grid cols={5}>
        <Card className="p-4 text-center border-t-2 border-t-blue-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Evidence</div>
          <div className="text-2xl font-bold text-white font-mono">{evidenceStats.total}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-green-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Secure</div>
          <div className="text-2xl font-bold text-green-500 font-mono">{evidenceStats.secure}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-red-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Compromised</div>
          <div className="text-2xl font-bold text-red-500 font-mono">{evidenceStats.compromised}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-gray-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Archived</div>
          <div className="text-2xl font-bold text-gray-500 font-mono">{evidenceStats.archived}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-cyan-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Size</div>
          <div className="text-2xl font-bold text-cyan-500 font-mono">{evidenceStats.totalSize.toFixed(1)} MB</div>
        </Card>
      </Grid>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <span className="text-xs text-slate-400 py-1">Status:</span>
          {['ALL', 'SECURE', 'COMPROMISED', 'ARCHIVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-400 py-1">Type:</span>
          {artifactTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtifacts.map((artifact, index) => {
          const integrity = verifyIntegrity(artifact);
          return (
            <Card
              key={`${artifact.id}-${index}`}
              className="p-4 hover:border-blue-500 transition-colors cursor-pointer group"
              onClick={() => setSelectedArtifact(artifact)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-slate-800 text-blue-400">
                  {getArtifactIcon(artifact.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {artifact.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[10px]">{artifact.type}</Badge>
                    {artifact.status && (
                      <Badge color={getStatusColor(artifact.status)} className="text-[10px]">
                        {artifact.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Size</span>
                  <span className="font-bold text-slate-300">{artifact.size}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Uploaded By</span>
                  <span className="font-bold text-blue-400">{artifact.uploadedBy}</span>
                </div>
                {integrity !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Integrity</span>
                    <span className={`font-bold ${integrity ? 'text-green-400' : 'text-red-400'}`}>
                      {integrity ? 'Verified' : 'Compromised'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icons.Calendar className="w-3 h-3" />
                    <span>{artifact.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.FolderOpen className="w-3 h-3" />
                    <span className="truncate">{artifact.caseTitle}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredArtifacts.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-slate-500 mb-2">No evidence found</div>
          <p className="text-xs text-slate-600">Try adjusting your filters</p>
        </Card>
      )}

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArtifact(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-slate-800 text-blue-400">
                    {getArtifactIcon(selectedArtifact.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedArtifact.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{selectedArtifact.type}</Badge>
                      {selectedArtifact.status && (
                        <Badge color={getStatusColor(selectedArtifact.status)}>
                          {selectedArtifact.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">File Size</div>
                  <div className="text-lg font-bold text-white">{selectedArtifact.size}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Uploaded By</div>
                  <div className="text-lg font-bold text-blue-400">{selectedArtifact.uploadedBy}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Upload Date</div>
                  <div className="text-sm text-slate-300">{selectedArtifact.uploadDate}</div>
                </div>

                {selectedArtifact.hash && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Hash (SHA-256)</div>
                    <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded break-all">
                      {selectedArtifact.hash}
                    </div>
                  </div>
                )}

                {selectedArtifact.originalHash && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Original Hash</div>
                    <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded break-all">
                      {selectedArtifact.originalHash}
                    </div>
                  </div>
                )}

                {verifyIntegrity(selectedArtifact) !== null && (
                  <div className={`p-3 rounded-lg border ${
                    verifyIntegrity(selectedArtifact)
                      ? 'bg-green-600/10 border-green-600/30'
                      : 'bg-red-600/10 border-red-600/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      {verifyIntegrity(selectedArtifact) ? (
                        <>
                          <Icons.CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-bold text-green-400">Integrity Verified</span>
                        </>
                      ) : (
                        <>
                          <Icons.AlertTriangle className="w-5 h-5 text-red-400" />
                          <span className="text-sm font-bold text-red-400">Integrity Compromised</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs text-slate-500 mb-1">Associated Case</div>
                  <div className="text-sm text-blue-400 font-mono">{selectedArtifact.caseId}</div>
                  <div className="text-sm text-slate-300 mt-1">{selectedArtifact.caseTitle}</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelectedArtifact(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => alert('Download functionality would be implemented here')}>
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default IncidentEvidence;

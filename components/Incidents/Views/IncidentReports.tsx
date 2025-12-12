
import React, { useState, useMemo } from 'react';
import { IncidentReport, Case } from '../../../types';
import { Card, Badge, Grid, CardHeader, Button } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { threatData } from '../../../services/dataLayer';

interface IncidentReportsProps {
  cases: Case[];
}

export const IncidentReports: React.FC<IncidentReportsProps> = React.memo(({ cases }) => {
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [filterType, setFilterType] = useState<IncidentReport['type'] | 'ALL'>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get all reports from threat data
  const allReports = useMemo(() => {
    const reports = threatData.getIncidentReports();
    return filterType === 'ALL'
      ? reports
      : reports.filter(r => r.type === filterType);
  }, [filterType]);

  const reportTypeColors: Record<IncidentReport['type'], string> = {
    'Executive': 'blue',
    'Technical': 'purple',
    'Forensic': 'red',
    'Compliance': 'yellow'
  };

  const reportTypeIcons: Record<IncidentReport['type'], React.ReactNode> = {
    'Executive': <Icons.FileText className="w-4 h-4" />,
    'Technical': <Icons.Code className="w-4 h-4" />,
    'Forensic': <Icons.Search className="w-4 h-4" />,
    'Compliance': <Icons.Shield className="w-4 h-4" />
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
    alert('Report generation initiated. This would normally trigger a background job.');
  };

  const getStatusColor = (status: IncidentReport['status']) => {
    switch (status) {
      case 'READY': return 'green';
      case 'DRAFT': return 'yellow';
      case 'ARCHIVED': return 'gray';
      default: return 'slate';
    }
  };

  const reportStats = useMemo(() => ({
    total: allReports.length,
    ready: allReports.filter(r => r.status === 'READY').length,
    draft: allReports.filter(r => r.status === 'DRAFT').length,
    archived: allReports.filter(r => r.status === 'ARCHIVED').length
  }), [allReports]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <Grid cols={4}>
        <Card className="p-4 text-center border-t-2 border-t-blue-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Reports</div>
          <div className="text-2xl font-bold text-white font-mono">{reportStats.total}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-green-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Ready</div>
          <div className="text-2xl font-bold text-green-500 font-mono">{reportStats.ready}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-yellow-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Draft</div>
          <div className="text-2xl font-bold text-yellow-500 font-mono">{reportStats.draft}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-gray-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Archived</div>
          <div className="text-2xl font-bold text-gray-500 font-mono">{reportStats.archived}</div>
        </Card>
      </Grid>

      {/* Filters and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['ALL', 'Executive', 'Technical', 'Forensic', 'Compliance'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
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
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="px-4 py-2 text-xs"
        >
          {isGenerating ? 'Generating...' : '+ Generate Report'}
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allReports.map(report => (
          <Card
            key={report.id}
            className="p-4 hover:border-blue-500 transition-colors cursor-pointer group"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${reportTypeColors[report.type]}-600/20 text-${reportTypeColors[report.type]}-400`}>
                  {reportTypeIcons[report.type]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {report.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color={reportTypeColors[report.type]} className="text-[10px]">
                      {report.type}
                    </Badge>
                    <Badge color={getStatusColor(report.status)} className="text-[10px]">
                      {report.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 line-clamp-2 mb-3">
              {report.content.substring(0, 150)}...
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Icons.User className="w-3 h-3" />
                <span>{report.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Calendar className="w-3 h-3" />
                <span>{report.date}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {allReports.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-slate-500 mb-2">No reports found</div>
          <p className="text-xs text-slate-600">Generate a new report to get started</p>
        </Card>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{selectedReport.title}</h2>
                  <div className="flex items-center gap-2">
                    <Badge color={reportTypeColors[selectedReport.type]}>
                      {selectedReport.type}
                    </Badge>
                    <Badge color={getStatusColor(selectedReport.status)}>
                      {selectedReport.status}
                    </Badge>
                    <span className="text-xs text-slate-500">by {selectedReport.author}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{selectedReport.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-slate-300">
                  {selectedReport.content}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => alert('Export functionality would be implemented here')}>
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default IncidentReports;

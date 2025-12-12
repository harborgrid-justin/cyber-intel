
import React, { useState } from 'react';
import { Badge } from '../Shared/UI';

interface ResponseAction {
  id: string;
  name: string;
  category: 'CONTAINMENT' | 'ERADICATION' | 'RECOVERY' | 'ANALYSIS' | 'NOTIFICATION';
  type: 'AUTOMATED' | 'MANUAL' | 'SEMI_AUTOMATED';
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedTime: string;
  prerequisites?: string[];
  usageCount: number;
  successRate: number;
}

interface ActionLibraryProps {
  onExecuteAction?: (actionId: string) => void;
  onViewDetails?: (actionId: string) => void;
}

const ActionLibrary: React.FC<ActionLibraryProps> = ({ onExecuteAction, onViewDetails }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const actions: ResponseAction[] = [
    {
      id: 'ACT-001',
      name: 'Isolate Network Endpoint',
      category: 'CONTAINMENT',
      type: 'AUTOMATED',
      description: 'Immediately isolate compromised endpoint from network',
      riskLevel: 'HIGH',
      estimatedTime: '30s',
      prerequisites: ['EDR Agent Running', 'Admin Access'],
      usageCount: 127,
      successRate: 98.5
    },
    {
      id: 'ACT-002',
      name: 'Block IP Address',
      category: 'CONTAINMENT',
      type: 'AUTOMATED',
      description: 'Add IP address to firewall block list',
      riskLevel: 'MEDIUM',
      estimatedTime: '15s',
      usageCount: 342,
      successRate: 99.1
    },
    {
      id: 'ACT-003',
      name: 'Collect Memory Dump',
      category: 'ANALYSIS',
      type: 'SEMI_AUTOMATED',
      description: 'Capture full memory dump for forensic analysis',
      riskLevel: 'LOW',
      estimatedTime: '5m',
      prerequisites: ['Forensic Tools', 'Sufficient Storage'],
      usageCount: 89,
      successRate: 95.2
    },
    {
      id: 'ACT-004',
      name: 'Disable User Account',
      category: 'CONTAINMENT',
      type: 'AUTOMATED',
      description: 'Immediately disable compromised user account',
      riskLevel: 'MEDIUM',
      estimatedTime: '10s',
      usageCount: 156,
      successRate: 99.8
    },
    {
      id: 'ACT-005',
      name: 'Terminate Malicious Process',
      category: 'ERADICATION',
      type: 'AUTOMATED',
      description: 'Kill identified malicious process',
      riskLevel: 'MEDIUM',
      estimatedTime: '5s',
      usageCount: 234,
      successRate: 97.4
    },
    {
      id: 'ACT-006',
      name: 'Restore from Backup',
      category: 'RECOVERY',
      type: 'MANUAL',
      description: 'Restore affected systems from clean backup',
      riskLevel: 'CRITICAL',
      estimatedTime: '30m',
      prerequisites: ['Verified Clean Backup', 'Downtime Window'],
      usageCount: 45,
      successRate: 92.3
    },
    {
      id: 'ACT-007',
      name: 'Send Security Alert',
      category: 'NOTIFICATION',
      type: 'AUTOMATED',
      description: 'Notify security team via multiple channels',
      riskLevel: 'LOW',
      estimatedTime: '5s',
      usageCount: 567,
      successRate: 99.9
    },
    {
      id: 'ACT-008',
      name: 'Run Antivirus Scan',
      category: 'ANALYSIS',
      type: 'AUTOMATED',
      description: 'Execute full antivirus scan on target system',
      riskLevel: 'LOW',
      estimatedTime: '15m',
      usageCount: 412,
      successRate: 96.8
    },
    {
      id: 'ACT-009',
      name: 'Capture Network Traffic',
      category: 'ANALYSIS',
      type: 'SEMI_AUTOMATED',
      description: 'Start PCAP capture for network analysis',
      riskLevel: 'LOW',
      estimatedTime: '1m',
      usageCount: 198,
      successRate: 98.2
    },
    {
      id: 'ACT-010',
      name: 'Force Password Reset',
      category: 'ERADICATION',
      type: 'AUTOMATED',
      description: 'Force password reset for affected accounts',
      riskLevel: 'MEDIUM',
      estimatedTime: '30s',
      usageCount: 278,
      successRate: 99.3
    }
  ];

  const categories = ['ALL', 'CONTAINMENT', 'ERADICATION', 'RECOVERY', 'ANALYSIS', 'NOTIFICATION'];

  const filteredActions = actions.filter(action => {
    const matchesCategory = selectedCategory === 'ALL' || action.category === selectedCategory;
    const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getActionIcon = (category: ResponseAction['category']) => {
    const icons = {
      CONTAINMENT: '🔒',
      ERADICATION: '🗑️',
      RECOVERY: '🔄',
      ANALYSIS: '🔍',
      NOTIFICATION: '📢'
    };
    return icons[category];
  };

  const getRiskColor = (risk: ResponseAction['riskLevel']) => {
    const colors = {
      LOW: 'green',
      MEDIUM: 'yellow',
      HIGH: 'orange',
      CRITICAL: 'red'
    };
    return colors[risk];
  };

  const getTypeColor = (type: ResponseAction['type']) => {
    const colors = {
      AUTOMATED: 'blue',
      SEMI_AUTOMATED: 'purple',
      MANUAL: 'slate'
    };
    return colors[type];
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Response Action Library</h3>
          <p className="text-xs text-slate-500">{actions.length} pre-defined response actions</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search actions..."
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredActions.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-sm text-slate-500">No actions found</p>
            <p className="text-xs text-slate-600 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredActions.map((action) => (
            <div
              key={action.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:border-blue-500 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getActionIcon(action.category)}</span>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">{action.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{action.id}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3">{action.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                <Badge color={getTypeColor(action.type)} className="text-[10px]">
                  {action.type.replace('_', ' ')}
                </Badge>
                <Badge color={getRiskColor(action.riskLevel)} className="text-[10px]">
                  {action.riskLevel} RISK
                </Badge>
                <Badge className="text-[10px]">⏱️ {action.estimatedTime}</Badge>
              </div>

              {action.prerequisites && action.prerequisites.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 mb-1">Prerequisites:</p>
                  <div className="flex flex-wrap gap-1">
                    {action.prerequisites.map((prereq, index) => (
                      <span key={index} className="text-[10px] text-slate-600">• {prereq}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3 pt-3 border-t border-slate-700">
                <div>
                  <div className="text-xs font-bold text-blue-400">{action.usageCount}</div>
                  <div className="text-[10px] text-slate-500">Times Used</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-green-400">{action.successRate}%</div>
                  <div className="text-[10px] text-slate-500">Success Rate</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onExecuteAction?.(action.id)}
                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Execute
                </button>
                <button
                  onClick={() => onViewDetails?.(action.id)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800 text-center">
        <div>
          <div className="text-xl font-bold text-blue-400">{actions.filter(a => a.type === 'AUTOMATED').length}</div>
          <div className="text-[10px] text-slate-500">Automated</div>
        </div>
        <div>
          <div className="text-xl font-bold text-purple-400">{actions.filter(a => a.type === 'SEMI_AUTOMATED').length}</div>
          <div className="text-[10px] text-slate-500">Semi-Auto</div>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-400">{actions.filter(a => a.type === 'MANUAL').length}</div>
          <div className="text-[10px] text-slate-500">Manual</div>
        </div>
        <div>
          <div className="text-xl font-bold text-green-400">
            {(actions.reduce((sum, a) => sum + a.successRate, 0) / actions.length).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">Avg Success</div>
        </div>
      </div>
    </div>
  );
};

export default ActionLibrary;

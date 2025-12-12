
import React, { useState, useMemo } from 'react';
import { Case } from '../../../types';
import { Card, Badge, Grid, CardHeader } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';

interface IncidentUser {
  id: string;
  name: string;
  role: string;
  email: string;
  activeCases: number;
  status: 'online' | 'offline' | 'away';
  assignments: string[];
  lastActive: string;
  responseTime: string;
  casesClosed: number;
}

interface IncidentUsersProps {
  cases: Case[];
}

export const IncidentUsers: React.FC<IncidentUsersProps> = React.memo(({ cases }) => {
  const [selectedUser, setSelectedUser] = useState<IncidentUser | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Extract users from cases
  const users = useMemo(() => {
    const userMap = new Map<string, IncidentUser>();

    cases.forEach(caseItem => {
      const assignee = caseItem.assignee || 'Unassigned';
      if (assignee !== 'Unassigned') {
        if (!userMap.has(assignee)) {
          userMap.set(assignee, {
            id: `USER-${assignee}`,
            name: assignee,
            role: assignee.includes('Lead') ? 'Lead Analyst' :
                  assignee.includes('Senior') ? 'Senior Analyst' :
                  assignee.includes('Junior') ? 'Junior Analyst' : 'Analyst',
            email: `${assignee.toLowerCase().replace(/\s+/g, '.')}@sentinel.sec`,
            activeCases: 0,
            status: Math.random() > 0.3 ? 'online' : Math.random() > 0.5 ? 'away' : 'offline',
            assignments: [],
            lastActive: new Date(Date.now() - Math.random() * 3600000).toLocaleString(),
            responseTime: `${Math.floor(Math.random() * 60 + 10)}m`,
            casesClosed: Math.floor(Math.random() * 50 + 5)
          });
        }
        const user = userMap.get(assignee)!;
        if (caseItem.status !== 'CLOSED') {
          user.activeCases++;
          user.assignments.push(caseItem.id);
        }
      }
    });

    return Array.from(userMap.values());
  }, [cases]);

  const filteredUsers = useMemo(() => {
    if (filterRole === 'ALL') return users;
    return users.filter(u => u.role === filterRole);
  }, [users, filterRole]);

  const userStats = useMemo(() => ({
    total: users.length,
    online: users.filter(u => u.status === 'online').length,
    away: users.filter(u => u.status === 'away').length,
    offline: users.filter(u => u.status === 'offline').length,
    avgActiveCases: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.activeCases, 0) / users.length) : 0
  }), [users]);

  const getStatusColor = (status: IncidentUser['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const roles = ['ALL', 'Lead Analyst', 'Senior Analyst', 'Analyst', 'Junior Analyst'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <Grid cols={5}>
        <Card className="p-4 text-center border-t-2 border-t-blue-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Users</div>
          <div className="text-2xl font-bold text-white font-mono">{userStats.total}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-green-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Online</div>
          <div className="text-2xl font-bold text-green-500 font-mono">{userStats.online}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-yellow-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Away</div>
          <div className="text-2xl font-bold text-yellow-500 font-mono">{userStats.away}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-gray-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Offline</div>
          <div className="text-2xl font-bold text-gray-500 font-mono">{userStats.offline}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-cyan-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Avg Cases</div>
          <div className="text-2xl font-bold text-cyan-500 font-mono">{userStats.avgActiveCases}</div>
        </Card>
      </Grid>

      {/* Role Filter */}
      <div className="flex gap-2">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filterRole === role
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <Card
            key={user.id}
            className="p-4 hover:border-blue-500 transition-colors cursor-pointer group"
            onClick={() => setSelectedUser(user)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${getStatusColor(user.status)}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-400">{user.role}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge color={user.status === 'online' ? 'green' : user.status === 'away' ? 'yellow' : 'gray'} className="text-[10px] capitalize">
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Active Cases</span>
                <span className={`font-bold ${user.activeCases > 5 ? 'text-red-500' : 'text-green-500'}`}>
                  {user.activeCases}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cases Closed</span>
                <span className="font-bold text-blue-400">{user.casesClosed}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Avg Response</span>
                <span className="font-bold text-cyan-400">{user.responseTime}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <Icons.Clock className="w-3 h-3" />
                <span>Last active: {user.lastActive}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-slate-500 mb-2">No users found</div>
          <p className="text-xs text-slate-600">Try adjusting your filters</p>
        </Card>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${getStatusColor(selectedUser.status)}`}></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                    <p className="text-sm text-slate-400">{selectedUser.role}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedUser.activeCases}</div>
                  <div className="text-[10px] text-slate-500 uppercase mt-1">Active Cases</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{selectedUser.casesClosed}</div>
                  <div className="text-[10px] text-slate-500 uppercase mt-1">Closed</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{selectedUser.responseTime}</div>
                  <div className="text-[10px] text-slate-500 uppercase mt-1">Response Time</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-3">Assigned Cases</h3>
                {selectedUser.assignments.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {selectedUser.assignments.map(caseId => {
                      const caseItem = cases.find(c => c.id === caseId);
                      return caseItem ? (
                        <div key={caseId} className="bg-slate-800/30 border border-slate-700 rounded p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-slate-400">{caseId}</span>
                            <Badge color={caseItem.priority === 'CRITICAL' ? 'red' : 'blue'} className="text-[10px]">
                              {caseItem.priority}
                            </Badge>
                          </div>
                          <div className="text-slate-300 mt-1 line-clamp-1">{caseItem.title}</div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No active case assignments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default IncidentUsers;

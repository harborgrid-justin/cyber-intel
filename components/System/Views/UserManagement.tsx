
import React from 'react';
import { Card, Badge, CardHeader } from '../../Shared/UI';
import { VirtualList } from '../../Shared/VirtualList';
import { SystemUser } from '../../../types';

interface Props {
  users: SystemUser[];
}

export const UserManagement: React.FC<Props> = ({ users }) => {
  const renderRow = (u: SystemUser) => (
    <div key={u.id} className="flex justify-between items-center p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
        <div className="w-1/3">
            <div className="font-bold text-white">{u.name}</div>
            <div className="text-xs text-slate-500">{u.username}</div>
        </div>
        <div className="w-1/4 text-slate-400 text-sm">{u.role}</div>
        <div className="w-1/4"><Badge color={u.clearance === 'TS' ? 'red' : 'blue'}>{u.clearance}</Badge></div>
        <div className="w-1/6 flex items-center justify-end"><span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.status === 'Online' ? 'bg-green-500' : 'bg-slate-500'}`}></span><span className="text-xs text-slate-400">{u.status}</span></div>
    </div>
  );

  return (
    <Card className="overflow-hidden p-0 h-full flex flex-col">
        <CardHeader title="System User Management" action={<Badge>{users.length} Users</Badge>} />
        <div className="flex-1 min-h-0">
            <VirtualList items={users} rowHeight={64} containerHeight={600} renderRow={renderRow} />
        </div>
    </Card>
  );
};

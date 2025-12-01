
import React from 'react';
import { Card, CardHeader, Badge } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { SystemUser } from '../../../types';

interface Props {
  users: SystemUser[];
}

export const UserManagement: React.FC<Props> = ({ users }) => {
  return (
    <Card className="overflow-hidden p-0">
        <CardHeader title="System User Management" />
        <ResponsiveTable<SystemUser>
        data={users}
        keyExtractor={u => u.id}
        columns={[
            { header: 'Name', render: u => <span className="font-bold text-white">{u.name}</span> },
            { header: 'Role', render: u => <span>{u.role}</span> },
            { header: 'Clearance', render: u => <Badge color={u.clearance === 'TS' ? 'red' : 'blue'}>{u.clearance}</Badge> },
            { header: 'Status', render: u => <div className="flex items-center"><span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.status === 'Online' ? 'bg-green-500' : 'bg-slate-500'}`}></span>{u.status}</div> }
        ]}
        renderMobileCard={u => (
            <div className="flex justify-between items-center">
            <div>
                <div className="font-bold text-white">{u.name}</div>
                <div className="text-xs text-slate-500">{u.role}</div>
            </div>
            <Badge>{u.clearance}</Badge>
            </div>
        )}
        />
    </Card>
  );
};

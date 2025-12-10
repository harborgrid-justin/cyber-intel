
import React from 'react';
import { Card, CardHeader } from '../Shared/UI';

export const VersionHistory: React.FC = () => (
  <Card className="p-0 overflow-hidden">
    <CardHeader title="Changelog" />
    <div className="p-4 space-y-4">
        <div>
            <div className="text-sm font-bold text-white">v2.5.0 (Current)</div>
            <ul className="list-disc pl-4 text-xs text-slate-400 mt-1">
                <li>Added AI-driven attribution engine</li>
                <li>Enhanced Dark Web monitoring features</li>
                <li>Performance optimizations for Graph View</li>
            </ul>
        </div>
        <div>
            <div className="text-sm font-bold text-slate-500">v2.4.0</div>
            <ul className="list-disc pl-4 text-xs text-slate-500 mt-1">
                <li>Initial release of Case Management</li>
                <li>RBAC integration</li>
            </ul>
        </div>
    </div>
  </Card>
);

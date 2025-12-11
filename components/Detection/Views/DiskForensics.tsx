
import React from 'react';
import { Card, CardHeader } from '../../Shared/UI';

export const DiskForensics: React.FC = () => {
    return (
        <Card className="h-full p-0 flex flex-col">
            <CardHeader title="MFT Analysis Module" />
            <div className="flex-1 flex items-center justify-center text-slate-500">
                Disk Forensics Analysis Interface
            </div>
        </Card>
    );
};

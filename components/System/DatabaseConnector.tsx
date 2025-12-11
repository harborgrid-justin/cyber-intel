
import React, { useRef } from 'react';
import { Button, Card, Badge, Input, FilterGroup, CardHeader, Switch, Label } from '../Shared/UI';
import { useDatabaseConnection } from '../../hooks/modules/useDatabaseConnection';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';

const LogLine = React.memo(({ log }: { log: string }) => {
    const isError = log.includes('ERROR') || log.includes('FATAL');
    const isSuccess = log.includes('SUCCESS') || log.includes('READY');
    const color = isError ? 'text-red-400' : isSuccess ? 'text-green-300' : 'text-slate-500';
    return <div className={`border-l-2 pl-2 border-slate-800 ${color}`}>{log}</div>;
});

const DatabaseConnector: React.FC = () => {
  const { providerType, setProviderType, config, setConfig, stats, logs, isBusy, handleConnect, handleDisconnect, handleMaintenance, toggleRecovery } = useDatabaseConnection();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card className="p-4 flex items-center justify-between">
       <div><div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{title}</div><div className={`text-lg font-bold font-mono ${color}`}>{value}</div></div>
       {icon}
    </Card>
  );

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
         <StatCard title="Connection State" value={stats.status} color={stats.status === 'CONNECTED' ? 'text-green-500' : 'text-slate-300'} icon={<
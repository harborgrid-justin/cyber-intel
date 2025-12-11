
import React from 'react';
import { Threat } from '../../../types';
import { Card, CardHeader, Badge } from '../../Shared/UI';
import { EmptyState } from '../../Shared/ui/EmptyState';
import FeedItem from '../../Feed/FeedItem';

interface Props {
  threats: Threat[];
}

export const ActorIoCs: React.FC<Props> = ({ threats }) => {
  return (
    <Card className="flex-1 p-0 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader title="Linked Indicators" action={<Badge color="red">{threats.length} Items</Badge>} />
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2 bg-slate-900/30">
            {threats.length > 0 ? (
                threats.map(t => <FeedItem key={t.id} threat={t} />)
            ) : (
                <EmptyState message="No IoCs directly attributed to this actor." />
            )}
        </div>
    </Card>
  );
};

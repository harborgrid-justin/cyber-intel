
import { useState, useCallback, useMemo } from 'react';
import { ingestDataStream } from '../../services/ingestionService';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { IoCFeed, View } from '../../types';

export const useIngestionManager = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.INGESTION), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState(0);
  
  const feeds = useDataStore(() => threatData.getFeeds());

  const toggle = useCallback((id: string) => threatData.toggleFeed(id), []);
  const handleDelete = useCallback((id: string) => threatData.deleteFeed(id), []);
  
  const handleSync = useCallback(async (feed: IoCFeed) => {
    setSyncingId(feed.id);
    setStreamProgress(0);
    const stream = ingestDataStream(feed.name, 20);
    const reader = stream.getReader();
    let count = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          threatData.addThreat(value);
          count++;
          setStreamProgress(prev => prev + 1);
        }
      }
    } finally {
      reader.releaseLock();
    }
    feed.lastSync = 'Just now';
    threatData.feedStore.update(feed);
    setSyncingId(null);
    setStreamProgress(0);
    window.dispatchEvent(new CustomEvent('notification', { detail: { title: 'Ingestion Complete', message: `Streamed ${count} new indicators from ${feed.name}.`, type: 'success' } }));
  }, []);

  const handleConnectSource = useCallback((sourceName: string) => {
    if (feeds.some(f => f.name === sourceName)) {
      window.dispatchEvent(new CustomEvent('notification', { detail: { title: 'Connector Exists', message: `${sourceName} is already connected.`, type: 'warning' } }));
      return;
    }
    threatData.addFeed({
      id: `FEED-${Date.now()}`, name: sourceName, url: `api.connector.${sourceName.toLowerCase()}.local`,
      type: 'SIEM_CONNECTOR', status: 'ACTIVE', interval: 15, lastSync: 'Just now'
    });
  }, [feeds]);

  const handleCreateSuccess = useCallback(() => setIsCreating(false), []);
  const handleCreateCancel = useCallback(() => setIsCreating(false), []);
  const handleShowCreate = useCallback(() => setIsCreating(true), []);

  return {
    modules, activeModule, setActiveModule,
    isCreating, handleShowCreate, handleCreateCancel, handleCreateSuccess,
    syncingId, streamProgress, feeds,
    toggle, handleDelete, handleSync, handleConnectSource,
  };
};

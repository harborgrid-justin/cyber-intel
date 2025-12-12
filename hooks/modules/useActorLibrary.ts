
import { useState, useEffect, useMemo, useCallback } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { ThreatActor, ActorId, View } from '../../types';

export interface UseActorLibraryResult {
  modules: string[];
  libModule: string;
  setLibModule: (module: string) => void;
  actors: ThreatActor[];
  filteredActors: ThreatActor[];
  selectedActor: ThreatActor | null;
  isCreating: boolean;
  onShowCreate: () => void;
  onBack: () => void;
  newName: string;
  setNewName: (name: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleCreate: () => void;
  onSelect: (actor: ThreatActor) => void;
}

export const useActorLibrary = (initialId?: string): UseActorLibraryResult => {
  const modules = useMemo(() => threatData.getModulesForView(View.ACTORS), []);
  const [libModule, setLibModule] = useState(modules[0]);
  
  const actors = useDataStore(() => threatData.getActors());
  
  const [selectedId, setSelectedId] = useState<ActorId | null>(initialId || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { if (initialId) setSelectedId(initialId as ActorId); }, [initialId]);

  useEffect(() => {
    if (selectedId && !actors.find(a => a.id === selectedId)) {
        setSelectedId(null);
    }
  }, [actors, selectedId]);

  const selectedActor = useMemo(() => {
    if (!selectedId) return null;
    return actors.find(a => a.id === selectedId) || null;
  }, [selectedId, actors]);

  const handleCreate = useCallback(() => {
    if(!newName) return;
    const newActor: ThreatActor = { 
      id: `ACT-${Date.now()}` as ActorId, name: newName, aliases: [], origin: 'Unknown', description: 'New Profile', 
      sophistication: 'Novice', targets: [], ttps: [], campaigns: [], infrastructure: [], exploits: [], references: [], history: [],
      evasionTechniques: []
    };
    threatData.addActor(newActor);
    setIsCreating(false);
    setNewName('');
    setSelectedId(newActor.id);
  }, [newName]);

  const filteredActors = useMemo(() => {
    if (!searchTerm) return actors;
    const lower = searchTerm.toLowerCase();
    return actors.filter(a => a.name.toLowerCase().includes(lower) || a.origin.toLowerCase().includes(lower) || a.aliases.some(al => al.toLowerCase().includes(lower)));
  }, [actors, searchTerm]);
  
  const onSelect = (actor: ThreatActor) => {
      setSelectedId(actor.id);
      setIsCreating(false);
  };
  
  const onBack = () => {
      setSelectedId(null);
      setIsCreating(false);
  };
  
  const onShowCreate = () => {
      setIsCreating(true);
      setSelectedId(null);
  };

  return {
    modules, libModule, setLibModule,
    actors, filteredActors, selectedActor,
    isCreating, onShowCreate, onBack,
    newName, setNewName,
    searchTerm, setSearchTerm,
    handleCreate, onSelect,
  };
};

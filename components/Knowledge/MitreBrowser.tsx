
import React, { useState, useMemo } from 'react';
import { Button } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { MitreMatrix } from './Views/MitreMatrix';
import { TacticsGrid, TechniquesGrid, SoftwareGrid, MitigationsGrid, AptTable, SubTechTable } from './Views/MitreLibrary';
import { View } from '../../types';

const MitreBrowser: React.FC = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.MITRE), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [matrixMode, setMatrixMode] = useState<'STANDARD' | 'HEATMAP'>('STANDARD');
  
  // Efficient Subscriptions
  const tactics = useDataStore(() => threatData.getMitreTactics());
  const techniques = useDataStore(() => threatData.getMitreTechniques());
  const subTechs = useDataStore(() => threatData.getMitreSubTechniques());
  const groups = useDataStore(() => threatData.getMitreGroups());
  const software = useDataStore(() => threatData.getMitreSoftware());
  const mitigations = useDataStore(() => threatData.getMitreMitigations());

  const handleLink = (url?: string) => { if(url) alert(`Navigating: ${url}`); };
  const handleView = (id: string, type: string) => alert(`Viewing KB entry for ${type} ID: ${id}`);
  const handleSync = () => alert('Synchronizing with MITRE TAXII Server... Updated 14 items.');

  return (
    <StandardPage 
      title="MITRE ATT&CK Knowledge Base" 
      subtitle="Framework Version: v13.1" 
      actions={<Button onClick={handleSync} variant="secondary">SYNC FRAMEWORK</Button>} 
      modules={modules} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Enterprise Matrix' && (
        <MitreMatrix matrixMode={matrixMode} setMatrixMode={setMatrixMode} onView={handleView} />
      )}

      {activeModule === 'Tactics' && <TacticsGrid data={tactics} onView={handleView} />}
      {activeModule === 'Techniques' && <TechniquesGrid data={techniques} onView={handleView} onLink={handleLink} />}
      {activeModule === 'Sub-Techniques' && <SubTechTable data={subTechs} onView={handleView} />}
      {activeModule === 'APT Groups' && <AptTable data={groups} onView={handleView} />}
      {activeModule === 'Software' && <SoftwareGrid data={software} onView={handleView} />}
      {activeModule === 'Mitigations' && <MitigationsGrid data={mitigations} onView={handleView} />}
    </StandardPage>
  );
};
export default MitreBrowser;

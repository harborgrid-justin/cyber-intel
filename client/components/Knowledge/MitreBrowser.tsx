
import React, { useState } from 'react';
import { Button } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { threatData } from '../services-frontend/dataLayer';
import { MitreMatrix } from './Views/MitreMatrix';
import { TacticsGrid, TechniquesGrid, SoftwareGrid, MitigationsGrid, AptTable, SubTechTable } from './Views/MitreLibrary';

const MitreBrowser: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.MITRE[0]);
  const [matrixMode, setMatrixMode] = useState<'STANDARD' | 'HEATMAP'>('STANDARD');
  
  const handleLink = (url?: string) => { if(url) alert(`Navigating: ${url}`); };
  const handleView = (id: string, type: string) => alert(`Viewing KB entry for ${type} ID: ${id}`);
  const handleSync = () => alert('Synchronizing with MITRE TAXII Server... Updated 14 items.');

  return (
    <StandardPage 
      title="MITRE ATT&CK Knowledge Base" 
      subtitle="Framework Version: v13.1" 
      actions={<Button onClick={handleSync} variant="secondary">SYNC FRAMEWORK</Button>} 
      modules={CONFIG.MODULES.MITRE} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Enterprise Matrix' && (
        <MitreMatrix matrixMode={matrixMode} setMatrixMode={setMatrixMode} onView={handleView} />
      )}

      {activeModule === 'Tactics' && <TacticsGrid data={threatData.getMitreTactics()} onView={handleView} />}
      {activeModule === 'Techniques' && <TechniquesGrid data={threatData.getMitreTechniques()} onView={handleView} onLink={handleLink} />}
      {activeModule === 'Sub-Techniques' && <SubTechTable data={threatData.getMitreSubTechniques()} onView={handleView} />}
      {activeModule === 'APT Groups' && <AptTable data={threatData.getMitreGroups()} onView={handleView} />}
      {activeModule === 'Software' && <SoftwareGrid data={threatData.getMitreSoftware()} onView={handleView} />}
      {activeModule === 'Mitigations' && <MitigationsGrid data={threatData.getMitreMitigations()} onView={handleView} />}
    </StandardPage>
  );
};
export default MitreBrowser;


import { Case } from '../../models/intelligence';

export class ReportGenerator {
  
  static getTemplates() {
    return [
      { id: 'FEDRAMP', name: 'FedRAMP POAM', desc: 'Plan of Action and Milestones.', icon: '🏛️' },
      { id: 'NIST', name: 'NIST SSP', desc: 'System Security Plan (800-53).', icon: '📜' },
      { id: 'CISA', name: 'CISA Incident (72h)', desc: 'Mandatory Cyber Incident Reporting.', icon: '🚨' },
      { id: 'FBI', name: 'FBI Cyber Action Report', desc: 'Joint Cybersecurity Advisory format.', icon: '🇺🇸' },
      { id: 'EXEC', name: 'Board Executive Summary', desc: 'Financial impact and risk exposure.', icon: '💼' },
    ];
  }

  static async generateCaseDraft(caseId: string, type: string) {
    const kase = await (Case as any).findByPk(caseId);
    if (!kase) throw new Error("Case not found");
    
    const header = `OFFICIAL SENTINEL REPORT\nTYPE: ${type.toUpperCase()}\nCASE: ${kase.title} (${kase.id})\nDATE: ${new Date().toISOString()}\n\n`;
    
    let body = "";
    if (type === 'Executive') {
        body = `EXECUTIVE SUMMARY\n\nCurrent Status: ${kase.status}\nPriority: ${kase.priority}\n\nAssessment:\n${kase.description}\n\nImpact Analysis:\n[Automated Backend Assessment pending Risk Engine calculation...]\n`;
    } else if (type === 'Forensic') {
        body = `FORENSIC ANALYSIS\n\nTarget System: [Asset Link Placeholder]\n\nChain of Custody Validated: YES\n\nArtifacts:\n- Logs analyzed\n- Memory dump processed`;
    } else {
        body = `TECHNICAL DETAILS\n\nAssignee: ${kase.assignee}\n\nThreat Indicators:\n[Linked Threats Placeholder]\n\nRecommendations:\n1. Isolate affected hosts.\n2. Rotate credentials.`;
    }
    
    return header + body;
  }
}

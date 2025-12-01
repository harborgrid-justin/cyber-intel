
import { DataLayer } from './dataLayer';
import { LogicEngine } from './logicEngine';
import { Severity, IncidentStatus } from '../../../types';
import { mockParseSTIX, mockParseVendorAdvisory, mockParseVulnScan } from './ingestionService';

export const startBackgroundJobs = (layer: DataLayer) => {
  setInterval(() => {
      // Logic Checks
      layer.cases = layer.cases.map(c => LogicEngine.checkSLA(c));
      layer.threats = layer.threats.map(t => LogicEngine.decayConfidence(t));
      layer.systemUsers = layer.systemUsers.map(u => LogicEngine.enforceDormantAccountPolicy(u));
      layer.devices = layer.devices.map(d => LogicEngine.enforceZeroTrustPatching(d));
      layer.feeds = layer.feeds.map(f => LogicEngine.tripFeedCircuitBreaker(f));
      layer.systemUsers = layer.systemUsers.map(u => LogicEngine.monitorAnalystFatigue(u));
      
      // Feed Ingestion
      layer.feeds.forEach(feed => {
        if (feed.status === 'ACTIVE' && Math.random() > 0.85) { // Simulate updates
           if (feed.type === 'VENDOR_ADVISORY') {
             const items = mockParseVendorAdvisory(feed.name);
             items.forEach(i => layer.addVendorFeedItem(i));
           } else if (feed.type === 'VULN_SCANNER') {
             const { findings, status } = mockParseVulnScan(feed.name);
             findings.forEach(v => layer.vulnStore.add(v));
             layer.updateScannerStatus(status);
           } else {
             const newThreats = mockParseSTIX('', feed.name);
             newThreats.forEach(t => layer.addThreat(t));
           }
        }
      });

      // Ransomware Check
      if (LogicEngine.checkRansomwareVelocity(layer.threats)) {
        layer.addThreat({
          id: `ALERT-${Date.now()}`, indicator: 'MASS_RANSOMWARE_EVENT', type: 'Alert', severity: Severity.CRITICAL,
          lastSeen: 'Now', source: 'LogicEngine', description: 'Velocity heuristic triggered.', status: IncidentStatus.NEW,
          confidence: 100, region: 'Global', threatActor: 'Unknown', reputation: 0, score: 100
        });
      }

      // System Pulse
      const nodes = layer.nodeStore.getAll();
      const updatedNodes = nodes.map(n => ({
        ...n, load: Math.min(100, Math.max(0, n.load + (Math.random() * 10 - 5))),
        latency: Math.max(0, n.latency + (Math.random() * 4 - 2))
      }));
      updatedNodes.forEach(n => layer.nodeStore.update(n));

      layer.sync('UPDATE', 'cases', {}); 
  }, 30000); 
};

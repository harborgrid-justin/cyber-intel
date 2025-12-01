
import { DataLayer } from './dataLayer';
import { LogicEngine } from './logicEngine';
import { Severity, IncidentStatus } from '../types';

export const startBackgroundJobs = (layer: DataLayer) => {
  setInterval(() => {
      // Logic 3: SLA Watchdog
      layer.cases = layer.cases.map(c => LogicEngine.checkSLA(c));
      
      // Logic 4: Confidence Decay
      layer.threats = layer.threats.map(t => LogicEngine.decayConfidence(t));

      // Logic 25: Dormant Account Auto-Lock
      layer.systemUsers = layer.systemUsers.map(u => LogicEngine.enforceDormantAccountPolicy(u));

      // Logic 30: Zero-Trust Device Quarantine
      layer.devices = layer.devices.map(d => LogicEngine.enforceZeroTrustPatching(d));

      // Logic 31: Feed Circuit Breaker
      layer.feeds = layer.feeds.map(f => LogicEngine.tripFeedCircuitBreaker(f));
      
      // Logic 32: Analyst Burnout Monitor
      layer.systemUsers = layer.systemUsers.map(u => LogicEngine.monitorAnalystFatigue(u));
      
      // Logic 12: Ransomware Velocity
      if (LogicEngine.checkRansomwareVelocity(layer.threats)) {
        layer.addThreat({
          id: `ALERT-${Date.now()}`, indicator: 'MASS_RANSOMWARE_EVENT', type: 'Alert', severity: Severity.CRITICAL,
          lastSeen: 'Now', source: 'LogicEngine', description: 'Velocity heuristic triggered: >5 ransomware events/min.',
          status: IncidentStatus.NEW, confidence: 100, region: 'Global', threatActor: 'Unknown', reputation: 0, score: 100
        });
      }

      layer.sync('UPDATE', 'cases', {}); 
  }, 60000); 
};

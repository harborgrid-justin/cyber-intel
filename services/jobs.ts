
import { DataLayer } from './dataLayer';
import { LogicEngine } from './logicEngine';
import { ThreatLogic } from './logic/ThreatLogic';
import { SystemLogic } from './logic/SystemLogic';
import { Severity, IncidentStatus, ThreatId } from '../types';
import { mockParseSTIX, mockParseVendorAdvisory, mockParseVulnScan } from './ingestionService';

// Polyfill for TypeScript if not available in lib.dom.d.ts
type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout?: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};

interface WindowWithIdle extends Window {
  requestIdleCallback: (
    callback: (deadline: RequestIdleCallbackDeadline) => void,
    opts?: RequestIdleCallbackOptions
  ) => RequestIdleCallbackHandle;
  cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
}

// Helper to safely unwrap store results
const getItems = (res: any) => (res && res.success && Array.isArray(res.data)) ? res.data : [];

export const startBackgroundJobs = (layer: DataLayer) => {
  const win = window as unknown as WindowWithIdle;
  
  // Use requestIdleCallback if available, otherwise fallback to setTimeout
  const scheduleJob = (callback: () => void) => {
    if (win.requestIdleCallback) {
      win.requestIdleCallback((deadline) => {
        // Only run if we have time or it timed out, prioritizing user interaction
        if (deadline.timeRemaining() > 5 || deadline.didTimeout) {
          callback();
        } else {
          // Reschedule if busy
          scheduleJob(callback); 
        }
      }, { timeout: 2000 });
    } else {
      setTimeout(callback, 500); // Fallback
    }
  };

  setInterval(() => {
      // Wrap heavy logic in Idle Callback
      scheduleJob(async () => {
          const threats = getItems(layer.threatStore.getAll());

          // --- 1. Backend Lifecycle Calls ---
          ThreatLogic.decayConfidence(threats);
          SystemLogic.checkRetentionPolicy();
          SystemLogic.monitorAnalystFatigue();
          
          // --- 2. Lightweight Local Logic ---
          // Update Cases
          const cases = getItems(layer.caseStore.getAll());
          for (const c of cases) {
            const updated = LogicEngine.checkSLA(c);
            if (updated !== c) layer.caseStore.update(updated);
          }

          // Update Users
          const users = getItems(layer.userStore.getAll());
          users.forEach((u: any) => {
            const updated = LogicEngine.enforceDormantAccountPolicy(u);
            if (updated !== u) layer.userStore.update(updated);
          });

          // Update Devices
          const devices = getItems(layer.deviceStore.getAll());
          devices.forEach((d: any) => {
            const updated = LogicEngine.enforceZeroTrustPatching(d);
            if (updated !== d) layer.deviceStore.update(updated);
          });

          // Update Feeds
          const feeds = getItems(layer.feedStore.getAll());
          feeds.forEach((f: any) => {
            const updated = LogicEngine.tripFeedCircuitBreaker(f);
            if (updated !== f) layer.feedStore.update(updated);
          });
      });

      // --- 3. Feed Ingestion Simulation (Frontend Demo Mode) ---
      scheduleJob(() => {
          const feeds = getItems(layer.feedStore.getAll());
          feeds.forEach((feed: any) => {
            if (feed.status === 'ACTIVE' && Math.random() > 0.85) { 
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
      });

      // --- 4. Heuristic Detection ---
      scheduleJob(async () => {
          const threats = getItems(layer.threatStore.getAll());
          if (await LogicEngine.checkRansomwareVelocity(threats)) {
            layer.addThreat({
              id: `ALERT-${Date.now()}` as ThreatId, indicator: 'MASS_RANSOMWARE_EVENT', type: 'Alert', severity: Severity.CRITICAL,
              lastSeen: 'Now', source: 'LogicEngine', description: 'Velocity heuristic triggered.', status: IncidentStatus.NEW,
              confidence: 100, region: 'Global', threatActor: 'Unknown', reputation: 0, score: 100
            });
          }
      });

      // --- 5. System Pulse Simulation ---
      const nodes = getItems(layer.nodeStore.getAll());
      const updatedNodes = nodes.map((n: any) => ({
        ...n, load: Math.min(100, Math.max(0, n.load + (Math.random() * 10 - 5))),
        latency: Math.max(0, n.latency + (Math.random() * 4 - 2))
      }));
      updatedNodes.forEach((n: any) => layer.nodeStore.update(n));

      // Trigger UI refresh
      layer.sync('UPDATE', 'cases', {}); 
  }, 30000); 
};


import { DataLayer } from './dataLayer';
import { LogicEngine } from './logicEngine';
import { Severity, IncidentStatus, View, ThreatId } from '../types';
import { mockParseSTIX, mockParseVendorAdvisory, mockParseVulnScan } from './ingestionService';

export class SyncManager {
  private layer: DataLayer;
  private syncInterval: any;
  private simulationInterval: any;

  constructor(layer: DataLayer) {
    this.layer = layer;
  }

  public start() {
    this.startSimulationLoop();
    this.startSyncLoop();
  }

  public stop() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }

  /**
   * Pre-fetches data required for a specific view to ensure freshness
   */
  public prefetch(view: View) {
    switch (view) {
        case View.DASHBOARD:
            this.layer.threatStore.fetch();
            this.layer.caseStore.fetch();
            this.layer.nodeStore.fetch();
            break;
        case View.FEED:
            this.layer.threatStore.fetch();
            this.layer.feedStore.fetch();
            break;
        case View.CASES:
            this.layer.caseStore.fetch();
            this.layer.threatStore.fetch(); // Correlated data
            break;
        case View.ACTORS:
            this.layer.actorStore.fetch();
            this.layer.campaignStore.fetch();
            break;
        // Add other views as needed
    }
  }

  private getItems<T>(storeResult: any): T[] {
      // Robust unwrap: check for success and array data
      if (storeResult && storeResult.success && Array.isArray(storeResult.data)) {
          return storeResult.data;
      }
      return [];
  }

  private startSimulationLoop() {
    this.simulationInterval = setInterval(() => {
        // System Pulse Simulation
        const nodesRes = this.layer.nodeStore.getAll();
        const nodes = this.getItems<any>(nodesRes);
        
        const updatedNodes = nodes.map((n: any) => ({
            ...n, 
            load: Math.min(100, Math.max(0, n.load + (Math.random() * 10 - 5))),
            latency: Math.max(0, n.latency + (Math.random() * 4 - 2))
        }));
        
        updatedNodes.forEach((n: any) => this.layer.nodeStore.update(n));
        
        // Random Background Noise/Events can be added here
    }, 5000); // 5 seconds pulse
  }

  private startSyncLoop() {
    this.syncInterval = setInterval(() => {
        // 1. Run Logic Engine Checks
        
        // Unwrap threats safely
        const threatsRes = this.layer.threatStore.getAll();
        const threats = this.getItems<any>(threatsRes);
        
        // Trigger background decay (Async)
        LogicEngine.decayConfidence(threats);

        // Apply local logic updates to stores
        const users = this.getItems<any>(this.layer.userStore.getAll());
        users.forEach((u: any) => {
            const updated = LogicEngine.enforceDormantAccountPolicy(u);
            if (updated.status !== u.status) this.layer.userStore.update(updated);
        });

        const devices = this.getItems<any>(this.layer.deviceStore.getAll());
        devices.forEach((d: any) => {
            const updated = LogicEngine.enforceZeroTrustPatching(d);
            if (updated.status !== d.status) this.layer.deviceStore.update(updated);
        });

        const feeds = this.getItems<any>(this.layer.feedStore.getAll());
        feeds.forEach((f: any) => {
            const updated = LogicEngine.tripFeedCircuitBreaker(f);
            if (updated.status !== f.status) this.layer.feedStore.update(updated);
        });

        // 2. Simulated Ingestion
        feeds.forEach((feed: any) => {
            if (feed.status === 'ACTIVE' && Math.random() > 0.85) { 
                if (feed.type === 'VENDOR_ADVISORY') {
                    const items = mockParseVendorAdvisory(feed.name);
                    items.forEach(i => this.layer.addVendorFeedItem(i));
                } else if (feed.type === 'VULN_SCANNER') {
                    const { findings, status } = mockParseVulnScan(feed.name);
                    findings.forEach(v => this.layer.vulnStore.add(v));
                    this.layer.updateScannerStatus(status);
                } else {
                    const newThreats = mockParseSTIX('', feed.name);
                    newThreats.forEach(t => this.layer.addThreat(t));
                }
            }
        });

        // 3. Heuristic Detection
        if (LogicEngine.checkRansomwareVelocity(threats)) {
            // Only add if not recently added (prevent spam)
            const recentAlert = threats.find((t: any) => t.indicator === 'MASS_RANSOMWARE_EVENT' && t.status === IncidentStatus.NEW);
            if (!recentAlert) {
                this.layer.addThreat({
                    id: `ALERT-${Date.now()}` as ThreatId, indicator: 'MASS_RANSOMWARE_EVENT', type: 'Alert', severity: Severity.CRITICAL,
                    lastSeen: 'Now', source: 'LogicEngine', description: 'Velocity heuristic triggered.', status: IncidentStatus.NEW,
                    confidence: 100, region: 'Global', threatActor: 'Unknown', reputation: 0, score: 100
                });
            }
        }

        // 4. Force UI Refresh for polling components
        this.layer.sync('UPDATE', 'system', { timestamp: Date.now() });

    }, 30000); // 30 Seconds Sync
  }
}

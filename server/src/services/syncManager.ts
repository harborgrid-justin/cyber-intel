
import { DataLayer } from './dataLayer';
import { LogicEngine } from './logicEngine';
import { Severity, IncidentStatus, View } from '@/types';
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
    // console.log(`[SyncManager] Prefetching data for view: ${view}`);
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

  private startSimulationLoop() {
    this.simulationInterval = setInterval(() => {
        // System Pulse Simulation
        const nodes = this.layer.nodeStore.getAll();
        const updatedNodes = nodes.map(n => ({
            ...n, 
            load: Math.min(100, Math.max(0, n.load + (Math.random() * 10 - 5))),
            latency: Math.max(0, n.latency + (Math.random() * 4 - 2))
        }));
        updatedNodes.forEach(n => this.layer.nodeStore.update(n));
        
        // Random Background Noise/Events can be added here
    }, 5000); // 5 seconds pulse
  }

  private startSyncLoop() {
    this.syncInterval = setInterval(() => {
        // 1. Run Logic Engine Checks
        const updatedCases = this.layer.cases.map(c => LogicEngine.checkSLA(c));
        updatedCases.forEach(kase => this.layer.caseStore.update(kase));

        const updatedThreats = this.layer.threats.map(t => LogicEngine.decayConfidence(t));
        updatedThreats.forEach(threat => this.layer.threatStore.update(threat));

        const updatedUsers = this.layer.systemUsers.map(u => LogicEngine.enforceDormantAccountPolicy(u));
        updatedUsers.forEach(user => this.layer.userStore.update(user));

        const updatedDevices = this.layer.devices.map(d => LogicEngine.enforceZeroTrustPatching(d));
        updatedDevices.forEach(device => this.layer.deviceStore.update(device));

        const updatedFeeds = this.layer.feeds.map(f => LogicEngine.tripFeedCircuitBreaker(f));
        updatedFeeds.forEach(feed => this.layer.feedStore.update(feed));

        // Batch Updates (In a real app, logic engine would return diffs)
        // For now, we rely on the logic engine's side effects if any, or manual updates if logic returns new objects
        // The LogicEngine methods currently return modified copies, so we should update stores if changed.
        // Simplified for this demo:
        
        // 2. Simulated Ingestion
        this.layer.feeds.forEach(feed => {
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
        if (LogicEngine.checkRansomwareVelocity(this.layer.threats)) {
            // Only add if not recently added (prevent spam)
            const recentAlert = this.layer.threats.find(t => t.indicator === 'MASS_RANSOMWARE_EVENT' && t.status === IncidentStatus.NEW);
            if (!recentAlert) {
                this.layer.addThreat({
                    id: `ALERT-${Date.now()}`, indicator: 'MASS_RANSOMWARE_EVENT', type: 'Alert', severity: Severity.CRITICAL,
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

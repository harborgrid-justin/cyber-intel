
// Fix: Correct import path for types
import { 
    Campaign, Malware, Pcap, SystemNode, Threat, IncidentStatus, SystemUser, 
    AuditLog, Vendor, Case, Device
} from '../../types';

export class DeepAnalytics {

    // 16. Campaign -> Timeline: Velocity
    static calculateKillChainVelocity(campaign: Campaign): string {
        const start = new Date(campaign.firstSeen).getTime();
        const end = new Date(campaign.lastSeen).getTime();
        const days = (end - start) / (1000 * 3600 * 24);
        return days < 7 ? 'HIGH (Blitz)' : days < 30 ? 'MEDIUM' : 'LOW (APT)';
    }

    // 17. Malware -> Network: C2 Proto
    static identifyC2Protocol(malware: Malware, pcaps: Pcap[]): string {
        // Mock signature match
        if (malware.family === 'CobaltStrike') return 'HTTPS/DNS';
        return 'Unknown';
    }

    // 18. Asset -> Feed: Honeypot Promotion
    static promoteHoneypotHit(asset: SystemNode): Threat | null {
        if (asset.type === 'Sensor' && asset.status === 'ISOLATED') {
            return {
                id: `INT-THREAT-${Date.now()}` as any,
                indicator: asset.ip_address || '0.0.0.0',
                type: 'IP Address',
                severity: 'HIGH' as any,
                lastSeen: 'Now',
                source: 'Internal Honeypot',
                description: `Internal decoy ${asset.name} triggered`,
                status: IncidentStatus.NEW,
                confidence: 100,
                region: 'Internal',
                threatActor: 'Unknown',
                reputation: 0,
                score: 100
            };
        }
        return null;
    }

    // 19. Incident -> Knowledge: MITRE Map
    static mapIncidentToMitre(kase: Case): string[] {
        // Mock extraction from description
        const found: string[] = [];
        if (kase.description.includes('phishing')) found.push('T1566');
        if (kase.description.includes('powershell')) found.push('T1059');
        return found;
    }

    // 20. User -> Training: Phishing Remediation
    static assignTraining(user: SystemUser, clickCount: number): boolean {
        return clickCount > 0;
    }

    // 21. Network -> Asset: Rogue Device
    static isRogueDevice(mac: string, assetList: Device[]): boolean {
        // Unknown MAC check
        return !assetList.some(d => d.serial === mac); // Using serial as MAC proxy
    }

    // 22. Threat -> History: Temporal Pattern
    static analyzeTemporalPattern(threats: Threat[]): string {
        const weekendCount = threats.filter(t => {
            const day = new Date(t.lastSeen).getDay();
            return day === 0 || day === 6;
        }).length;
        return weekendCount > (threats.length * 0.4) ? 'Weekend Spikes Detected' : 'Standard Distribution';
    }

    // 23. Asset -> Cloud: IAM Risk
    static analyzeIamRisk(asset: SystemNode): string {
        if (asset.iamRoles?.includes('*:*') || asset.iamRoles?.includes('AdministratorAccess')) {
            return 'CRITICAL: Excessive Cloud Permissions';
        }
        return 'NORMAL';
    }

    // 24. Vuln -> Threat: Ransomware Risk
    static isRansomwareVector(cve: string): boolean {
        const known = ['CVE-2017-0144', 'CVE-2019-11510', 'CVE-2021-44228'];
        return known.includes(cve);
    }

    // 25. Incident -> Cost: Financial Impact
    static estimateIncidentCost(durationHours: number, affectedAssets: number): number {
        const costPerHour = 5000;
        const assetValue = 2000;
        return (durationHours * costPerHour) + (affectedAssets * assetValue);
    }

    // 26. User -> Chat: Sentiment
    static analyzeUserSentiment(messages: string[]): 'Negative' | 'Neutral' | 'Positive' {
        const negativeKeywords = ['hate', 'quit', 'stupid', 'broken', 'breach'];
        const hit = messages.some(m => negativeKeywords.some(k => m.toLowerCase().includes(k)));
        return hit ? 'Negative' : 'Neutral';
    }

    // 27. Feed -> DNS: Passive DNS
    static correlatePassiveDns(domain: string): string[] {
        // Mock PDNS history
        return [`1.1.1.1`, `10.20.30.40`];
    }

    // 28. Asset -> Software: Zero-Day Radius
    static checkSoftwareInventory(softwareName: string, nodes: SystemNode[]): SystemNode[] {
        // Mock: Assume all servers have the software
        return nodes.filter(n => n.type === 'Server');
    }

    // 29. Campaign -> Defense: Gap Analysis
    static identifyControlGaps(campaign: Campaign, nodes: SystemNode[]): string[] {
        // If campaign uses Phishing (T1566) and nodes lack Email Gateway
        if (campaign.ttps.includes('T1566') && !nodes.some(n => n.securityControls.includes('EMAIL_GW'))) {
            return ['Missing Email Gateway for Phishing Defense'];
        }
        return [];
    }

    // 30. Incident -> Legal: Sovereignty
    static checkDataSovereignty(ip: string, asset: SystemNode): boolean {
        // Validate inputs first
        if (!ip || typeof ip !== 'string') return false;
        if (!asset) return false;

        // Check if non-EU IP accesses EU asset
        const isEuAsset = asset.dataSensitivity === 'GDPR_PROTECTED';
        const isNonEuIp = !ip.startsWith('2.'); // Mock EU IP range check
        
        return isEuAsset && isNonEuIp;
    }
}

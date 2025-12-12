/**
 * TTP Analyzer - Analyze and match Tactics, Techniques, and Procedures
 * Based on MITRE ATT&CK framework
 */

interface TTP {
  id: string;
  name: string;
  tactic?: string;
  technique?: string;
  subtechnique?: string;
  description?: string;
  platforms?: string[];
  detection_methods?: string[];
}

interface TTPMatch {
  ttp: TTP;
  confidence: number;
  evidence: string[];
  related_ttps: string[];
}

interface TTPProfile {
  actor_name?: string;
  ttps: TTP[];
  tactics_coverage: Record<string, number>;
  sophistication_score: number;
  common_patterns: string[];
  defensive_gaps: string[];
}

interface TTPAnalysisResult {
  matches: TTPMatch[];
  profile: TTPProfile;
  threat_score: number;
  recommendations: string[];
}

export class TTPAnalyzer {
  // MITRE ATT&CK Tactics
  private static readonly TACTICS = [
    'TA0043', // Reconnaissance
    'TA0042', // Resource Development
    'TA0001', // Initial Access
    'TA0002', // Execution
    'TA0003', // Persistence
    'TA0004', // Privilege Escalation
    'TA0005', // Defense Evasion
    'TA0006', // Credential Access
    'TA0007', // Discovery
    'TA0008', // Lateral Movement
    'TA0009', // Collection
    'TA0011', // Command and Control
    'TA0010', // Exfiltration
    'TA0040'  // Impact
  ];

  private static readonly TTP_DATABASE: Record<string, TTP> = {
    'T1566': {
      id: 'T1566',
      name: 'Phishing',
      tactic: 'Initial Access',
      technique: 'Phishing',
      platforms: ['Windows', 'macOS', 'Linux'],
      detection_methods: ['Email gateway', 'User reporting', 'URL analysis']
    },
    'T1059': {
      id: 'T1059',
      name: 'Command and Scripting Interpreter',
      tactic: 'Execution',
      technique: 'Command and Scripting Interpreter',
      platforms: ['Windows', 'macOS', 'Linux'],
      detection_methods: ['Process monitoring', 'Command-line analysis']
    },
    'T1547': {
      id: 'T1547',
      name: 'Boot or Logon Autostart Execution',
      tactic: 'Persistence',
      technique: 'Boot or Logon Autostart Execution',
      platforms: ['Windows', 'macOS', 'Linux'],
      detection_methods: ['Registry monitoring', 'File monitoring']
    },
    'T1078': {
      id: 'T1078',
      name: 'Valid Accounts',
      tactic: 'Initial Access',
      technique: 'Valid Accounts',
      platforms: ['Windows', 'macOS', 'Linux', 'Cloud'],
      detection_methods: ['Authentication logs', 'Anomaly detection']
    },
    'T1071': {
      id: 'T1071',
      name: 'Application Layer Protocol',
      tactic: 'Command and Control',
      technique: 'Application Layer Protocol',
      platforms: ['Windows', 'macOS', 'Linux'],
      detection_methods: ['Network traffic analysis', 'SSL/TLS inspection']
    },
    'T1041': {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      tactic: 'Exfiltration',
      technique: 'Exfiltration Over C2 Channel',
      platforms: ['Windows', 'macOS', 'Linux'],
      detection_methods: ['Network monitoring', 'Data loss prevention']
    },
    'T1053': {
      id: 'T1053',
      name: 'Scheduled Task/Job',
      tactic: 'Persistence',
      technique: 'Scheduled Task/Job',
      platforms: ['Windows', 'macOS', 'Linux'],
      detection_methods: ['Scheduled task monitoring']
    },
    'T1055': {
      id: 'T1055',
      name: 'Process Injection',
      tactic: 'Defense Evasion',
      technique: 'Process Injection',
      platforms: ['Windows', 'macOS', 'Linux'],
      detection_methods: ['Process monitoring', 'API monitoring']
    }
  };

  /**
   * Analyze and match TTPs from observed behavior
   */
  static async analyzeTTPs(
    observedBehaviors: string[],
    contextData?: any
  ): Promise<TTPAnalysisResult> {
    const matches: TTPMatch[] = [];

    // Match behaviors to known TTPs
    observedBehaviors.forEach(behavior => {
      const behaviorMatches = this.matchBehaviorToTTP(behavior);
      matches.push(...behaviorMatches);
    });

    // Build TTP profile
    const profile = this.buildTTPProfile(matches);

    // Calculate threat score
    const threat_score = this.calculateThreatScore(profile);

    // Generate recommendations
    const recommendations = this.generateRecommendations(profile);

    return {
      matches,
      profile,
      threat_score,
      recommendations
    };
  }

  /**
   * Compare TTP profiles to identify actor patterns
   */
  static compareTTPProfiles(
    profile1: TTPProfile,
    profile2: TTPProfile
  ): {
    similarity: number;
    common_ttps: string[];
    unique_to_profile1: string[];
    unique_to_profile2: string[];
  } {
    const ttps1 = new Set(profile1.ttps.map(t => t.id));
    const ttps2 = new Set(profile2.ttps.map(t => t.id));

    const common_ttps = [...ttps1].filter(t => ttps2.has(t));
    const unique_to_profile1 = [...ttps1].filter(t => !ttps2.has(t));
    const unique_to_profile2 = [...ttps2].filter(t => !ttps1.has(t));

    // Jaccard similarity
    const union = new Set([...ttps1, ...ttps2]);
    const similarity = common_ttps.length / union.size;

    return {
      similarity,
      common_ttps,
      unique_to_profile1,
      unique_to_profile2
    };
  }

  /**
   * Map indicators to MITRE ATT&CK TTPs
   */
  static mapIndicatorsToTTPs(indicators: Array<{
    type: string;
    value: string;
    context?: string;
  }>): Map<string, TTPMatch[]> {
    const ttpMap = new Map<string, TTPMatch[]>();

    indicators.forEach(indicator => {
      const matches = this.matchIndicatorToTTP(indicator);

      matches.forEach(match => {
        if (!ttpMap.has(match.ttp.id)) {
          ttpMap.set(match.ttp.id, []);
        }
        ttpMap.get(match.ttp.id)!.push(match);
      });
    });

    return ttpMap;
  }

  /**
   * Identify TTP gaps in defensive coverage
   */
  static identifyDefensiveGaps(
    observedTTPs: string[],
    coverage: Record<string, boolean>
  ): Array<{
    ttp_id: string;
    ttp_name: string;
    tactic: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    mitigation_suggestions: string[];
  }> {
    const gaps: Array<{
      ttp_id: string;
      ttp_name: string;
      tactic: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      mitigation_suggestions: string[];
    }> = [];

    observedTTPs.forEach(ttpId => {
      if (!coverage[ttpId]) {
        const ttp = this.TTP_DATABASE[ttpId];
        if (ttp) {
          gaps.push({
            ttp_id: ttpId,
            ttp_name: ttp.name,
            tactic: ttp.tactic || 'Unknown',
            priority: this.calculateGapPriority(ttp),
            mitigation_suggestions: this.getMitigations(ttpId)
          });
        }
      }
    });

    return gaps.sort((a, b) => this.priorityToNumeric(b.priority) - this.priorityToNumeric(a.priority));
  }

  /**
   * Generate TTP-based detection rules
   */
  static generateDetectionRules(ttp_id: string): Array<{
    rule_type: 'SIGMA' | 'YARA' | 'SNORT' | 'SURICATA';
    rule_content: string;
    description: string;
  }> {
    const ttp = this.TTP_DATABASE[ttp_id];
    if (!ttp) return [];

    const rules: Array<{
      rule_type: 'SIGMA' | 'YARA' | 'SNORT' | 'SURICATA';
      rule_content: string;
      description: string;
    }> = [];

    // Generate Sigma rule
    if (ttp.detection_methods?.includes('Process monitoring')) {
      rules.push({
        rule_type: 'SIGMA',
        rule_content: this.generateSigmaRule(ttp),
        description: `Sigma rule for detecting ${ttp.name}`
      });
    }

    // Generate YARA rule
    if (ttp.technique?.includes('Script') || ttp.technique?.includes('Command')) {
      rules.push({
        rule_type: 'YARA',
        rule_content: this.generateYaraRule(ttp),
        description: `YARA rule for detecting ${ttp.name}`
      });
    }

    return rules;
  }

  /**
   * Track TTP evolution over time
   */
  static trackTTPEvolution(
    historical: Array<{ date: string; ttps: string[] }>
  ): {
    trending_up: string[];
    trending_down: string[];
    new_ttps: string[];
    deprecated_ttps: string[];
  } {
    if (historical.length < 2) {
      return { trending_up: [], trending_down: [], new_ttps: [], deprecated_ttps: [] };
    }

    const recent = historical[historical.length - 1].ttps;
    const previous = historical[historical.length - 2].ttps;

    const recentSet = new Set(recent);
    const previousSet = new Set(previous);

    const new_ttps = recent.filter(t => !previousSet.has(t));
    const deprecated_ttps = previous.filter(t => !recentSet.has(t));

    // Calculate trends (simplified)
    const commonTTPs = recent.filter(t => previousSet.has(t));
    const trending_up = commonTTPs.slice(0, Math.ceil(commonTTPs.length / 3));
    const trending_down = commonTTPs.slice(-Math.ceil(commonTTPs.length / 3));

    return { trending_up, trending_down, new_ttps, deprecated_ttps };
  }

  // Helper methods
  private static matchBehaviorToTTP(behavior: string): TTPMatch[] {
    const matches: TTPMatch[] = [];
    const lowerBehavior = behavior.toLowerCase();

    // Simple keyword matching (in production, use ML/NLP)
    Object.values(this.TTP_DATABASE).forEach(ttp => {
      let confidence = 0;
      const evidence: string[] = [];

      // Check name match
      if (lowerBehavior.includes(ttp.name.toLowerCase())) {
        confidence += 0.6;
        evidence.push(`Behavior matches TTP name: ${ttp.name}`);
      }

      // Check technique match
      if (ttp.technique && lowerBehavior.includes(ttp.technique.toLowerCase())) {
        confidence += 0.3;
        evidence.push(`Behavior matches technique: ${ttp.technique}`);
      }

      // Check tactic match
      if (ttp.tactic && lowerBehavior.includes(ttp.tactic.toLowerCase())) {
        confidence += 0.1;
        evidence.push(`Behavior related to tactic: ${ttp.tactic}`);
      }

      if (confidence > 0.5) {
        matches.push({
          ttp,
          confidence: Math.min(confidence, 1.0),
          evidence,
          related_ttps: this.findRelatedTTPs(ttp.id)
        });
      }
    });

    return matches;
  }

  private static matchIndicatorToTTP(indicator: {
    type: string;
    value: string;
    context?: string;
  }): TTPMatch[] {
    const matches: TTPMatch[] = [];

    // Map indicator types to TTPs
    const typeMapping: Record<string, string[]> = {
      'IP': ['T1071', 'T1041'],
      'Domain': ['T1071', 'T1583'],
      'Hash': ['T1059', 'T1204'],
      'Email': ['T1566'],
      'Registry': ['T1547', 'T1112']
    };

    const potentialTTPs = typeMapping[indicator.type] || [];

    potentialTTPs.forEach(ttpId => {
      const ttp = this.TTP_DATABASE[ttpId];
      if (ttp) {
        matches.push({
          ttp,
          confidence: 0.75,
          evidence: [`Indicator type ${indicator.type} commonly associated with ${ttp.name}`],
          related_ttps: this.findRelatedTTPs(ttpId)
        });
      }
    });

    return matches;
  }

  private static buildTTPProfile(matches: TTPMatch[]): TTPProfile {
    const uniqueTTPs = Array.from(
      new Map(matches.map(m => [m.ttp.id, m.ttp])).values()
    );

    // Calculate tactics coverage
    const tactics_coverage: Record<string, number> = {};
    uniqueTTPs.forEach(ttp => {
      if (ttp.tactic) {
        tactics_coverage[ttp.tactic] = (tactics_coverage[ttp.tactic] || 0) + 1;
      }
    });

    // Calculate sophistication score
    const sophistication_score = this.calculateSophistication(uniqueTTPs);

    // Identify common patterns
    const common_patterns = this.identifyPatterns(uniqueTTPs);

    // Identify defensive gaps
    const defensive_gaps = this.identifyGaps(tactics_coverage);

    return {
      ttps: uniqueTTPs,
      tactics_coverage,
      sophistication_score,
      common_patterns,
      defensive_gaps
    };
  }

  private static calculateThreatScore(profile: TTPProfile): number {
    let score = 0;

    // More TTPs = higher threat
    score += Math.min(30, profile.ttps.length * 3);

    // Tactic diversity
    score += Math.min(30, Object.keys(profile.tactics_coverage).length * 5);

    // Sophistication
    score += profile.sophistication_score * 0.4;

    return Math.min(100, Math.round(score));
  }

  private static calculateSophistication(ttps: TTP[]): number {
    // More diverse tactics and advanced techniques = higher sophistication
    const tactics = new Set(ttps.map(t => t.tactic));
    const tacticDiversity = tactics.size / 14; // 14 total tactics in MITRE

    // Check for advanced TTPs
    const advancedTTPs = ttps.filter(t =>
      t.name.includes('Injection') ||
      t.name.includes('Evasion') ||
      t.name.includes('Obfuscation')
    );
    const advancedRatio = advancedTTPs.length / ttps.length;

    return Math.round((tacticDiversity * 50 + advancedRatio * 50));
  }

  private static identifyPatterns(ttps: TTP[]): string[] {
    const patterns: string[] = [];

    // Check for common attack patterns
    const tactics = ttps.map(t => t.tactic);

    if (tactics.includes('Initial Access') && tactics.includes('Execution')) {
      patterns.push('Initial compromise sequence detected');
    }

    if (tactics.includes('Persistence') && tactics.includes('Privilege Escalation')) {
      patterns.push('Post-exploitation behavior');
    }

    if (tactics.includes('Command and Control') && tactics.includes('Exfiltration')) {
      patterns.push('Data theft operation');
    }

    return patterns;
  }

  private static identifyGaps(tactics_coverage: Record<string, number>): string[] {
    const gaps: string[] = [];

    // Identify missing defensive coverage
    const criticalTactics = ['Defense Evasion', 'Credential Access', 'Lateral Movement'];

    criticalTactics.forEach(tactic => {
      if (!tactics_coverage[tactic]) {
        gaps.push(`No detection for ${tactic} tactics`);
      }
    });

    return gaps;
  }

  private static generateRecommendations(profile: TTPProfile): string[] {
    const recommendations: string[] = [];

    // Recommendations based on TTPs
    if (profile.ttps.some(t => t.id === 'T1566')) {
      recommendations.push('Implement advanced email security and user awareness training');
    }

    if (profile.ttps.some(t => t.tactic === 'Persistence')) {
      recommendations.push('Deploy endpoint detection and response (EDR) solutions');
    }

    if (profile.ttps.some(t => t.tactic === 'Command and Control')) {
      recommendations.push('Enhance network monitoring and implement egress filtering');
    }

    // General recommendations
    if (profile.sophistication_score > 70) {
      recommendations.push('Threat actor shows high sophistication - increase security posture');
    }

    if (profile.defensive_gaps.length > 0) {
      recommendations.push(`Address defensive gaps: ${profile.defensive_gaps.join(', ')}`);
    }

    return recommendations;
  }

  private static findRelatedTTPs(ttpId: string): string[] {
    // Return TTPs in the same tactic
    const ttp = this.TTP_DATABASE[ttpId];
    if (!ttp || !ttp.tactic) return [];

    return Object.values(this.TTP_DATABASE)
      .filter(t => t.tactic === ttp.tactic && t.id !== ttpId)
      .map(t => t.id);
  }

  private static calculateGapPriority(ttp: TTP): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalTactics = ['Initial Access', 'Execution', 'Command and Control', 'Exfiltration'];

    if (ttp.tactic && criticalTactics.includes(ttp.tactic)) {
      return 'CRITICAL';
    }

    return 'MEDIUM';
  }

  private static getMitigations(ttp_id: string): string[] {
    const mitigations: Record<string, string[]> = {
      'T1566': ['Email filtering', 'User training', 'DMARC/DKIM/SPF'],
      'T1059': ['Application whitelisting', 'PowerShell logging', 'Execution prevention'],
      'T1547': ['Disable unnecessary autostart', 'Monitor registry', 'Endpoint protection'],
      'T1078': ['MFA', 'Privileged access management', 'Account monitoring'],
      'T1071': ['Network segmentation', 'SSL/TLS inspection', 'C2 detection'],
      'T1041': ['Data loss prevention', 'Network monitoring', 'Egress filtering']
    };

    return mitigations[ttp_id] || ['Implement security best practices'];
  }

  private static priorityToNumeric(priority: string): number {
    const map: Record<string, number> = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    return map[priority] || 0;
  }

  private static generateSigmaRule(ttp: TTP): string {
    return `title: Detect ${ttp.name}
description: Detection for MITRE ATT&CK technique ${ttp.id}
logsource:
  product: windows
detection:
  selection:
    EventID: 1
  condition: selection`;
  }

  private static generateYaraRule(ttp: TTP): string {
    return `rule ${ttp.id.replace('.', '_')}_Detection {
  meta:
    description = "Detect ${ttp.name}"
    technique = "${ttp.id}"
  strings:
    $s1 = "${ttp.name.toLowerCase()}" nocase
  condition:
    $s1
}`;
  }
}

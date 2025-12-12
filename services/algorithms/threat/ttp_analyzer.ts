/**
 * TTP (Tactics, Techniques, and Procedures) Analyzer
 *
 * Analyzes and maps threat behaviors to MITRE ATT&CK framework
 *
 * Time Complexity: O(n * m) where n is behaviors, m is techniques
 * Space Complexity: O(k) where k is matched TTPs
 *
 * Use Cases:
 * - MITRE ATT&CK mapping
 * - Threat behavior analysis
 * - Attack pattern recognition
 * - Threat hunting queries
 * - Incident response playbook selection
 */

export interface TTP {
  id: string;
  name: string;
  tactic: string;
  technique: string;
  subTechnique?: string;
  confidence: number;
  severity: number;
  indicators: string[];
  metadata?: Record<string, any>;
}

export interface AttackPattern {
  tactics: string[];
  techniques: string[];
  procedures: string[];
  killChainPhase?: string;
  confidence: number;
}

export interface TTPMatch {
  ttp: TTP;
  matchedIndicators: string[];
  confidence: number;
  context?: string;
}

export interface AnalysisResult {
  matches: TTPMatch[];
  attackPattern: AttackPattern;
  threatProfile: ThreatProfile;
  recommendations: string[];
  summary: {
    totalTTPs: number;
    highConfidence: number;
    tactics: string[];
    techniques: string[];
    coverage: number;
  };
}

export interface ThreatProfile {
  sophistication: 'LOW' | 'MEDIUM' | 'HIGH' | 'ADVANCED';
  vectorTypes: string[];
  targetedAssets: string[];
  persistenceMethods: string[];
  lateralMovement: boolean;
  dataExfiltration: boolean;
  impactScore: number;
}

export interface BehaviorInput {
  type: 'process' | 'network' | 'file' | 'registry' | 'command' | 'other';
  action: string;
  details: Record<string, any>;
  timestamp?: number;
}

/**
 * Advanced TTP Analysis Engine
 */
export class TTPAnalyzer {
  private ttpDatabase: Map<string, TTP>;
  private tacticMap: Map<string, string[]>;

  constructor() {
    this.ttpDatabase = this.buildTTPDatabase();
    this.tacticMap = this.buildTacticMap();
  }

  /**
   * Analyze behaviors and map to TTPs
   */
  analyze(behaviors: BehaviorInput[], options: { minConfidence?: number } = {}): AnalysisResult {
    const { minConfidence = 0.5 } = options;
    const matches: TTPMatch[] = [];

    // Match behaviors to TTPs
    for (const behavior of behaviors) {
      const behaviorMatches = this.matchBehavior(behavior);
      matches.push(...behaviorMatches);
    }

    // Filter by confidence
    const filteredMatches = matches.filter(m => m.confidence >= minConfidence);

    // Deduplicate and aggregate
    const uniqueMatches = this.deduplicateMatches(filteredMatches);

    // Build attack pattern
    const attackPattern = this.buildAttackPattern(uniqueMatches);

    // Generate threat profile
    const threatProfile = this.generateThreatProfile(uniqueMatches, attackPattern);

    // Generate recommendations
    const recommendations = this.generateRecommendations(uniqueMatches, threatProfile);

    // Generate summary
    const summary = this.generateSummary(uniqueMatches, attackPattern);

    return {
      matches: uniqueMatches,
      attackPattern,
      threatProfile,
      recommendations,
      summary
    };
  }

  /**
   * Match single behavior to TTPs
   */
  private matchBehavior(behavior: BehaviorInput): TTPMatch[] {
    const matches: TTPMatch[] = [];

    for (const [id, ttp] of this.ttpDatabase.entries()) {
      const match = this.calculateMatch(behavior, ttp);
      if (match.confidence > 0) {
        matches.push(match);
      }
    }

    return matches;
  }

  /**
   * Calculate match confidence between behavior and TTP
   */
  private calculateMatch(behavior: BehaviorInput, ttp: TTP): TTPMatch {
    let confidence = 0;
    const matchedIndicators: string[] = [];

    const behaviorText = JSON.stringify(behavior).toLowerCase();

    // Check indicators
    for (const indicator of ttp.indicators) {
      if (behaviorText.includes(indicator.toLowerCase())) {
        matchedIndicators.push(indicator);
        confidence += 0.2;
      }
    }

    // Type-specific matching
    confidence += this.calculateTypeSpecificMatch(behavior, ttp);

    // Normalize confidence
    confidence = Math.min(confidence, 1.0);

    return {
      ttp,
      matchedIndicators,
      confidence,
      context: behavior.action
    };
  }

  /**
   * Calculate type-specific match score
   */
  private calculateTypeSpecificMatch(behavior: BehaviorInput, ttp: TTP): number {
    let score = 0;

    // Process-based techniques
    if (behavior.type === 'process') {
      if (ttp.technique.includes('Process') || ttp.technique.includes('Execution')) {
        score += 0.3;
      }
    }

    // Network-based techniques
    if (behavior.type === 'network') {
      if (ttp.technique.includes('Network') || ttp.technique.includes('Command and Control')) {
        score += 0.3;
      }
    }

    // File-based techniques
    if (behavior.type === 'file') {
      if (ttp.technique.includes('File') || ttp.technique.includes('Persistence')) {
        score += 0.3;
      }
    }

    // Registry-based techniques
    if (behavior.type === 'registry') {
      if (ttp.technique.includes('Registry') || ttp.technique.includes('Persistence')) {
        score += 0.3;
      }
    }

    // Command execution
    if (behavior.type === 'command') {
      if (ttp.technique.includes('Command') || ttp.technique.includes('Execution')) {
        score += 0.3;
      }
    }

    return score;
  }

  /**
   * Deduplicate TTP matches
   */
  private deduplicateMatches(matches: TTPMatch[]): TTPMatch[] {
    const deduped = new Map<string, TTPMatch>();

    for (const match of matches) {
      const existing = deduped.get(match.ttp.id);
      if (!existing || match.confidence > existing.confidence) {
        deduped.set(match.ttp.id, match);
      }
    }

    return Array.from(deduped.values()).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Build attack pattern from matches
   */
  private buildAttackPattern(matches: TTPMatch[]): AttackPattern {
    const tactics = new Set<string>();
    const techniques = new Set<string>();
    const procedures = new Set<string>();

    for (const match of matches) {
      tactics.add(match.ttp.tactic);
      techniques.add(match.ttp.technique);
      if (match.context) {
        procedures.add(match.context);
      }
    }

    // Determine kill chain phase
    const killChainPhase = this.determineKillChainPhase(Array.from(tactics));

    // Calculate overall confidence
    const avgConfidence = matches.length > 0
      ? matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length
      : 0;

    return {
      tactics: Array.from(tactics),
      techniques: Array.from(techniques),
      procedures: Array.from(procedures),
      killChainPhase,
      confidence: avgConfidence
    };
  }

  /**
   * Determine kill chain phase from tactics
   */
  private determineKillChainPhase(tactics: string[]): string {
    const phases = [
      'Reconnaissance',
      'Initial Access',
      'Execution',
      'Persistence',
      'Privilege Escalation',
      'Defense Evasion',
      'Credential Access',
      'Discovery',
      'Lateral Movement',
      'Collection',
      'Exfiltration',
      'Impact'
    ];

    for (const phase of phases) {
      if (tactics.includes(phase)) {
        return phase;
      }
    }

    return 'Unknown';
  }

  /**
   * Generate threat profile
   */
  private generateThreatProfile(matches: TTPMatch[], pattern: AttackPattern): ThreatProfile {
    const sophistication = this.calculateSophistication(matches, pattern);
    const vectorTypes = this.identifyVectorTypes(matches);
    const targetedAssets = this.identifyTargetedAssets(matches);
    const persistenceMethods = this.identifyPersistenceMethods(matches);

    const lateralMovement = pattern.tactics.includes('Lateral Movement');
    const dataExfiltration = pattern.tactics.includes('Exfiltration');

    const impactScore = this.calculateImpactScore(matches, pattern);

    return {
      sophistication,
      vectorTypes,
      targetedAssets,
      persistenceMethods,
      lateralMovement,
      dataExfiltration,
      impactScore
    };
  }

  /**
   * Calculate sophistication level
   */
  private calculateSophistication(matches: TTPMatch[], pattern: AttackPattern): ThreatProfile['sophistication'] {
    let score = 0;

    // Number of tactics
    score += pattern.tactics.length * 5;

    // Advanced techniques
    const advancedTechniques = ['Defense Evasion', 'Privilege Escalation', 'Lateral Movement'];
    for (const tactic of pattern.tactics) {
      if (advancedTechniques.includes(tactic)) score += 10;
    }

    // Number of techniques
    score += pattern.techniques.length * 2;

    if (score < 20) return 'LOW';
    if (score < 40) return 'MEDIUM';
    if (score < 60) return 'HIGH';
    return 'ADVANCED';
  }

  /**
   * Identify attack vector types
   */
  private identifyVectorTypes(matches: TTPMatch[]): string[] {
    const vectors = new Set<string>();

    for (const match of matches) {
      if (match.ttp.tactic === 'Initial Access') {
        vectors.add('Initial Access');
      }
      if (match.ttp.technique.includes('Phishing')) {
        vectors.add('Phishing');
      }
      if (match.ttp.technique.includes('Exploit')) {
        vectors.add('Exploitation');
      }
      if (match.ttp.technique.includes('Valid Accounts')) {
        vectors.add('Credential Compromise');
      }
    }

    return Array.from(vectors);
  }

  /**
   * Identify targeted assets
   */
  private identifyTargetedAssets(matches: TTPMatch[]): string[] {
    const assets = new Set<string>();

    for (const match of matches) {
      if (match.ttp.technique.includes('File') || match.ttp.technique.includes('Data')) {
        assets.add('Data');
      }
      if (match.ttp.technique.includes('Credential')) {
        assets.add('Credentials');
      }
      if (match.ttp.technique.includes('System') || match.ttp.technique.includes('Process')) {
        assets.add('Systems');
      }
      if (match.ttp.technique.includes('Network')) {
        assets.add('Network');
      }
    }

    return Array.from(assets);
  }

  /**
   * Identify persistence methods
   */
  private identifyPersistenceMethods(matches: TTPMatch[]): string[] {
    const methods = new Set<string>();

    for (const match of matches) {
      if (match.ttp.tactic === 'Persistence') {
        methods.add(match.ttp.technique);
      }
    }

    return Array.from(methods);
  }

  /**
   * Calculate impact score
   */
  private calculateImpactScore(matches: TTPMatch[], pattern: AttackPattern): number {
    let score = 0;

    // Impact from tactics
    if (pattern.tactics.includes('Impact')) score += 30;
    if (pattern.tactics.includes('Exfiltration')) score += 25;
    if (pattern.tactics.includes('Lateral Movement')) score += 20;

    // Impact from severity
    for (const match of matches) {
      score += match.ttp.severity * 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(matches: TTPMatch[], profile: ThreatProfile): string[] {
    const recommendations: string[] = [];

    // Based on sophistication
    if (profile.sophistication === 'ADVANCED') {
      recommendations.push('Engage advanced threat hunting team');
      recommendations.push('Consider threat intelligence sharing');
    }

    // Based on tactics
    for (const match of matches) {
      switch (match.ttp.tactic) {
        case 'Persistence':
          recommendations.push('Review and harden persistence mechanisms');
          break;
        case 'Privilege Escalation':
          recommendations.push('Audit and restrict administrative privileges');
          break;
        case 'Defense Evasion':
          recommendations.push('Enhance detection capabilities and logging');
          break;
        case 'Credential Access':
          recommendations.push('Implement credential hardening and MFA');
          break;
        case 'Lateral Movement':
          recommendations.push('Implement network segmentation and monitoring');
          break;
        case 'Exfiltration':
          recommendations.push('Enable DLP and egress monitoring');
          break;
      }
    }

    // Deduplicate
    return Array.from(new Set(recommendations));
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(matches: TTPMatch[], pattern: AttackPattern): AnalysisResult['summary'] {
    const highConfidence = matches.filter(m => m.confidence >= 0.8).length;
    const coverage = pattern.tactics.length / 12; // 12 MITRE tactics

    return {
      totalTTPs: matches.length,
      highConfidence,
      tactics: pattern.tactics,
      techniques: pattern.techniques,
      coverage
    };
  }

  /**
   * Build TTP database (simplified MITRE ATT&CK mapping)
   */
  private buildTTPDatabase(): Map<string, TTP> {
    const ttps = new Map<string, TTP>();

    // Initial Access
    ttps.set('T1566', {
      id: 'T1566',
      name: 'Phishing',
      tactic: 'Initial Access',
      technique: 'Phishing',
      confidence: 0.8,
      severity: 0.7,
      indicators: ['phishing', 'email', 'malicious attachment', 'spear phishing']
    });

    ttps.set('T1190', {
      id: 'T1190',
      name: 'Exploit Public-Facing Application',
      tactic: 'Initial Access',
      technique: 'Exploit Public-Facing Application',
      confidence: 0.9,
      severity: 0.9,
      indicators: ['exploit', 'vulnerability', 'web application', 'sql injection', 'remote code execution']
    });

    // Execution
    ttps.set('T1059', {
      id: 'T1059',
      name: 'Command and Scripting Interpreter',
      tactic: 'Execution',
      technique: 'Command and Scripting Interpreter',
      confidence: 0.85,
      severity: 0.8,
      indicators: ['powershell', 'cmd', 'bash', 'python', 'script', 'command line']
    });

    ttps.set('T1203', {
      id: 'T1203',
      name: 'Exploitation for Client Execution',
      tactic: 'Execution',
      technique: 'Exploitation for Client Execution',
      confidence: 0.9,
      severity: 0.85,
      indicators: ['exploit', 'buffer overflow', 'remote code', 'shellcode']
    });

    // Persistence
    ttps.set('T1053', {
      id: 'T1053',
      name: 'Scheduled Task/Job',
      tactic: 'Persistence',
      technique: 'Scheduled Task/Job',
      confidence: 0.8,
      severity: 0.7,
      indicators: ['scheduled task', 'cron', 'at command', 'task scheduler']
    });

    ttps.set('T1547', {
      id: 'T1547',
      name: 'Boot or Logon Autostart Execution',
      tactic: 'Persistence',
      technique: 'Boot or Logon Autostart Execution',
      confidence: 0.85,
      severity: 0.75,
      indicators: ['registry run key', 'startup folder', 'autostart', 'boot']
    });

    // Privilege Escalation
    ttps.set('T1068', {
      id: 'T1068',
      name: 'Exploitation for Privilege Escalation',
      tactic: 'Privilege Escalation',
      technique: 'Exploitation for Privilege Escalation',
      confidence: 0.9,
      severity: 0.9,
      indicators: ['privilege escalation', 'elevation', 'exploit', 'kernel exploit']
    });

    // Defense Evasion
    ttps.set('T1055', {
      id: 'T1055',
      name: 'Process Injection',
      tactic: 'Defense Evasion',
      technique: 'Process Injection',
      confidence: 0.85,
      severity: 0.8,
      indicators: ['process injection', 'dll injection', 'code injection', 'hollowing']
    });

    ttps.set('T1027', {
      id: 'T1027',
      name: 'Obfuscated Files or Information',
      tactic: 'Defense Evasion',
      technique: 'Obfuscated Files or Information',
      confidence: 0.75,
      severity: 0.7,
      indicators: ['obfuscation', 'encoded', 'encrypted', 'packed']
    });

    // Credential Access
    ttps.set('T1003', {
      id: 'T1003',
      name: 'OS Credential Dumping',
      tactic: 'Credential Access',
      technique: 'OS Credential Dumping',
      confidence: 0.9,
      severity: 0.95,
      indicators: ['credential dump', 'mimikatz', 'lsass', 'sam database', 'password hash']
    });

    // Discovery
    ttps.set('T1057', {
      id: 'T1057',
      name: 'Process Discovery',
      tactic: 'Discovery',
      technique: 'Process Discovery',
      confidence: 0.7,
      severity: 0.5,
      indicators: ['process list', 'tasklist', 'ps', 'get-process']
    });

    // Lateral Movement
    ttps.set('T1021', {
      id: 'T1021',
      name: 'Remote Services',
      tactic: 'Lateral Movement',
      technique: 'Remote Services',
      confidence: 0.85,
      severity: 0.8,
      indicators: ['rdp', 'ssh', 'smb', 'winrm', 'remote desktop', 'psexec']
    });

    // Collection
    ttps.set('T1005', {
      id: 'T1005',
      name: 'Data from Local System',
      tactic: 'Collection',
      technique: 'Data from Local System',
      confidence: 0.75,
      severity: 0.7,
      indicators: ['file access', 'data collection', 'sensitive files', 'documents']
    });

    // Exfiltration
    ttps.set('T1041', {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      tactic: 'Exfiltration',
      technique: 'Exfiltration Over C2 Channel',
      confidence: 0.85,
      severity: 0.9,
      indicators: ['data exfiltration', 'upload', 'outbound transfer', 'c2 communication']
    });

    // Impact
    ttps.set('T1486', {
      id: 'T1486',
      name: 'Data Encrypted for Impact',
      tactic: 'Impact',
      technique: 'Data Encrypted for Impact',
      confidence: 0.95,
      severity: 1.0,
      indicators: ['ransomware', 'encryption', 'encrypted files', 'ransom note']
    });

    return ttps;
  }

  /**
   * Build tactic to technique mapping
   */
  private buildTacticMap(): Map<string, string[]> {
    const map = new Map<string, string[]>();

    map.set('Initial Access', ['T1566', 'T1190', 'T1133']);
    map.set('Execution', ['T1059', 'T1203', 'T1204']);
    map.set('Persistence', ['T1053', 'T1547', 'T1543']);
    map.set('Privilege Escalation', ['T1068', 'T1078', 'T1134']);
    map.set('Defense Evasion', ['T1055', 'T1027', 'T1070']);
    map.set('Credential Access', ['T1003', 'T1110', 'T1555']);
    map.set('Discovery', ['T1057', 'T1082', 'T1083']);
    map.set('Lateral Movement', ['T1021', 'T1210', 'T1534']);
    map.set('Collection', ['T1005', 'T1113', 'T1114']);
    map.set('Exfiltration', ['T1041', 'T1048', 'T1567']);
    map.set('Command and Control', ['T1071', 'T1095', 'T1571']);
    map.set('Impact', ['T1486', 'T1490', 'T1498']);

    return map;
  }
}

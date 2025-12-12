/**
 * Kill Chain Mapper - Map threats and activities to cyber kill chain phases
 * Supports both Lockheed Martin and MITRE ATT&CK frameworks
 */

interface KillChainPhase {
  phase_number: number;
  name: string;
  description: string;
  indicators: string[];
  mitre_tactics?: string[];
}

interface KillChainMapping {
  indicator: string;
  matched_phases: KillChainPhase[];
  primary_phase: KillChainPhase;
  confidence: number;
  framework: 'LOCKHEED_MARTIN' | 'MITRE_ATTACK' | 'UNIFIED';
  next_likely_phases: KillChainPhase[];
}

interface AttackTimeline {
  phases: Array<{
    phase: KillChainPhase;
    timestamp?: string;
    activities: string[];
    ttps: string[];
  }>;
  current_phase: number;
  completion_percentage: number;
  estimated_next_phase: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class KillChainMapper {
  // Lockheed Martin Cyber Kill Chain
  private static readonly LOCKHEED_MARTIN_CHAIN: KillChainPhase[] = [
    {
      phase_number: 1,
      name: 'Reconnaissance',
      description: 'Researching, identifying and selecting targets',
      indicators: ['port scan', 'network scan', 'osint', 'enumeration', 'footprinting', 'whois', 'dns query'],
      mitre_tactics: ['TA0043']
    },
    {
      phase_number: 2,
      name: 'Weaponization',
      description: 'Creating malicious payload for exploitation',
      indicators: ['malware', 'exploit kit', 'payload', 'backdoor creation', 'trojan', 'dropper'],
      mitre_tactics: ['TA0001']
    },
    {
      phase_number: 3,
      name: 'Delivery',
      description: 'Transmitting the weapon to the target',
      indicators: ['phishing', 'email', 'usb', 'watering hole', 'drive-by download', 'attachment'],
      mitre_tactics: ['TA0001']
    },
    {
      phase_number: 4,
      name: 'Exploitation',
      description: 'Exploiting vulnerability to execute code',
      indicators: ['exploit', 'vulnerability', 'buffer overflow', 'sql injection', 'xss', 'rce', 'cve'],
      mitre_tactics: ['TA0002']
    },
    {
      phase_number: 5,
      name: 'Installation',
      description: 'Installing malware on the target system',
      indicators: ['persistence', 'registry', 'scheduled task', 'service', 'startup', 'backdoor'],
      mitre_tactics: ['TA0003']
    },
    {
      phase_number: 6,
      name: 'Command and Control',
      description: 'Establishing command channel',
      indicators: ['c2', 'c&c', 'beacon', 'callback', 'remote access', 'reverse shell', 'covert channel'],
      mitre_tactics: ['TA0011']
    },
    {
      phase_number: 7,
      name: 'Actions on Objectives',
      description: 'Achieving intended goals',
      indicators: ['exfiltration', 'data theft', 'ransomware', 'destruction', 'denial of service', 'lateral movement'],
      mitre_tactics: ['TA0010', 'TA0040']
    }
  ];

  /**
   * Map indicator or activity to kill chain phase
   */
  static mapToKillChain(
    indicator: string,
    framework: 'LOCKHEED_MARTIN' | 'MITRE_ATTACK' | 'UNIFIED' = 'UNIFIED'
  ): KillChainMapping {
    const lowerIndicator = indicator.toLowerCase();
    const matched_phases: KillChainPhase[] = [];

    // Find matching phases
    this.LOCKHEED_MARTIN_CHAIN.forEach(phase => {
      const matches = phase.indicators.filter(ind =>
        lowerIndicator.includes(ind) || ind.includes(lowerIndicator)
      );

      if (matches.length > 0) {
        matched_phases.push(phase);
      }
    });

    // If no direct match, use keyword analysis
    if (matched_phases.length === 0) {
      const inferredPhase = this.inferPhaseFromContext(lowerIndicator);
      if (inferredPhase) {
        matched_phases.push(inferredPhase);
      }
    }

    // Determine primary phase (earliest in chain)
    const primary_phase = matched_phases.length > 0
      ? matched_phases.reduce((min, phase) =>
          phase.phase_number < min.phase_number ? phase : min
        )
      : this.LOCKHEED_MARTIN_CHAIN[0]; // Default to reconnaissance

    // Calculate confidence
    const confidence = matched_phases.length > 0 ? 0.85 : 0.50;

    // Predict next likely phases
    const next_likely_phases = this.predictNextPhases(primary_phase);

    return {
      indicator,
      matched_phases,
      primary_phase,
      confidence,
      framework,
      next_likely_phases
    };
  }

  /**
   * Build attack timeline from multiple indicators
   */
  static buildAttackTimeline(
    activities: Array<{ indicator: string; timestamp?: string; ttps?: string[] }>
  ): AttackTimeline {
    const phaseMap = new Map<number, {
      phase: KillChainPhase;
      activities: string[];
      ttps: string[];
      timestamps: string[];
    }>();

    // Map each activity to phases
    activities.forEach(activity => {
      const mapping = this.mapToKillChain(activity.indicator);

      const phaseNumber = mapping.primary_phase.phase_number;
      if (!phaseMap.has(phaseNumber)) {
        phaseMap.set(phaseNumber, {
          phase: mapping.primary_phase,
          activities: [],
          ttps: [],
          timestamps: []
        });
      }

      const phaseData = phaseMap.get(phaseNumber)!;
      phaseData.activities.push(activity.indicator);
      if (activity.ttps) phaseData.ttps.push(...activity.ttps);
      if (activity.timestamp) phaseData.timestamps.push(activity.timestamp);
    });

    // Build ordered timeline
    const phases = Array.from(phaseMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([_, data]) => ({
        phase: data.phase,
        timestamp: data.timestamps[0],
        activities: data.activities,
        ttps: [...new Set(data.ttps)]
      }));

    // Calculate current phase and completion
    const current_phase = phases.length > 0 ? phases[phases.length - 1].phase.phase_number : 1;
    const completion_percentage = Math.round((current_phase / 7) * 100);

    // Estimate next phase
    const estimated_next_phase = current_phase < 7
      ? this.LOCKHEED_MARTIN_CHAIN[current_phase].name
      : 'Attack Complete';

    // Determine threat level based on progression
    let threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (current_phase >= 6) threat_level = 'CRITICAL';
    else if (current_phase >= 4) threat_level = 'HIGH';
    else if (current_phase >= 2) threat_level = 'MEDIUM';
    else threat_level = 'LOW';

    return {
      phases,
      current_phase,
      completion_percentage,
      estimated_next_phase,
      threat_level
    };
  }

  /**
   * Map MITRE ATT&CK TTP to kill chain phase
   */
  static mapMitreToKillChain(mitreTTP: string): KillChainMapping {
    // MITRE ATT&CK TTP format: T1xxx
    const ttpLower = mitreTTP.toLowerCase();

    // Map common TTPs to phases
    const ttpPhaseMap: Record<string, number> = {
      // Reconnaissance
      't1595': 1, 't1592': 1, 't1589': 1, 't1590': 1,
      // Initial Access
      't1190': 3, 't1566': 3, 't1078': 3,
      // Execution
      't1059': 4, 't1203': 4, 't1106': 4,
      // Persistence
      't1547': 5, 't1053': 5, 't1543': 5,
      // Command and Control
      't1071': 6, 't1573': 6, 't1090': 6,
      // Exfiltration
      't1041': 7, 't1048': 7, 't1567': 7
    };

    // Extract TTP number
    const ttpMatch = ttpLower.match(/t(\d+)/);
    const ttpNumber = ttpMatch ? ttpMatch[0] : '';

    const phaseNumber = ttpPhaseMap[ttpNumber] || 4; // Default to exploitation
    const primary_phase = this.LOCKHEED_MARTIN_CHAIN[phaseNumber - 1];

    return {
      indicator: mitreTTP,
      matched_phases: [primary_phase],
      primary_phase,
      confidence: 0.9,
      framework: 'MITRE_ATTACK',
      next_likely_phases: this.predictNextPhases(primary_phase)
    };
  }

  /**
   * Identify gaps in attack chain (defensive opportunities)
   */
  static identifyDefensiveGaps(timeline: AttackTimeline): Array<{
    phase: string;
    phase_number: number;
    defensive_actions: string[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }> {
    const gaps: Array<{
      phase: string;
      phase_number: number;
      defensive_actions: string[];
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }> = [];

    const observedPhases = new Set(timeline.phases.map(p => p.phase.phase_number));

    this.LOCKHEED_MARTIN_CHAIN.forEach((phase, index) => {
      if (!observedPhases.has(phase.phase_number) && phase.phase_number > timeline.current_phase) {
        const defensiveActions = this.getDefensiveActions(phase.name);
        const priority = this.calculateDefensivePriority(phase.phase_number, timeline.current_phase);

        gaps.push({
          phase: phase.name,
          phase_number: phase.phase_number,
          defensive_actions: defensiveActions,
          priority
        });
      }
    });

    return gaps;
  }

  /**
   * Visualize kill chain progression
   */
  static visualizeChain(timeline: AttackTimeline): string {
    let visualization = '\n=== CYBER KILL CHAIN PROGRESSION ===\n\n';

    this.LOCKHEED_MARTIN_CHAIN.forEach((phase, index) => {
      const isComplete = timeline.phases.some(p => p.phase.phase_number === phase.phase_number);
      const isCurrent = phase.phase_number === timeline.current_phase;

      const status = isComplete ? '[✓]' : (isCurrent ? '[→]' : '[ ]');
      const marker = isCurrent ? ' <-- CURRENT' : '';

      visualization += `${status} ${phase.phase_number}. ${phase.name}${marker}\n`;

      if (isComplete) {
        const phaseData = timeline.phases.find(p => p.phase.phase_number === phase.phase_number);
        if (phaseData && phaseData.activities.length > 0) {
          visualization += `    └─ Activities: ${phaseData.activities.slice(0, 3).join(', ')}\n`;
        }
      }
    });

    visualization += `\nCompletion: ${timeline.completion_percentage}% | Threat Level: ${timeline.threat_level}\n`;
    visualization += `Next Expected Phase: ${timeline.estimated_next_phase}\n`;

    return visualization;
  }

  /**
   * Get recommended countermeasures for a phase
   */
  static getCountermeasures(phase_name: string): string[] {
    const countermeasures: Record<string, string[]> = {
      'Reconnaissance': [
        'Reduce external footprint',
        'Monitor for scanning activity',
        'Implement threat intelligence',
        'Use honeypots/deception'
      ],
      'Weaponization': [
        'Monitor dark web for mentions',
        'Track emerging exploits',
        'Update threat intelligence'
      ],
      'Delivery': [
        'Email security gateway',
        'Web filtering',
        'User awareness training',
        'Endpoint protection'
      ],
      'Exploitation': [
        'Patch management',
        'Vulnerability scanning',
        'Application whitelisting',
        'Exploit prevention (DEP/ASLR)'
      ],
      'Installation': [
        'Endpoint detection and response (EDR)',
        'Integrity monitoring',
        'Application control',
        'Privilege restriction'
      ],
      'Command and Control': [
        'Network segmentation',
        'Outbound traffic inspection',
        'DNS filtering',
        'C2 beacon detection'
      ],
      'Actions on Objectives': [
        'Data loss prevention (DLP)',
        'Database activity monitoring',
        'Backup and recovery',
        'Incident response plan'
      ]
    };

    return countermeasures[phase_name] || ['Generic security controls'];
  }

  // Helper methods
  private static inferPhaseFromContext(indicator: string): KillChainPhase | null {
    // Keyword-based inference
    if (indicator.includes('scan') || indicator.includes('recon')) {
      return this.LOCKHEED_MARTIN_CHAIN[0];
    }
    if (indicator.includes('phish') || indicator.includes('email') || indicator.includes('deliver')) {
      return this.LOCKHEED_MARTIN_CHAIN[2];
    }
    if (indicator.includes('exploit') || indicator.includes('vulnerability')) {
      return this.LOCKHEED_MARTIN_CHAIN[3];
    }
    if (indicator.includes('persist') || indicator.includes('install')) {
      return this.LOCKHEED_MARTIN_CHAIN[4];
    }
    if (indicator.includes('c2') || indicator.includes('c&c') || indicator.includes('beacon')) {
      return this.LOCKHEED_MARTIN_CHAIN[5];
    }
    if (indicator.includes('exfil') || indicator.includes('data') || indicator.includes('ransom')) {
      return this.LOCKHEED_MARTIN_CHAIN[6];
    }

    return null;
  }

  private static predictNextPhases(currentPhase: KillChainPhase): KillChainPhase[] {
    const nextPhases: KillChainPhase[] = [];
    const currentIndex = currentPhase.phase_number - 1;

    // Add immediate next phase
    if (currentIndex + 1 < this.LOCKHEED_MARTIN_CHAIN.length) {
      nextPhases.push(this.LOCKHEED_MARTIN_CHAIN[currentIndex + 1]);
    }

    // Add phase after that (if exists)
    if (currentIndex + 2 < this.LOCKHEED_MARTIN_CHAIN.length) {
      nextPhases.push(this.LOCKHEED_MARTIN_CHAIN[currentIndex + 2]);
    }

    return nextPhases;
  }

  private static getDefensiveActions(phaseName: string): string[] {
    const actions: Record<string, string[]> = {
      'Reconnaissance': ['Deploy deception technology', 'Monitor external scanning'],
      'Weaponization': ['Track threat actor infrastructure', 'Monitor exploit markets'],
      'Delivery': ['Strengthen email security', 'Deploy web filtering'],
      'Exploitation': ['Apply security patches', 'Harden systems'],
      'Installation': ['Deploy EDR', 'Monitor for persistence'],
      'Command and Control': ['Block known C2 domains', 'Monitor outbound traffic'],
      'Actions on Objectives': ['Deploy DLP', 'Isolate critical assets']
    };

    return actions[phaseName] || ['Deploy appropriate security controls'];
  }

  private static calculateDefensivePriority(
    targetPhase: number,
    currentPhase: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const distance = targetPhase - currentPhase;

    if (distance === 1) return 'CRITICAL'; // Immediate next phase
    if (distance === 2) return 'HIGH';
    if (distance === 3) return 'MEDIUM';
    return 'LOW';
  }
}


interface OsintDomainInput {
  domain: string;
  dns?: string;
  ssl?: string;
  registrar: string;
}

interface OsintProfileInput {
  followers: number;
  status: string;
  bio?: string;
  lastPost: string;
}

interface BreachInput {
  email: string;
  data: string;
  source: string;
}

interface GeoInput {
  ip: string;
  isp?: string;
  ports?: number[];
  city?: string;
  country?: string;
}

interface DarkWebInput {
  price: string;
  status: string;
  title: string;
}

interface DomainAnalysisResult {
  dnsSecurity: { score: number; hasSpf: boolean; hasDmarc: boolean; riskLevel: string };
  typosquats: string[];
  registrarRisk: number;
}

interface IdentityAnalysisResult {
  botProbability: number;
  influence: { score: number; label: string };
}

interface ExposureResult {
  score: number;
  types: string[];
}

interface NetworkAnalysisResult {
  classification: string;
  portRisk: number;
  isProxy: boolean;
  threatContext: string;
}

interface DarkWebAnalysisResult {
  trend: 'UP' | 'DOWN' | 'STABLE';
  markup: number;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class OsintEngine {
  
  // --- Domain Analysis ---
  static analyzeDomain(domain: OsintDomainInput): DomainAnalysisResult {
    const hasSpf = (domain.dns || '').includes('v=spf1');
    const hasDmarc = (domain.dns || '').includes('v=DMARC1');
    
    // Logic migrated from frontend DomainLogic
    const score = (hasSpf ? 30 : 0) + (hasDmarc ? 40 : 0) + (domain.ssl === 'Valid' ? 30 : 0);
    const riskLevel = score < 50 ? 'HIGH' : 'LOW';

    // Typosquatting Generation
    const parts = domain.domain.split('.');
    let squats: string[] = [];
    if (parts.length >= 2) {
        const name = parts[0];
        const tld = parts.slice(1).join('.');
        squats = [
            `${name.replace('l', '1').replace('o', '0')}.${tld}`,
            `${name}s.${tld}`,
            `${name}-login.${tld}`,
            `${name}${name.charAt(name.length-1)}.${tld}`, // Double char logic from frontend
            `my-${name}.${tld}`
        ].filter(s => s !== domain.domain);
    }

    const riskyRegistrars = ['CheapName', 'AnonReg', 'BadHost', 'OffshoreDyn'];
    const registrarRisk = riskyRegistrars.includes(domain.registrar) ? 85 : 10;

    return {
      dnsSecurity: { score, hasSpf, hasDmarc, riskLevel },
      typosquats: squats,
      registrarRisk
    };
  }

  // --- Identity/Social Analysis ---
  static analyzeIdentity(profile: OsintProfileInput): IdentityAnalysisResult {
    // Bot Probability Logic from IdentityLogic
    let botProb = 0;
    if (profile.followers < 10 && profile.status === 'Active') botProb += 40;
    if (!profile.bio) botProb += 20;
    if (profile.lastPost.includes('min') || profile.lastPost.includes('sec')) botProb += 30;

    // Influence Score
    const engagement = profile.followers * 0.1;
    let influenceLabel = 'Standard User';
    let influenceScore = 20;
    if (engagement > 10000) { influenceScore = 95; influenceLabel = 'Mega Influencer'; }
    else if (engagement > 1000) { influenceScore = 75; influenceLabel = 'Micro Influencer'; }

    return {
      botProbability: Math.min(100, botProb),
      influence: { score: influenceScore, label: influenceLabel }
    };
  }

  static analyzeCredentialExposure(email: string, breaches: BreachInput[]): ExposureResult {
    const hits = breaches.filter(b => b.email === email);
    let score = 0;
    const types = new Set<string>();
    
    // Logic from IdentityLogic.calculateCredentialEntropy & risk
    hits.forEach(h => {
        // Simple entropy check on 'data' field simulation
        let entropy = 0;
        if (/[A-Z]/.test(h.data)) entropy += 10;
        if (/[0-9]/.test(h.data)) entropy += 10;
        if (/[^A-Za-z0-9]/.test(h.data)) entropy += 20;
        
        // Risk calculation
        score += (h.data.includes('Pass') || entropy < 30) ? 40 : 20;
        types.add(h.data);
    });
    return { score: Math.min(100, score), types: Array.from(types) };
  }

  // --- Network Analysis ---
  static analyzeNetworkInfra(geo: GeoInput): NetworkAnalysisResult {
    // ISP Classification from NetworkLogic
    const ispLower = (geo.isp || '').toLowerCase();
    let classification = 'BUSINESS';
    if (ispLower.includes('amazon') || ispLower.includes('google') || ispLower.includes('digitalocean')) classification = 'DATACENTER';
    else if (ispLower.includes('comcast') || ispLower.includes('verizon') || ispLower.includes('at&t')) classification = 'RESIDENTIAL';
    else if (ispLower.includes('t-mobile') || ispLower.includes('vodafone')) classification = 'MOBILE';

    // Port Risk
    let portRisk = 0;
    const criticalPorts = [22, 3389, 445, 1433, 3306];
    (geo.ports || []).forEach((p: number) => {
        if (criticalPorts.includes(p)) portRisk += 20;
        else portRisk += 5;
    });

    // Context
    const isProxy = classification === 'DATACENTER';
    const threatContext = `${classification} - Risk: ${Math.min(100, portRisk)}/100`;

    return {
      classification,
      portRisk: Math.min(100, portRisk),
      isProxy,
      threatContext
    };
  }

  static analyzeDarkWebItem(item: DarkWebInput): DarkWebAnalysisResult {
    const price = parseInt(item.price.replace('$', '')) || 0;
    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    let markup = 0;
    
    // Inflation logic from NetworkLogic
    if (item.status === 'Verified' && price > 500) { trend = 'UP'; markup = 25; }
    if (price < 50) { trend = 'DOWN'; markup = -10; }

    let severity: 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    if (markup > 20) severity = 'CRITICAL';
    else if (trend === 'UP') severity = 'HIGH';

    return { trend, markup, severity };
  }
}

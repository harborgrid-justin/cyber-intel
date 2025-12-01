
import { SystemUser, OsintBreach, OsintSocial, VIPProfile, Threat } from '../../types';

export class IntelligenceLogic {
  
  static calculateVIPRisk(user: SystemUser, breaches: OsintBreach[], social: OsintSocial[], threats: Threat[]): VIPProfile {
    const userEmail = user.email || `${user.name.toLowerCase().replace(' ', '.')}@sentinel.co`;
    
    // 1. Credential Exposure
    const relatedBreaches = breaches.filter(b => b.email === userEmail);
    
    // 2. Social Sentiment / Doxxing Risk
    // Fuzzy match handle to name for simulation
    const userHandle = `@${user.name.split(' ')[1].toLowerCase()}`; 
    const socialProfile = social.find(s => s.handle.includes(userHandle) || s.bio.includes(user.name));
    
    let sentimentScore = 0;
    if (socialProfile) {
      if (socialProfile.sentiment === 'Negative') sentimentScore = 40;
      if (socialProfile.sentiment === 'Hostile') sentimentScore = 80;
    }

    // 3. Targeted Threats
    const targetedThreats = threats.filter(t => t.description.includes(user.name) || t.tags?.includes('Executive'));
    
    // Scoring
    const doxxingProb = Math.min(100, sentimentScore + (relatedBreaches.length * 10) + (targetedThreats.length * 20));
    const phishingSusceptibility = Math.min(100, (relatedBreaches.length * 15) + (user.lastLogin ? 0 : 20)); // Dormant accounts are riskier

    return {
      userId: user.id,
      name: user.name,
      title: user.role,
      doxxingProb,
      phishingSusceptibility,
      exposedCreds: relatedBreaches.length,
      sentiment: socialProfile?.sentiment as any || 'Neutral',
      recentMentions: targetedThreats.length + (socialProfile ? 5 : 0)
    };
  }
}

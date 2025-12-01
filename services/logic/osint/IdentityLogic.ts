
import { OsintBreach, OsintSocial, SystemUser } from '../../../types';

export class IdentityLogic {
  static calculateCredentialEntropy(breachData: string): number {
    // Basic entropy heuristic for password strength
    if (!breachData || breachData.includes('Hash')) return 0;
    let entropy = 0;
    if (/[A-Z]/.test(breachData)) entropy += 10;
    if (/[a-z]/.test(breachData)) entropy += 10;
    if (/[0-9]/.test(breachData)) entropy += 10;
    if (/[^A-Za-z0-9]/.test(breachData)) entropy += 20;
    if (breachData.length > 12) entropy += 30;
    return Math.min(100, entropy);
  }

  static detectReusePattern(breaches: OsintBreach[]): boolean {
    // If multiple breaches have the same password prefix/pattern (simulated)
    return breaches.length > 2; 
  }

  static analyzeSocialInfluence(profile: OsintSocial): { score: number, label: string } {
    const engagement = profile.followers * 0.1; // 10% engagement assumption
    if (engagement > 10000) return { score: 95, label: 'Mega Influencer' };
    if (engagement > 1000) return { score: 75, label: 'Micro Influencer' };
    return { score: 20, label: 'Standard User' };
  }

  static calculateDoxxingRisk(user: SystemUser, social: OsintSocial[]): number {
    let risk = 0;
    const targets = social.filter(s => s.bio.includes(user.name) || s.handle.includes(user.name.split(' ')[0]));
    if (targets.length > 0) risk += 30;
    if (user.role === 'Admin') risk += 40;
    if (user.isVIP) risk += 20;
    return Math.min(100, risk);
  }

  static predictBot(profile: OsintSocial): number {
    let prob = 0;
    if (profile.followers < 10 && profile.status === 'Active') prob += 40;
    if (profile.bio.length === 0) prob += 20;
    // High frequency posting (simulated via lastPost)
    if (profile.lastPost.includes('min') || profile.lastPost.includes('sec')) prob += 30;
    return Math.min(100, prob);
  }
}

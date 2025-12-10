
import { Threat } from '../../models/intelligence';
import { User } from '../../models/system';
import { Op } from 'sequelize';

// Mock model for Breaches since it wasn't in original models list but referenced in logic
const MOCK_BREACHES = [
  { email: 'ceo@target.com', breach: 'LinkedIn', source: 'Leak', date: '2016' },
  { email: 'admin@sentinel.local', breach: 'Canva', source: 'Leak', date: '2019' }
];

export class SecurityEngine {
  
  static async correlateCredentialLeaks() {
    const users = await (User as any).findAll();
    // In production, query a real Breach table or API
    const breaches = MOCK_BREACHES; 
    
    const hits: { user: string, leak: string }[] = [];
    
    users.forEach((u: any) => {
      // Fuzzy match username to email in breach data
      const match = breaches.find(b => b.email.includes(u.username.split('.')[0].toLowerCase()));
      if (match) {
        hits.push({ user: u.username, leak: match.source });
      }
    });
    
    return hits;
  }

  static async analyzeChatterVolume() {
    const darkWebThreats = await (Threat as any).findAll({
        where: { 
            [Op.or]: [{ source: 'Dark Web' }, { region: 'Dark Web' }] 
        }
    });
    
    const count = darkWebThreats.length;
    
    let volume = 'Low';
    if (count > 10) volume = 'High';
    else if (count > 5) volume = 'Moderate';

    const criticals = darkWebThreats.filter((t: any) => t.severity === 'CRITICAL').length;
    const sentiment = criticals > 0 ? 'Hostile / Targeting' : 'General Chatter';

    return { volume, sentiment };
  }
}

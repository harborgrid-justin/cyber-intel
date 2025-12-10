
import { query } from '../config/database';

export class OsintService {
  static async search(term: string) {
    // Simulate searching across multiple tables
    const threats = await query("SELECT * FROM threats WHERE indicator ILIKE $1", [`%${term}%`]);
    const breaches = await query("SELECT * FROM breaches WHERE email ILIKE $1", [`%${term}%`]);
    const domains = await query("SELECT * FROM domains WHERE domain ILIKE $1", [`%${term}%`]);
    
    return {
      threats: threats.rows,
      breaches: breaches.rows,
      domains: domains.rows
    };
  }

  static async getBreaches() {
    const { rows } = await query('SELECT * FROM breaches LIMIT 50');
    return rows;
  }
}

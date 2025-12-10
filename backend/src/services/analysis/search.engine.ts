
import { Op } from 'sequelize';
import { Threat, Case, Actor } from '../../models/intelligence';
import { Vendor } from '../../models/infrastructure';

export class SearchEngine {
  static async globalSearch(query: string) {
    const q = `%${query}%`;
    // Parallel execution for performance
    const [threats, cases, actors, vendors] = await Promise.all([
      (Threat as any).findAll({ where: { indicator: { [Op.iLike]: q } }, limit: 5 }),
      (Case as any).findAll({ where: { title: { [Op.iLike]: q } }, limit: 5 }),
      (Actor as any).findAll({ where: { name: { [Op.iLike]: q } }, limit: 5 }),
      (Vendor as any).findAll({ where: { name: { [Op.iLike]: q } }, limit: 5 })
    ]);
    
    // Normalize return format for frontend consumption
    const results = [
      ...threats.map((t: any) => ({ type: 'THREAT', val: t })),
      ...cases.map((c: any) => ({ type: 'CASE', val: c })),
      ...actors.map((a: any) => ({ type: 'ACTOR', val: a })),
      ...vendors.map((v: any) => ({ type: 'VENDOR', val: v }))
    ];
    
    return results;
  }
}

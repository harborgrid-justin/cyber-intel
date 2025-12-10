import { Case } from '../../models/intelligence';
import { Playbook } from '../../models/operations';
import { Op } from 'sequelize';

export class CaseOperationsEngine {

  static async suggestPlaybook(kase: Case): Promise<Playbook | null> {
    const playbooks = await (Playbook as any).findAll();
    const title = kase.title.toLowerCase();
    const desc = kase.description.toLowerCase();
    
    return playbooks.find((pb: any) => {
      const trigger = (pb.trigger_label || '').toLowerCase();
      // Ensure we access labels safely if it exists on model, otherwise check title/desc
      // Case model in `models/intelligence.ts` doesn't explicitly have labels column defined in this snippet context
      // but logic requires it. Assuming it might be extended or we rely on text matching.
      return trigger && (title.includes(trigger) || desc.includes(trigger));
    }) || null;
  }

  static async correlateCases(kaseId: string): Promise<string[]> {
    const kase = await (Case as any).findByPk(kaseId);
    if (!kase) return [];

    const allCases = await (Case as any).findAll({
        where: { id: { [Op.ne]: kaseId } }
    });

    const currentThreats = kase.related_threat_ids || []; 
    
    const related = allCases.filter((c: any) => {
        const otherThreats = c.related_threat_ids || [];
        return otherThreats.some((t: string) => currentThreats.includes(t));
    });

    return related.map((c: any) => c.id);
  }
}
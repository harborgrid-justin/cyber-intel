
import { IncidentReport } from '../../types';

export class ContentIndexer {
  static async indexReport(report: IncidentReport) {
    // Only works in PWA context usually (Service Worker)
    if ('index' in (navigator as any)) {
      try {
        await (navigator as any).index.add({
          id: report.id,
          title: report.title,
          description: report.type + ' - ' + report.author,
          category: 'article',
          icons: [{ src: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' }],
          url: `/reports/${report.id}`
        });
        console.log(`[ContentIndex] Registered ${report.id}`);
      } catch (e) {
        console.warn('[ContentIndex] Failed', e);
      }
    }
  }
  
  static async delete(id: string) {
      if ('index' in (navigator as any)) {
          await (navigator as any).index.delete(id);
      }
  }
}

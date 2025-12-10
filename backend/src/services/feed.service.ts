
import { Feed } from '../models/infrastructure';
import { AuditService } from './audit.service';
import { IngestionEngine } from './ingestion/ingestion.engine';

interface CreateFeedInput {
  name: string;
  url: string;
  type: string;
  interval: number;
  configuration?: Record<string, unknown>;
}

interface FeedSyncResult {
  success: boolean;
  threatsIngested: number;
  errors: string[];
}

export class FeedService {
  static async getAll(): Promise<Feed[]> {
    return await (Feed as any).findAll({ order: [['last_sync', 'DESC']] });
  }

  static async register(data: CreateFeedInput, userId: string): Promise<Feed> {
    const id = `FEED-${Date.now()}`;
    const feed = await (Feed as any).create({
      id,
      name: data.name,
      url: data.url,
      type: data.type,
      status: 'ACTIVE',
      interval_min: data.interval,
      configuration: data.configuration || {},
      last_sync: new Date()
    });
    
    await AuditService.log(userId, 'FEED_ADDED', `Registered feed ${data.name}`, id);
    return feed;
  }

  static async triggerSync(id: string, userId: string): Promise<FeedSyncResult | null> {
    const feed = await (Feed as any).findByPk(id);
    if (feed) {
      // Delegate to the enterprise ingestion engine
      const result = await IngestionEngine.processFeed(feed, userId);
      return { ...feed.toJSON(), ...result };
    }
    return null;
  }
}

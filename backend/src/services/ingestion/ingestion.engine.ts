import { Feed } from '../../models/infrastructure';
import { ThreatService } from '../threat.service';
import { AuditService } from '../audit.service';
import { IConnector, IngestionResult } from './types';
import { StixConnector } from './connectors/stix.connector';
import { JsonConnector } from './connectors/json.connector';
import { logger } from '../../utils/logger';

export class IngestionEngine {
  private static connectors: Record<string, IConnector> = {
    'STIX': new StixConnector(),
    'STIX/TAXII': new StixConnector(),
    'JSON': new JsonConnector(),
    'JSON_FEED': new JsonConnector(),
  };

  /**
   * Registers a new connector strategy at runtime
   */
  static registerConnector(type: string, connector: IConnector) {
    this.connectors[type] = connector;
  }

  /**
   * Main entry point to process a feed
   */
  static async processFeed(feed: Feed, triggeredBy: string): Promise<IngestionResult> {
    const result: IngestionResult = { success: false, threatsIngested: 0, errors: [] };
    const connector = this.connectors[feed.type];

    if (!connector) {
      result.errors.push(`No connector found for type: ${feed.type}`);
      logger.warn(`Ingestion failed: No connector for ${feed.type}`);
      return result;
    }

    try {
      logger.info(`Starting ingestion for feed: ${feed.name} (${feed.type})`);
      
      // 1. Fetch
      const rawData = await connector.fetch(feed);
      
      // 2. Parse & Normalize
      const threats = await connector.parse(rawData, feed.configuration);
      
      // 3. Persist
      let count = 0;
      for (const t of threats) {
        // Simple deduplication logic could go here
        await ThreatService.create(t);
        count++;
      }

      // 4. Update Feed State
      feed.last_sync = new Date();
      feed.status = 'ACTIVE';
      await (feed as any).save();

      result.success = true;
      result.threatsIngested = count;
      
      await AuditService.log(
        triggeredBy, 
        'FEED_INGESTION', 
        `Ingested ${count} threats from ${feed.name}`, 
        feed.id
      );

    } catch (err: any) {
      result.errors.push(err.message);
      feed.status = 'ERROR';
      await (feed as any).save();
      
      await AuditService.log(
        triggeredBy, 
        'FEED_ERROR', 
        `Ingestion failed for ${feed.name}: ${err.message}`, 
        feed.id
      );
      logger.error('Ingestion Engine Error', err);
    }

    return result;
  }
}
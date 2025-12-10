
import { Feed } from '../../models/infrastructure';
import { Threat } from '../../models/intelligence';

export interface ConnectorConfig {
  headers?: Record<string, string>;
  auth?: { type: 'BEARER' | 'BASIC' | 'API_KEY'; token?: string; username?: string; password?: string; };
  mapping?: Record<string, string>; // Maps external field -> internal Threat field
  rootPath?: string; // JSONPath to array root
}

export interface IngestionResult {
  success: boolean;
  threatsIngested: number;
  errors: string[];
}

export interface IConnector {
  /**
   * Fetch data from the source
   */
  fetch(feed: Feed): Promise<any>;

  /**
   * Parse raw data into normalized Threat objects
   */
  parse(data: any, config?: ConnectorConfig): Promise<Partial<Threat>[]>;
}

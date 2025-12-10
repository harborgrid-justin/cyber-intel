import fs from 'fs';
import path from 'path';
import { cosineSimilarity } from '../../utils/math';
import { logger } from '../../utils/logger';

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
}

export interface SearchResult extends VectorDocument {
  score: number;
}

const DB_PATH = path.join((process as any).cwd(), 'data', 'vector_store.json');

export class VectorDb {
  private documents: VectorDocument[] = [];
  private static instance: VectorDb;

  private constructor() {
    this.load();
  }

  static getInstance(): VectorDb {
    if (!VectorDb.instance) {
      VectorDb.instance = new VectorDb();
    }
    return VectorDb.instance;
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        this.documents = JSON.parse(data);
        logger.info(`[VectorDB] Loaded ${this.documents.length} documents.`);
      } else {
        // Ensure directory exists
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        this.documents = [];
      }
    } catch (e) {
      logger.warn('[VectorDB] Failed to load store, starting empty.', e);
      this.documents = [];
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.documents, null, 2));
    } catch (e) {
      logger.error('[VectorDB] Failed to save store.', e);
    }
  }

  public async insert(doc: VectorDocument) {
    // Remove existing with same ID to allow updates
    this.documents = this.documents.filter(d => d.id !== doc.id);
    this.documents.push(doc);
    this.save();
  }

  public async insertBatch(docs: VectorDocument[]) {
    const ids = new Set(docs.map(d => d.id));
    this.documents = this.documents.filter(d => !ids.has(d.id));
    this.documents.push(...docs);
    this.save();
    logger.info(`[VectorDB] Batch inserted ${docs.length} documents.`);
  }

  public search(queryVector: number[], topK: number = 5, filter?: (doc: VectorDocument) => boolean): SearchResult[] {
    let candidates = this.documents;
    
    if (filter) {
      candidates = candidates.filter(filter);
    }

    const scored = candidates.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.embedding)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  public clear() {
    this.documents = [];
    this.save();
    logger.info('[VectorDB] Cleared all documents.');
  }

  public count() {
    return this.documents.length;
  }
}
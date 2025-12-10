
import { GoogleGenAI } from "@google/genai";
import { VectorDb, VectorDocument } from './vector/vector_db';
import { logger } from '../utils/logger';

const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const EMBEDDING_MODEL = 'text-embedding-004';

interface VectorMetadata {
  source: string;
  type: 'THREAT' | 'CASE' | 'ACTOR' | 'REPORT';
  id: string;
  [key: string]: string | number | boolean;
}

export class VectorService {
  private db: VectorDb;

  constructor() {
    this.db = VectorDb.getInstance();
  }

  /**
   * Generates embedding for text using Google GenAI
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const result = await aiClient.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text
      });
      if (!result.embedding?.values) throw new Error('No embedding returned');
      return result.embedding.values;
    } catch (error) {
      logger.error('Failed to generate embedding', error);
      throw error;
    }
  }

  /**
   * Ingest a generic item into the vector store
   */
  async ingestItem(id: string, text: string, metadata: VectorMetadata) {
    const embedding = await this.getEmbedding(text);
    const doc: VectorDocument = {
      id,
      content: text,
      metadata,
      embedding
    };
    await this.db.insert(doc);
    return doc;
  }

  /**
   * Semantic search
   */
  async query(text: string, limit: number = 5, minScore = 0.6) {
    const embedding = await this.getEmbedding(text);
    const results = this.db.search(embedding, limit);
    return results.filter(r => r.score >= minScore);
  }

  /**
   * Batch ingest helper for CLI
   */
  async ingestBatch(items: { id: string; text: string; metadata: VectorMetadata }[]) {
    const docs: VectorDocument[] = [];
    logger.info(`Generating embeddings for ${items.length} items...`);
    
    // Process in chunks to avoid rate limits
    for (const item of items) {
      try {
        const embedding = await this.getEmbedding(item.text);
        docs.push({
          id: item.id,
          content: item.text,
          metadata: item.metadata,
          embedding
        });
        // Small delay to be nice to the API
        await new Promise(r => setTimeout(r, 100)); 
      } catch (e) {
        logger.error(`Skipping item ${item.id} due to embedding error.`);
      }
    }
    
    await this.db.insertBatch(docs);
    return docs.length;
  }

  getStats() {
    return {
      documentCount: this.db.count(),
      backend: 'Embedded (Local JSON)'
    };
  }
}

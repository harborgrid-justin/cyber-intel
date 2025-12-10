import { VectorService } from '../services/vector.service';
import { Threat, Case, Actor } from '../models/intelligence';
import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

const vectorService = new VectorService();

const ingestAll = async () => {
  logger.info('Initializing DB connection...');
  await sequelize.authenticate();
  
  logger.info('Fetching data for ingestion...');
  const threats = await (Threat as any).findAll();
  const cases = await (Case as any).findAll();
  const actors = await (Actor as any).findAll();

  const items = [];

  // Map Threats
  for (const t of threats) {
    items.push({
      id: `threat:${t.id}`,
      text: `Threat Indicator: ${t.indicator}. Type: ${t.type}. Actor: ${t.threat_actor}. Description: ${t.description}`,
      metadata: { source: 'ThreatDB', type: 'THREAT', id: t.id }
    });
  }

  // Map Cases
  for (const c of cases) {
    items.push({
      id: `case:${c.id}`,
      text: `Incident Case: ${c.title}. Priority: ${c.priority}. Status: ${c.status}. Description: ${c.description}`,
      metadata: { source: 'CaseDB', type: 'CASE', id: c.id }
    });
  }

  // Map Actors
  for (const a of actors) {
    items.push({
      id: `actor:${a.id}`,
      text: `Threat Actor: ${a.name}. Origin: ${a.origin}. Sophistication: ${a.sophistication}. Description: ${a.description}`,
      metadata: { source: 'ActorDB', type: 'ACTOR', id: a.id }
    });
  }

  logger.info(`Starting ingestion of ${items.length} items...`);
  await vectorService.ingestBatch(items);
  logger.info('Ingestion complete.');
};

const search = async (query: string) => {
  logger.info(`Searching for: "${query}"`);
  const results = await vectorService.query(query);
  
  console.log('\n=== SEARCH RESULTS ===');
  results.forEach((r, i) => {
    console.log(`\n#${i+1} [Score: ${r.score.toFixed(4)}] (${r.metadata.type})`);
    console.log(`ID: ${r.metadata.id}`);
    console.log(`Content: ${r.content.substring(0, 150)}...`);
  });
  console.log('\n======================\n');
};

const main = async () => {
  const args = (process as any).argv.slice(2);
  const command = args[0];

  try {
    if (command === 'ingest') {
      await ingestAll();
    } else if (command === 'search') {
      const query = args.slice(1).join(' ');
      if (!query) {
        console.error('Please provide a search query.');
        (process as any).exit(1);
      }
      await search(query);
    } else if (command === 'stats') {
      console.log(vectorService.getStats());
    } else {
      console.log('Usage:');
      console.log('  npm run vector:ingest       - Index all DB data');
      console.log('  npm run vector:search "..." - Semantic search');
      console.log('  npm run vector:stats        - Show DB stats');
    }
  } catch (e) {
    logger.error('CLI Error:', e);
    (process as any).exit(1);
  } finally {
    // Force exit to close DB connections
    (process as any).exit(0);
  }
};

main();
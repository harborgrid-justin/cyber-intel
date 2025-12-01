import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { IngestionStore } from './ingestionStore';

@Module({
  controllers: [IngestionController],
  providers: [IngestionService, IngestionStore],
  exports: [IngestionService]
})
export class IngestionModule {}
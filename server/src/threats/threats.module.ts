import { Module } from '@nestjs/common';
import { ThreatsController } from './threats.controller';
import { ThreatsService } from './threats.service';

@Module({
  controllers: [ThreatsController],
  providers: [ThreatsService],
  exports: [ThreatsService],
})
export class ThreatsModule {}

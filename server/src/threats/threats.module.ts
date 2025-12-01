import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThreatsController } from './threats.controller';
import { ThreatsService } from './threats.service';
import { Threat } from '../models/threat.model';

@Module({
  imports: [SequelizeModule.forFeature([Threat])],
  controllers: [ThreatsController],
  providers: [ThreatsService],
  exports: [ThreatsService],
})
export class ThreatsModule {}

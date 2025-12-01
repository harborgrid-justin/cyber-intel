import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OsintResultsService } from './osint-results.service';
import { OsintResultsController } from './osint-results.controller';
import { OsintResult, Case } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([OsintResult, Case])],
  controllers: [OsintResultsController],
  providers: [OsintResultsService],
  exports: [OsintResultsService],
})
export class OsintResultsModule {}
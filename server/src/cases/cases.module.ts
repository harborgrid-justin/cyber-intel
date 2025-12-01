import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from '../models/case.model';

@Module({
  imports: [SequelizeModule.forFeature([Case])],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}

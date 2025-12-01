import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { SystemNode } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([SystemNode])],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
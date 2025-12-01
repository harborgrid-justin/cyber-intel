import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VulnerabilitiesController } from './vulnerabilities.controller';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { Vulnerability } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([Vulnerability])],
  controllers: [VulnerabilitiesController],
  providers: [VulnerabilitiesService],
  exports: [VulnerabilitiesService],
})
export class VulnerabilitiesModule {}
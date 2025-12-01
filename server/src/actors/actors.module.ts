import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActorsController } from './actors.controller';
import { ActorsService } from './actors.service';
import { Actor } from '../models/actor.model';

@Module({
  imports: [SequelizeModule.forFeature([Actor])],
  controllers: [ActorsController],
  providers: [ActorsService],
  exports: [ActorsService],
})
export class ActorsModule {}

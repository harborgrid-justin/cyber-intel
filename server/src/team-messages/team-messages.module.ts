import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TeamMessagesService } from './team-messages.service';
import { TeamMessagesController } from './team-messages.controller';
import { TeamMessage, Channel } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([TeamMessage, Channel])],
  controllers: [TeamMessagesController],
  providers: [TeamMessagesService],
  exports: [TeamMessagesService],
})
export class TeamMessagesModule {}
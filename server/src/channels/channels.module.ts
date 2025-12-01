import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { Channel, TeamMessage } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([Channel, TeamMessage])],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}

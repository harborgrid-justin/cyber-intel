import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Feed } from '../models/feed.model';

@Module({
  imports: [SequelizeModule.forFeature([Feed])],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Feed } from '../models/feed.model';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Feed)
    private readonly feedModel: typeof Feed,
  ) {}

  async getFeeds(): Promise<Feed[]> {
    return this.feedModel.findAll({
      order: [['lastUpdated', 'DESC']],
    });
  }

  async getFeed(id: string): Promise<Feed | null> {
    return this.feedModel.findByPk(id);
  }

  async createFeed(feedData: Partial<Feed>): Promise<Feed> {
    return this.feedModel.create(feedData as any);
  }

  async updateFeed(id: string, updates: Partial<Feed>): Promise<Feed> {
    const feed = await this.feedModel.findByPk(id);
    if (!feed) {
      throw new NotFoundException(`Feed with ID ${id} not found`);
    }
    await feed.update(updates);
    return feed;
  }

  async deleteFeed(id: string): Promise<boolean> {
    const result = await this.feedModel.destroy({ where: { id } });
    return result > 0;
  }

  async syncFeed(id: string): Promise<Feed> {
    const feed = await this.feedModel.findByPk(id);
    if (!feed) {
      throw new NotFoundException(`Feed with ID ${id} not found`);
    }
    await feed.update({ lastUpdated: new Date() });
    return feed;
  }

  async toggleFeedStatus(id: string): Promise<Feed> {
    const feed = await this.feedModel.findByPk(id);
    if (!feed) {
      throw new NotFoundException(`Feed with ID ${id} not found`);
    }
    const newStatus = feed.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await feed.update({ status: newStatus as any });
    return feed;
  }
}

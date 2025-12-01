import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Channel } from '../models';
import { CreateChannelDto, UpdateChannelDto } from './dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel)
    private readonly channelModel: typeof Channel,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelModel.findAll({
      include: ['messages'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Channel | null> {
    return this.channelModel.findByPk(id, {
      include: ['messages'],
    });
  }

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channelData = { ...createChannelDto };
    if (!channelData.id) {
      channelData.id = `channel-${Date.now()}`;
    }
    return this.channelModel.create(channelData as Channel);
  }

  async update(id: string, updateChannelDto: UpdateChannelDto): Promise<Channel | null> {
    const [affectedCount] = await this.channelModel.update(updateChannelDto, {
      where: { id },
    });
    if (affectedCount === 0) {
      return null;
    }
    return this.channelModel.findByPk(id, {
      include: ['messages'],
    });
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.channelModel.destroy({ where: { id } });
    return affectedCount > 0;
  }
}

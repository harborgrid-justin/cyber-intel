import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Channel } from '../models';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel)
    private channelModel: typeof Channel,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelModel.findAll({
      include: ['messages'],
      order: [['createdAt', 'DESC']]
    });
  }

  async findOne(id: string): Promise<Channel | null> {
    return this.channelModel.findByPk(id, {
      include: ['messages']
    });
  }

  async create(createChannelDto: any): Promise<Channel> {
    if (!createChannelDto.id) {
      createChannelDto.id = `channel-${Date.now()}`;
    }
    return this.channelModel.create(createChannelDto);
  }

  async update(id: string, updateChannelDto: any): Promise<Channel | null> {
    const [affectedCount] = await this.channelModel.update(updateChannelDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.channelModel.findByPk(id, {
      include: ['messages']
    });
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.channelModel.destroy({ where: { id } });
    return affectedCount > 0;
  }
}
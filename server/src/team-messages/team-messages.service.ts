import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TeamMessage } from '../models';
import { CreateTeamMessageDto, UpdateTeamMessageDto } from './dto';

@Injectable()
export class TeamMessagesService {
  constructor(
    @InjectModel(TeamMessage)
    private readonly teamMessageModel: typeof TeamMessage,
  ) {}

  async findAll(filters?: { channelId?: string; userId?: string }): Promise<TeamMessage[]> {
    const where: Record<string, string> = {};
    if (filters?.channelId) {
      where.channelId = filters.channelId;
    }
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    return this.teamMessageModel.findAll({
      where,
      include: ['channel'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<TeamMessage | null> {
    return this.teamMessageModel.findByPk(id, {
      include: ['channel'],
    });
  }

  async create(createTeamMessageDto: CreateTeamMessageDto): Promise<TeamMessage> {
    const messageData = { ...createTeamMessageDto };
    if (!messageData.id) {
      messageData.id = `message-${Date.now()}`;
    }
    return this.teamMessageModel.create(messageData as TeamMessage);
  }

  async update(id: string, updateTeamMessageDto: UpdateTeamMessageDto): Promise<TeamMessage | null> {
    const [affectedCount] = await this.teamMessageModel.update(updateTeamMessageDto, {
      where: { id },
    });
    if (affectedCount === 0) {
      return null;
    }
    return this.teamMessageModel.findByPk(id, {
      include: ['channel'],
    });
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.teamMessageModel.destroy({ where: { id } });
    return affectedCount > 0;
  }
}

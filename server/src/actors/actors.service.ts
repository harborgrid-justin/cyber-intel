import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Actor } from '../models/actor.model';

@Injectable()
export class ActorsService {
  constructor(
    @InjectModel(Actor)
    private actorModel: typeof Actor,
  ) {}

  async findAll(): Promise<Actor[]> {
    return this.actorModel.findAll({
      include: ['campaignRelations'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Actor> {
    return this.actorModel.findByPk(id, {
      include: ['campaignRelations'],
    });
  }

  async create(actorData: Partial<Actor>): Promise<Actor> {
    return this.actorModel.create(actorData);
  }

  async update(id: string, actorData: Partial<Actor>): Promise<Actor> {
    const actor = await this.actorModel.findByPk(id);
    if (!actor) {
      throw new Error('Actor not found');
    }
    await actor.update(actorData);
    return actor;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.actorModel.destroy({ where: { id } });
    return { deleted: result > 0 };
  }

  async findByCountry(country: string): Promise<Actor[]> {
    return this.actorModel.findAll({
      where: { origin: country },
      include: ['campaignRelations'],
    });
  }

  async findByMotivation(motivation: string): Promise<Actor[]> {
    // Since motivation is not a separate field, search in description
    return this.actorModel.findAll({
      where: {
        description: {
          [require('sequelize').Op.iLike]: `%${motivation}%`
        }
      },
      include: ['campaignRelations'],
    });
  }
}

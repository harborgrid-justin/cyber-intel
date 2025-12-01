import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Actor } from '../models/actor.model';
import { Op } from 'sequelize';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';

@Injectable()
export class ActorsService {
  constructor(
    @InjectModel(Actor)
    private readonly actorModel: typeof Actor,
  ) {}

  async findAll(): Promise<Actor[]> {
    return this.actorModel.findAll({
      include: ['campaignRelations'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Actor> {
    const actor = await this.actorModel.findByPk(id, {
      include: ['campaignRelations'],
    });
    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }
    return actor;
  }

  async create(actorData: CreateActorDto): Promise<Actor> {
    return this.actorModel.create(actorData as any);
  }

  async update(id: string, actorData: UpdateActorDto): Promise<Actor> {
    const actor = await this.actorModel.findByPk(id);
    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }
    await actor.update(actorData);
    return actor;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const actor = await this.actorModel.findByPk(id);
    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }
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
    return this.actorModel.findAll({
      where: {
        description: {
          [Op.iLike]: `%${motivation}%`,
        },
      },
      include: ['campaignRelations'],
    });
  }

  async findBySophistication(level: string): Promise<Actor[]> {
    return this.actorModel.findAll({
      where: { sophistication: level },
      include: ['campaignRelations'],
    });
  }
}

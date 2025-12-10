
import { Actor } from '../models/intelligence';
import { AuditService } from './audit.service';
import { ModelStatic } from 'sequelize';

const ActorModel = Actor as ModelStatic<Actor>;

interface CreateActorInput {
  name: string;
  origin?: string;
  description?: string;
  sophistication?: string;
  targets?: string[];
  aliases?: string[];
  evasionTechniques?: string[];
  exploits?: string[];
}

interface UpdateActorInput extends Partial<CreateActorInput> {}

export class ActorService {
  static async getAll(): Promise<Actor[]> {
    return await ActorModel.findAll({ order: [['name', 'ASC']] });
  }

  static async getById(id: string): Promise<Actor | null> {
    return await ActorModel.findByPk(id);
  }

  static async create(data: CreateActorInput, userId: string): Promise<Actor> {
    const id = `ACT-${Date.now()}`;
    const actor = await ActorModel.create({
      id,
      name: data.name,
      origin: data.origin || 'Unknown',
      description: data.description || '',
      sophistication: data.sophistication || 'Novice',
      targets: data.targets || [],
      aliases: data.aliases || [],
      evasion_techniques: data.evasionTechniques || [],
      exploits: data.exploits || [],
      history: []
    } as Actor);

    await AuditService.log(userId, 'ACTOR_CREATED', `Created profile for ${data.name}`, id);
    return actor;
  }

  static async update(id: string, data: UpdateActorInput, userId: string): Promise<Actor | null> {
    const actor = await ActorModel.findByPk(id);
    if (actor) {
      if (data.name) actor.name = data.name;
      if (data.origin) actor.origin = data.origin;
      if (data.description) actor.description = data.description;
      if (data.sophistication) actor.sophistication = data.sophistication;
      if (data.targets) actor.targets = data.targets;
      if (data.aliases) actor.aliases = data.aliases;
      if (data.evasionTechniques) actor.evasion_techniques = data.evasionTechniques;
      if (data.exploits) actor.exploits = data.exploits;
      
      await actor.save();
      await AuditService.log(userId, 'ACTOR_UPDATED', `Updated profile ${id}`, id);
      return actor;
    }
    return null;
  }
}

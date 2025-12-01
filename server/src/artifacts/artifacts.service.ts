import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Artifact } from '../models';
import { CreateArtifactDto, UpdateArtifactDto, ArtifactStatsDto } from './dto';

@Injectable()
export class ArtifactsService {
  constructor(
    @InjectModel(Artifact)
    private readonly artifactModel: typeof Artifact,
  ) {}

  async findAll(filters?: { caseId?: string; type?: string }): Promise<Artifact[]> {
    const where: Record<string, string> = {};
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    return this.artifactModel.findAll({
      where,
      include: ['case'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Artifact | null> {
    return this.artifactModel.findByPk(id, {
      include: ['case'],
    });
  }

  async create(createArtifactDto: CreateArtifactDto): Promise<Artifact> {
    const artifactData = {
      ...createArtifactDto,
      id: `artifact-${Date.now()}`,
    };
    return this.artifactModel.create(artifactData as any);
  }

  async update(id: string, updateArtifactDto: UpdateArtifactDto): Promise<Artifact | null> {
    const [affectedCount] = await this.artifactModel.update(updateArtifactDto as any, {
      where: { id },
    });
    if (affectedCount === 0) {
      return null;
    }
    return this.artifactModel.findByPk(id, {
      include: ['case'],
    });
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.artifactModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async getArtifactsByCase(caseId: string): Promise<Artifact[]> {
    return this.artifactModel.findAll({
      where: { caseId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getArtifactsByType(type: string): Promise<Artifact[]> {
    return this.artifactModel.findAll({
      where: { type },
      include: ['case'],
      order: [['createdAt', 'DESC']],
    });
  }

  async getArtifactStats(): Promise<ArtifactStatsDto> {
    const total = await this.artifactModel.count();
    const artifactsByType = await this.artifactModel.findAll({
      attributes: [
        'type',
        [
          this.artifactModel.sequelize?.fn(
            'COUNT',
            this.artifactModel.sequelize?.col('id'),
          ),
          'count',
        ],
      ],
      group: ['type'],
      raw: true,
    });

    return {
      total,
      artifactsByType: artifactsByType as any,
    };
  }
}

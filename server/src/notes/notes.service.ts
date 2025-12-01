import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Note } from '../models';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note)
    private noteModel: typeof Note,
  ) {}

  async findAll(filters?: { authorId?: string; caseId?: string }): Promise<Note[]> {
    const where: any = {};
    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }
    return this.noteModel.findAll({
      where,
      include: ['author', 'case'],
      order: [['createdAt', 'DESC']]
    });
  }

  async findOne(id: string): Promise<Note | null> {
    return this.noteModel.findByPk(id, {
      include: ['author', 'case']
    });
  }

  async create(createNoteDto: any): Promise<Note> {
    if (!createNoteDto.id) {
      createNoteDto.id = `note-${Date.now()}`;
    }
    return this.noteModel.create(createNoteDto);
  }

  async update(id: string, updateNoteDto: any): Promise<Note | null> {
    const [affectedCount] = await this.noteModel.update(updateNoteDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.noteModel.findByPk(id, {
      include: ['author', 'case']
    });
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.noteModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async getNotesByCase(caseId: string): Promise<Note[]> {
    return this.noteModel.findAll({
      where: { caseId },
      include: ['author'],
      order: [['createdAt', 'DESC']]
    });
  }

  async getNotesByAuthor(authorId: string): Promise<Note[]> {
    return this.noteModel.findAll({
      where: { authorId },
      include: ['case'],
      order: [['createdAt', 'DESC']]
    });
  }

  async getNoteStats(): Promise<any> {
    const total = await this.noteModel.count();
    const notesByAuthor = await this.noteModel.findAll({
      attributes: [
        'authorId',
        [this.noteModel.sequelize?.fn('COUNT', this.noteModel.sequelize?.col('id')), 'count']
      ],
      group: ['authorId'],
      raw: true
    });

    return {
      total,
      notesByAuthor
    };
  }
}
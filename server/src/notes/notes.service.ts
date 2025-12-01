import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Note } from '../models';
import { CreateNoteDto, UpdateNoteDto, NoteStatsDto } from './dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note)
    private readonly noteModel: typeof Note,
  ) {}

  async findAll(filters?: { author?: string; caseId?: string }): Promise<Note[]> {
    const where: Record<string, string> = {};
    if (filters?.author) {
      where.author = filters.author;
    }
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }
    return this.noteModel.findAll({
      where,
      include: ['case'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Note | null> {
    return this.noteModel.findByPk(id, {
      include: ['author', 'case'],
    });
  }

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const noteData = {
      ...createNoteDto,
      id: `note-${Date.now()}`,
    };
    return this.noteModel.create(noteData as any);
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note | null> {
    const [affectedCount] = await this.noteModel.update(updateNoteDto as any, {
      where: { id },
    });
    if (affectedCount === 0) {
      return null;
    }
    return this.noteModel.findByPk(id, {
      include: ['author', 'case'],
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
      order: [['createdAt', 'DESC']],
    });
  }

  async getNotesByAuthor(author: string): Promise<Note[]> {
    return this.noteModel.findAll({
      where: { author },
      include: ['case'],
      order: [['createdAt', 'DESC']],
    });
  }

  async getNoteStats(): Promise<NoteStatsDto> {
    const total = await this.noteModel.count();
    const notesByAuthor = await this.noteModel.findAll({
      attributes: [
        'authorId',
        [
          this.noteModel.sequelize?.fn(
            'COUNT',
            this.noteModel.sequelize?.col('id'),
          ),
          'count',
        ],
      ],
      group: ['authorId'],
      raw: true,
    });

    return {
      total,
      notesByAuthor: notesByAuthor as any,
    };
  }
}

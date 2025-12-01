import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note } from '../models';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(
    @Query('authorId') authorId?: string,
    @Query('caseId') caseId?: string
  ): Promise<Note[]> {
    try {
      return await this.notesService.findAll({ authorId, caseId });
    } catch (error) {
      throw new HttpException('Failed to retrieve notes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Note> {
    try {
      const note = await this.notesService.findOne(id);
      if (!note) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }
      return note;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve note', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createNoteDto: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      return await this.notesService.create(createNoteDto);
    } catch (error) {
      throw new HttpException('Failed to create note', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNoteDto: Partial<Note>): Promise<Note> {
    try {
      const note = await this.notesService.update(id, updateNoteDto);
      if (!note) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }
      return note;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update note', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.notesService.remove(id);
      if (!result) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Note deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete note', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('case/:caseId')
  async getNotesByCase(@Param('caseId') caseId: string): Promise<Note[]> {
    try {
      return await this.notesService.getNotesByCase(caseId);
    } catch (error) {
      throw new HttpException('Failed to retrieve notes for case', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('author/:authorId')
  async getNotesByAuthor(@Param('authorId') authorId: string): Promise<Note[]> {
    try {
      return await this.notesService.getNotesByAuthor(authorId);
    } catch (error) {
      throw new HttpException('Failed to retrieve notes for author', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  async getNoteStats(): Promise<any> {
    try {
      return await this.notesService.getNoteStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve note statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
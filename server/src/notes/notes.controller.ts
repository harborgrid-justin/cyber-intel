import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { Note } from '../models';
import { CreateNoteDto, UpdateNoteDto, NoteStatsDto } from './dto';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes with optional filters' })
  @ApiQuery({ name: 'author', required: false, description: 'Filter by author name' })
  @ApiQuery({ name: 'caseId', required: false, description: 'Filter by case ID' })
  @ApiResponse({ status: 200, description: 'Returns list of notes' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('author') author?: string,
    @Query('caseId') caseId?: string,
  ): Promise<Note[]> {
    try {
      return await this.notesService.findAll({ author, caseId });
    } catch (error) {
      throw new HttpException('Failed to retrieve notes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get note statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns note statistics', type: NoteStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNoteStats(): Promise<NoteStatsDto> {
    try {
      return await this.notesService.getNoteStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve note statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get notes for a specific case' })
  @ApiParam({ name: 'caseId', description: 'Case ID', example: 'case-001' })
  @ApiResponse({ status: 200, description: 'Returns notes for the case' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNotesByCase(@Param('caseId') caseId: string): Promise<Note[]> {
    try {
      return await this.notesService.getNotesByCase(caseId);
    } catch (error) {
      throw new HttpException('Failed to retrieve notes for case', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('author/:author')
  @ApiOperation({ summary: 'Get notes by a specific author' })
  @ApiParam({ name: 'author', description: 'Author name', example: 'John Doe' })
  @ApiResponse({ status: 200, description: 'Returns notes by the author' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNotesByAuthor(@Param('author') author: string): Promise<Note[]> {
    try {
      return await this.notesService.getNotesByAuthor(author);
    } catch (error) {
      throw new HttpException('Failed to retrieve notes for author', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  @ApiParam({ name: 'id', description: 'Note ID', example: 'note-001' })
  @ApiResponse({ status: 200, description: 'Returns the note' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new note' })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
    try {
      return await this.notesService.create(createNoteDto);
    } catch (error) {
      throw new HttpException('Failed to create note', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing note' })
  @ApiParam({ name: 'id', description: 'Note ID', example: 'note-001' })
  @ApiBody({ type: UpdateNoteDto })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'id', description: 'Note ID', example: 'note-001' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
}

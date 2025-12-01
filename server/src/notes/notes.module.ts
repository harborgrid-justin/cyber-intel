import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([Note])],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
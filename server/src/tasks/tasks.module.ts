import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
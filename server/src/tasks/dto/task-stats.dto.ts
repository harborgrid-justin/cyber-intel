import { ApiProperty } from '@nestjs/swagger';

export class TaskStatsDto {
  @ApiProperty({ description: 'Total number of tasks', example: 100 })
  total: number;

  @ApiProperty({ description: 'Number of pending tasks', example: 30 })
  pending: number;

  @ApiProperty({ description: 'Number of tasks in progress', example: 40 })
  inProgress: number;

  @ApiProperty({ description: 'Number of completed tasks', example: 25 })
  completed: number;

  @ApiProperty({ description: 'Number of overdue tasks', example: 5 })
  overdue: number;

  @ApiProperty({ description: 'Task completion rate percentage', example: 25 })
  completionRate: number;
}

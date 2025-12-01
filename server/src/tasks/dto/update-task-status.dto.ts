import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'New task status',
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    example: 'In Progress'
  })
  @IsEnum(['Pending', 'In Progress', 'Completed', 'Cancelled'])
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

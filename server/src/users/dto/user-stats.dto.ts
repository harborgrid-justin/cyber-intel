import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'Total number of users', example: 50 })
  total: number;

  @ApiProperty({ description: 'Number of active users', example: 40 })
  active: number;

  @ApiProperty({ description: 'Number of inactive users', example: 8 })
  inactive: number;

  @ApiProperty({ description: 'Number of suspended users', example: 2 })
  suspended: number;

  @ApiProperty({ description: 'User count by role', example: { Admin: 5, Analyst: 30, Operator: 10, Viewer: 5 } })
  roles: Record<string, number>;

  @ApiProperty({ description: 'Percentage of active users', example: 80 })
  activeRate: number;
}

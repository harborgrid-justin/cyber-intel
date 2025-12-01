import { PartialType } from '@nestjs/swagger';
import { CreateTeamMessageDto } from './create-team-message.dto';

export class UpdateTeamMessageDto extends PartialType(CreateTeamMessageDto) {}

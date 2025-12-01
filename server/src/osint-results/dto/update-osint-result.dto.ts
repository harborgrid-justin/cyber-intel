import { PartialType } from '@nestjs/swagger';
import { CreateOsintResultDto } from './create-osint-result.dto';

export class UpdateOsintResultDto extends PartialType(CreateOsintResultDto) {}

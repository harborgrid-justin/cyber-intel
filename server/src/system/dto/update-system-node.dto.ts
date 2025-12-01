import { PartialType } from '@nestjs/swagger';
import { CreateSystemNodeDto } from './create-system-node.dto';

export class UpdateSystemNodeDto extends PartialType(CreateSystemNodeDto) {}

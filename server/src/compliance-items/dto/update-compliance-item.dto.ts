import { PartialType } from '@nestjs/swagger';
import { CreateComplianceItemDto } from './create-compliance-item.dto';

export class UpdateComplianceItemDto extends PartialType(CreateComplianceItemDto) {}

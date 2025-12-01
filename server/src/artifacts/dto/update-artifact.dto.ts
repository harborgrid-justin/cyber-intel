import { PartialType } from '@nestjs/mapped-types';
import { CreateArtifactDto } from './create-artifact.dto';

export class UpdateArtifactDto extends PartialType(CreateArtifactDto) {}
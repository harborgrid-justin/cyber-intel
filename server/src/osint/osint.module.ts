import { Module } from '@nestjs/common';
import { OsintController } from './osint.controller';
import { OsintService } from './osint.service';

@Module({
  controllers: [OsintController],
  providers: [OsintService],
  exports: [OsintService],
})
export class OsintModule {}
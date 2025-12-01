import { Module } from '@nestjs/common';
import { ThreatsModule } from './threats/threats.module';
import { CasesModule } from './cases/cases.module';
import { ActorsModule } from './actors/actors.module';
import { AnalysisModule } from './analysis/analysis.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';
import { SystemModule } from './system/system.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ThreatsModule,
    CasesModule,
    ActorsModule,
    AnalysisModule,
    CampaignsModule,
    VulnerabilitiesModule,
    SystemModule,
    UsersModule,
    ReportsModule,
    MessagingModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './database.config';
import { ThreatsModule } from './threats/threats.module';
import { CasesModule } from './cases/cases.module';
import { ActorsModule } from './actors/actors.module';
import { DetectionModule } from './detection/detection.module';
import { FeedModule } from './feed/feed.module';
import { IncidentsModule } from './incidents/incidents.module';
import { AnalysisModule } from './analysis/analysis.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';
import { SystemModule } from './system/system.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { MessagingModule } from './messaging/messaging.module';
import { EvidenceModule } from './evidence/evidence.module';
import { OsintModule } from './osint/osint.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [
    SequelizeModule.forRoot(databaseConfig),
    ThreatsModule,
    CasesModule,
    ActorsModule,
    DetectionModule,
    FeedModule,
    IncidentsModule,
    AnalysisModule,
    CampaignsModule,
    VulnerabilitiesModule,
    SystemModule,
    UsersModule,
    ReportsModule,
    MessagingModule,
    EvidenceModule,
    OsintModule,
    OrchestratorModule,
    IngestionModule,
  ],
})
export class AppModule {}

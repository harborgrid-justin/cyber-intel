import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './database.config';
import { AppController } from './app.controller';

// Core Domain Modules
import { ThreatsModule } from './threats/threats.module';
import { CasesModule } from './cases/cases.module';
import { ActorsModule } from './actors/actors.module';
import { CampaignsModule } from './campaigns/campaigns.module';

// Security & Detection Modules
import { DetectionModule } from './detection/detection.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';
import { IncidentsModule } from './incidents/incidents.module';

// Data & Analysis Modules
import { AnalysisModule } from './analysis/analysis.module';
import { ReportsModule } from './reports/reports.module';
import { EvidenceModule } from './evidence/evidence.module';
import { FeedModule } from './feed/feed.module';

// Operations Modules
import { OsintModule } from './osint/osint.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { IngestionModule } from './ingestion/ingestion.module';

// User & Collaboration Modules
import { UsersModule } from './users/users.module';
import { MessagingModule } from './messaging/messaging.module';

// Infrastructure & Support Modules
import { SystemModule } from './system/system.module';
import { ChannelsModule } from './channels/channels.module';
import { TeamMessagesModule } from './team-messages/team-messages.module';
import { ComplianceItemsModule } from './compliance-items/compliance-items.module';

@Module({
  controllers: [AppController],
  imports: [
    // Database Configuration
    SequelizeModule.forRoot(databaseConfig),

    // Core Domain Modules
    ThreatsModule,
    CasesModule,
    ActorsModule,
    CampaignsModule,

    // Security & Detection Modules
    DetectionModule,
    VulnerabilitiesModule,
    IncidentsModule,

    // Data & Analysis Modules
    AnalysisModule,
    ReportsModule,
    EvidenceModule,
    FeedModule,

    // Operations Modules
    OsintModule,
    OrchestratorModule,
    IngestionModule,

    // User & Collaboration Modules
    UsersModule,
    MessagingModule,

    // Infrastructure & Support Modules
    SystemModule,
    ChannelsModule,
    TeamMessagesModule,
    ComplianceItemsModule,
  ],
})
export class AppModule {}

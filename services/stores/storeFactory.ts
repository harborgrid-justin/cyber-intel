import { InitialDataFactory } from '../initialData';
import { DatabaseAdapter } from '../dbAdapter';
import { ThreatStore } from './threatStore';
import { CaseStore } from './caseStore';
import { ActorStore } from './actorStore';
import { CampaignStore } from './campaignStore';
import { FeedStore } from './feedStore';
import { LogStore } from './logStore';
import { VulnerabilityStore } from './vulnerabilityStore';
import { SystemNodeStore } from './systemNodeStore';
import { ReportStore } from './reportStore';
import { UserStore } from './userStore';
import { VendorStore } from './vendorStore';
import { MessagingStore } from './messagingStore';
import { BaseStore } from './baseStore';
import { ThreatMapper, CaseMapper, ActorMapper, AssetMapper } from '../mappers';
import { MOCK_DARKWEB, MOCK_META, MOCK_TRAFFIC_FLOWS, MOCK_RISK_FORECAST } from '../../constants/index';
import { AIConfig, AppConfig, ScoringConfig, ThemeConfig } from '../../types';

export function createStores(adapter: DatabaseAdapter) {
    const threatStore = new ThreatStore('THREATS', InitialDataFactory.getThreats(), adapter, new ThreatMapper());
    const caseStore = new CaseStore('CASES', InitialDataFactory.getCases(), adapter, new CaseMapper());
    const actorStore = new ActorStore('ACTORS', InitialDataFactory.getActors(), adapter, new ActorMapper());
    const nodeStore = new SystemNodeStore('ASSETS', InitialDataFactory.getNodes(), adapter, new AssetMapper());

    const { channels, messages } = InitialDataFactory.getMessagingData();
    const messagingStore = new MessagingStore('CHANNELS', channels, messages, adapter);
    
    const mitre = InitialDataFactory.getMitreData();
    const osint = InitialDataFactory.getOsintData();
    const configData = InitialDataFactory.getConfigData();

    const stores = {
        threatStore, caseStore, actorStore, nodeStore, messagingStore,
        campaignStore: new CampaignStore('CAMPAIGNS', InitialDataFactory.getCampaigns(), adapter),
        feedStore: new FeedStore('FEEDS', InitialDataFactory.getFeeds(), adapter),
        logStore: new LogStore('LOGS', InitialDataFactory.getLogs(), adapter),
        vulnStore: new VulnerabilityStore('VULNERABILITIES', InitialDataFactory.getVulns(), adapter),
        reportStore: new ReportStore('REPORTS', InitialDataFactory.getReports(), adapter),
        userStore: new UserStore('USERS', InitialDataFactory.getUsers(), adapter),
        vendorStore: new VendorStore('VENDORS', InitialDataFactory.getVendors(), adapter),
        playbookStore: new BaseStore('PLAYBOOKS', InitialDataFactory.getPlaybooks(), adapter),
        chainStore: new BaseStore('CHAIN', InitialDataFactory.getChain(), adapter),
        malwareStore: new BaseStore('MALWARE', InitialDataFactory.getMalware(), adapter),
        jobStore: new BaseStore('JOBS', InitialDataFactory.getJobs(), adapter),
        deviceStore: new BaseStore('DEVICES', InitialDataFactory.getDevices(), adapter),
        pcapStore: new BaseStore('PCAPS', InitialDataFactory.getPcaps(), adapter),
        vendorFeedStore: new BaseStore('VENDOR_FEEDS', InitialDataFactory.getVendorFeeds(), adapter),
        scannerStore: new BaseStore('SCANNERS', InitialDataFactory.getScanners(), adapter),
        mitreTacticStore: new BaseStore('MITRE_TACTICS', mitre.tactics, adapter),
        mitreTechniqueStore: new BaseStore('MITRE_TECHNIQUES', mitre.techniques, adapter),
        mitreSubStore: new BaseStore('MITRE_SUB_TECHNIQUES', mitre.subTechniques, adapter),
        mitreGroupStore: new BaseStore('MITRE_GROUPS', mitre.groups, adapter),
        mitreSoftwareStore: new BaseStore('MITRE_SOFTWARE', mitre.software, adapter),
        mitreMitigationStore: new BaseStore('MITRE_MITIGATIONS', mitre.mitigations, adapter),
        osintDomainStore: new BaseStore('OSINT_DOMAINS', osint.domains, adapter),
        osintBreachStore: new BaseStore('OSINT_BREACHES', osint.breaches, adapter),
        osintGeoStore: new BaseStore('OSINT_GEO', osint.geo, adapter),
        osintSocialStore: new BaseStore('OSINT_SOCIAL', osint.social, adapter),
        osintDarkWebStore: new BaseStore('OSINT_DARKWEB', MOCK_DARKWEB, adapter),
        osintMetaStore: new BaseStore('OSINT_META', MOCK_META, adapter),
        trafficFlowStore: new BaseStore('TRAFFIC_FLOWS', MOCK_TRAFFIC_FLOWS, adapter),
        riskForecastStore: new BaseStore('RISK_FORECAST', MOCK_RISK_FORECAST, adapter),
        integrationStore: new BaseStore('INTEGRATIONS', configData.integrations, adapter),
        patchStatusStore: new BaseStore('PATCH_STATUS', configData.patchStatus, adapter),
        apiKeyStore: new BaseStore('API_KEYS', configData.apiKeys, adapter),
        enrichmentStore: new BaseStore('ENRICHMENT_MODULES', configData.enrichment, adapter),
        parserStore: new BaseStore('PARSERS', configData.parsers, adapter),
        normalizationStore: new BaseStore('NORMALIZATION_RULES', configData.normalization, adapter),
        policyStore: new BaseStore('SEGMENTATION_POLICIES', configData.policies, adapter),
        honeytokenStore: new BaseStore('HONEYTOKENS', configData.honeytokens, adapter),
        nistControlStore: new BaseStore('NIST_CONTROLS', configData.nistControls, adapter),
        configStore: new BaseStore<AppConfig>('APP_CONFIG', [configData.appConfig], adapter),
        aiConfigStore: new BaseStore<AIConfig>('AI_CONFIG', [configData.aiConfig], adapter),
        scoringConfigStore: new BaseStore<ScoringConfig>('SCORING_CONFIG', [configData.scoringConfig], adapter),
        themeConfigStore: new BaseStore<ThemeConfig>('THEME_CONFIG', [configData.themeConfig], adapter),
    };

    return {
        ...stores,
        navigationConfig: configData.navigationConfig,
        modulesConfig: configData.modulesConfig
    };
}


import { Router } from 'express';
import * as SCRM from '../../controllers/analysis/scrm.controller';
import * as OSINT from '../../controllers/analysis/osint.controller';
import * as Forensics from '../../controllers/analysis/forensics.controller';
import * as Detection from '../../controllers/analysis/detection.controller';
import * as Orchestration from '../../controllers/analysis/orchestration.controller';
import * as Lifecycle from '../../controllers/analysis/lifecycle.controller';
import * as Intel from '../../controllers/analysis/intelligence.controller';
import * as Infra from '../../controllers/analysis/infrastructure.controller';
import * as Ops from '../../controllers/analysis/operations.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// SCRM
router.post('/scrm/reassess-risks', SCRM.assessVendorRisk);
router.post('/scrm/audit-access', SCRM.auditVendorAccess);
router.post('/scrm/geo-risk', SCRM.assessGeoRisk);
router.post('/scrm/sbom-health', SCRM.analyzeSbom);
router.get('/scrm/:vendorId/trace', SCRM.traceSupplyChain);

// OSINT
router.post('/osint/domain', OSINT.analyzeOsintDomain);
router.post('/osint/identity', OSINT.analyzeOsintIdentity);
router.post('/osint/exposure', OSINT.checkCredentialExposure);
router.post('/osint/network', OSINT.analyzeOsintNetwork);
router.post('/osint/darkweb', OSINT.analyzeDarkWeb);

// Forensics
router.post('/forensics/verify', Forensics.verifyArtifact);
router.post('/forensics/custody', Forensics.validateCustody);
router.post('/forensics/malware-risk', Forensics.assessMalware);
router.post('/forensics/device-action', Forensics.suggestDeviceAction);

// Detection
router.post('/detection/rule', Detection.validateRule);
router.post('/detection/ueba', Detection.analyzeUeba);
router.get('/detection/memory/:id', Detection.analyzeNodeMemory);
router.get('/detection/disk/:id', Detection.analyzeNodeDisk);

// Orchestration
router.get('/orchestrator/patch-priority', Orchestration.prioritizePatches);
router.get('/orchestrator/decoys', Orchestration.recommendDecoys);
router.post('/orchestrator/segmentation-sim', Orchestration.simulateSegmentation);
router.get('/orchestrator/lateral-paths', Orchestration.detectLateralPaths);
router.post('/orchestrator/lure-effectiveness', Orchestration.analyzeLureEffectiveness);
router.post('/blast-radius', Orchestration.getBlastRadius);
router.post('/response-plan', Orchestration.generateResponsePlan);

// Lifecycle
router.post('/lifecycle/threats/deduplicate', Lifecycle.deduplicateThreat);
router.post('/lifecycle/threats/decay', Lifecycle.decayConfidence);
router.post('/lifecycle/threats/geoblock', Lifecycle.applyGeoBlocking);
router.get('/lifecycle/cases/sla', Lifecycle.checkSlaBreaches);
router.post('/lifecycle/system/retention', Lifecycle.runRetentionPolicy);
router.get('/lifecycle/system/fatigue', Lifecycle.checkAnalystFatigue);
router.get('/lifecycle/storage/projection', Lifecycle.getStorageProjection);

// Intelligence (Threats, Campaigns, Attribution)
router.post('/campaign-risk', Intel.calculateCampaignRisk);
router.get('/campaigns/ttp-library', Intel.getTtpLibrary);
router.post('/campaigns/validate-chain', Intel.validateCampaignChain);
router.post('/campaigns/metrics', Intel.calculateCampaignMetrics);
router.post('/campaigns/optimize', Intel.optimizeCampaignChain);
router.get('/threats/patterns', Intel.analyzeThreatPatterns);
router.post('/attribution', Intel.calculateAttribution);
router.post('/triage', Intel.runAutoTriage);

// Infrastructure (Vuln, Asset)
router.get('/vuln/zero-day-impact', Infra.getZeroDayImpact);
router.get('/vuln/feed-correlation', Infra.getFeedCorrelation);
router.get('/assets/:id/risk', Infra.assessAssetRiskSingle);
router.post('/actors/:id/escalate-vip', Infra.escalateVip);
router.get('/dashboard/defcon', Infra.getDefconLevel);
router.get('/dashboard/regional-risk', Infra.getRegionalRisk);
router.get('/dashboard/system-health', Infra.getSystemHealth);
router.get('/dashboard/cloud-security', Infra.getCloudSecurity);

// Operations (Cases, Audit, Security Stats)
router.post('/cases/suggest-playbook', Ops.suggestCasePlaybook);
router.get('/cases/:id/correlations', Ops.correlateCases);
router.post('/cases/check-sla', Ops.checkSlaStatus);
router.post('/compliance/nist', Ops.checkCompliance);
router.get('/compliance/travel', Ops.detectImpossibleTravel);
router.get('/dashboard/insider-threats', Ops.getInsiderThreats);
router.get('/dashboard/trends', Ops.getThreatTrends);
router.get('/security/darkweb/chatter', Ops.getDarkWebChatter);
router.get('/security/darkweb/leaks', Ops.getCredentialLeaks);
router.get('/audit/analytics/auth', Ops.analyzeAuthLogs);
router.get('/audit/analytics/network', Ops.analyzeNetworkLogs);
router.get('/audit/analytics/data', Ops.analyzeDataLogs);

export default router;

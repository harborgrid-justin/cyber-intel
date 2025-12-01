
import { ThreatLogic } from './logic/ThreatLogic';
import { CaseLogic } from './logic/CaseLogic';
import { SystemLogic } from './logic/SystemLogic';

export class LogicEngine {
  // Threat
  static deduplicateThreat = ThreatLogic.deduplicateThreat;
  static autoAttributedActor = ThreatLogic.autoAttributedActor;
  static decayConfidence = ThreatLogic.decayConfidence;
  static enforceTLP = ThreatLogic.enforceTLP;
  static checkSubnetPattern = ThreatLogic.checkSubnetPattern;
  static checkRansomwareVelocity = ThreatLogic.checkRansomwareVelocity;
  static applyGeoBlocking = ThreatLogic.applyGeoBlocking;
  static checkShadowIT = ThreatLogic.checkShadowIT;
  static checkFeedbackLoop = ThreatLogic.checkFeedbackLoop;
  static adjustThresholdsByDefcon = ThreatLogic.adjustThresholdsByDefcon;

  // Case
  static checkSLA = CaseLogic.checkSLA;
  static correlateCases = CaseLogic.correlateCases;
  static suggestPlaybook = CaseLogic.suggestPlaybook;
  static validateAssignment = CaseLogic.validateAssignment;
  static enforceDataSovereignty = CaseLogic.enforceDataSovereignty;

  // System & Other
  static validateChainOfCustody = SystemLogic.validateChainOfCustody;
  static assessAssetRisk = SystemLogic.assessAssetRisk;
  static escalateVIPTargets = SystemLogic.escalateVIPTargets;
  static detectImpossibleTravel = SystemLogic.detectImpossibleTravel;
  static checkRetentionPolicy = SystemLogic.checkRetentionPolicy;
  static checkActorConvergence = SystemLogic.checkActorConvergence;
  static analyzeKillChain = SystemLogic.analyzeKillChain;
  static detectTaskCycles = SystemLogic.detectTaskCycles;
  static detectTimeAnomaly = SystemLogic.detectTimeAnomaly;
  static trackCampaignVelocity = SystemLogic.trackCampaignVelocity;
  static enforceDormantAccountPolicy = SystemLogic.enforceDormantAccountPolicy;
  static validateHashIntegrity = SystemLogic.validateHashIntegrity;
  static analyzePlaybookEfficiency = SystemLogic.analyzePlaybookEfficiency;
  static prioritizeNegativeSentiment = SystemLogic.prioritizeNegativeSentiment;
  static enforceZeroTrustPatching = SystemLogic.enforceZeroTrustPatching;
  static tripFeedCircuitBreaker = SystemLogic.tripFeedCircuitBreaker;
  static monitorAnalystFatigue = SystemLogic.monitorAnalystFatigue;
}

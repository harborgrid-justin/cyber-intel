import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import {
  ResponsePlan,
  VIPProfile,
  Honeytoken,
  PatchPrioritization,
  SegmentationPolicy,
  TrafficFlow
} from '../../../types';

@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  // Response Plan Execution
  @Get('response-plans')
  async getResponsePlans(): Promise<ResponsePlan[]> {
    try {
      return this.orchestratorService.getResponsePlans();
    } catch (error) {
      throw new HttpException('Failed to retrieve response plans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('response-plans/:id')
  async getResponsePlan(@Param('id') id: string): Promise<ResponsePlan> {
    try {
      const plan = this.orchestratorService.getResponsePlan(id);
      if (!plan) {
        throw new HttpException('Response plan not found', HttpStatus.NOT_FOUND);
      }
      return plan;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve response plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('response-plans')
  async createResponsePlan(@Body() planData: Omit<ResponsePlan, 'id'>): Promise<ResponsePlan> {
    try {
      return this.orchestratorService.createResponsePlan(planData);
    } catch (error) {
      throw new HttpException('Failed to create response plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('response-plans/:id')
  async updateResponsePlan(@Param('id') id: string, @Body() updates: Partial<ResponsePlan>): Promise<ResponsePlan> {
    try {
      const plan = this.orchestratorService.updateResponsePlan(id, updates);
      if (!plan) {
        throw new HttpException('Response plan not found', HttpStatus.NOT_FOUND);
      }
      return plan;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update response plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('response-plans/:id/execute')
  async executeResponsePlan(@Param('id') id: string): Promise<ResponsePlan> {
    try {
      const plan = this.orchestratorService.executeResponsePlan(id);
      if (!plan) {
        throw new HttpException('Response plan not found', HttpStatus.NOT_FOUND);
      }
      return plan;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to execute response plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // VIP Protection
  @Get('vip-profiles')
  async getVipProfiles(): Promise<VIPProfile[]> {
    try {
      return this.orchestratorService.getVipProfiles();
    } catch (error) {
      throw new HttpException('Failed to retrieve VIP profiles', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vip-profiles/:userId')
  async getVipProfile(@Param('userId') userId: string): Promise<VIPProfile> {
    try {
      const profile = this.orchestratorService.getVipProfile(userId);
      if (!profile) {
        throw new HttpException('VIP profile not found', HttpStatus.NOT_FOUND);
      }
      return profile;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve VIP profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('vip-profiles')
  async addVipProfile(@Body() profileData: VIPProfile): Promise<VIPProfile> {
    try {
      return this.orchestratorService.addVipProfile(profileData);
    } catch (error) {
      throw new HttpException('Failed to add VIP profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Active Defense - Honeytokens
  @Get('honeytokens')
  async getHoneytokens(): Promise<Honeytoken[]> {
    try {
      return this.orchestratorService.getHoneytokens();
    } catch (error) {
      throw new HttpException('Failed to retrieve honeytokens', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('honeytokens/:id')
  async getHoneytoken(@Param('id') id: string): Promise<Honeytoken> {
    try {
      const token = this.orchestratorService.getHoneytoken(id);
      if (!token) {
        throw new HttpException('Honeytoken not found', HttpStatus.NOT_FOUND);
      }
      return token;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve honeytoken', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('honeytokens')
  async createHoneytoken(@Body() tokenData: Omit<Honeytoken, 'id'>): Promise<Honeytoken> {
    try {
      return this.orchestratorService.createHoneytoken(tokenData);
    } catch (error) {
      throw new HttpException('Failed to create honeytoken', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('honeytokens/:id')
  async updateHoneytoken(@Param('id') id: string, @Body() updates: Partial<Honeytoken>): Promise<Honeytoken> {
    try {
      const token = this.orchestratorService.updateHoneytoken(id, updates);
      if (!token) {
        throw new HttpException('Honeytoken not found', HttpStatus.NOT_FOUND);
      }
      return token;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update honeytoken', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('honeytokens/:id/trigger')
  async triggerHoneytoken(@Param('id') id: string): Promise<Honeytoken> {
    try {
      const token = this.orchestratorService.triggerHoneytoken(id);
      if (!token) {
        throw new HttpException('Honeytoken not found', HttpStatus.NOT_FOUND);
      }
      return token;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to trigger honeytoken', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Patch Prioritization
  @Get('patch-prioritization')
  async getPatchPrioritizations(): Promise<PatchPrioritization[]> {
    try {
      return this.orchestratorService.getPatchPrioritizations();
    } catch (error) {
      throw new HttpException('Failed to retrieve patch prioritizations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('patch-prioritization')
  async addPatchPrioritization(@Body() prioritizationData: PatchPrioritization): Promise<PatchPrioritization> {
    try {
      return this.orchestratorService.addPatchPrioritization(prioritizationData);
    } catch (error) {
      throw new HttpException('Failed to add patch prioritization', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Segmentation Policy Management
  @Get('segmentation-policies')
  async getSegmentationPolicies(): Promise<SegmentationPolicy[]> {
    try {
      return this.orchestratorService.getSegmentationPolicies();
    } catch (error) {
      throw new HttpException('Failed to retrieve segmentation policies', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('segmentation-policies/:id')
  async getSegmentationPolicy(@Param('id') id: string): Promise<SegmentationPolicy> {
    try {
      const policy = this.orchestratorService.getSegmentationPolicy(id);
      if (!policy) {
        throw new HttpException('Segmentation policy not found', HttpStatus.NOT_FOUND);
      }
      return policy;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve segmentation policy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('segmentation-policies')
  async createSegmentationPolicy(@Body() policyData: Omit<SegmentationPolicy, 'id'>): Promise<SegmentationPolicy> {
    try {
      return this.orchestratorService.createSegmentationPolicy(policyData);
    } catch (error) {
      throw new HttpException('Failed to create segmentation policy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('segmentation-policies/:id')
  async updateSegmentationPolicy(@Param('id') id: string, @Body() updates: Partial<SegmentationPolicy>): Promise<SegmentationPolicy> {
    try {
      const policy = this.orchestratorService.updateSegmentationPolicy(id, updates);
      if (!policy) {
        throw new HttpException('Segmentation policy not found', HttpStatus.NOT_FOUND);
      }
      return policy;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update segmentation policy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Traffic Flow Monitoring
  @Get('traffic-flows')
  async getTrafficFlows(): Promise<TrafficFlow[]> {
    try {
      return this.orchestratorService.getTrafficFlows();
    } catch (error) {
      throw new HttpException('Failed to retrieve traffic flows', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('traffic-flows')
  async addTrafficFlow(@Body() flowData: Omit<TrafficFlow, 'id'>): Promise<TrafficFlow> {
    try {
      return this.orchestratorService.addTrafficFlow(flowData);
    } catch (error) {
      throw new HttpException('Failed to add traffic flow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  async getOrchestratorStats(): Promise<any> {
    try {
      return this.orchestratorService.getOrchestratorStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve orchestrator statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vip-profiles/high-risk')
  async getHighRiskVips(): Promise<VIPProfile[]> {
    try {
      return this.orchestratorService.getHighRiskVips();
    } catch (error) {
      throw new HttpException('Failed to retrieve high risk VIPs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('response-plans/active')
  async getActiveResponsePlans(): Promise<ResponsePlan[]> {
    try {
      return this.orchestratorService.getActiveResponsePlans();
    } catch (error) {
      throw new HttpException('Failed to retrieve active response plans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Automated Actions
  @Post('automated-response')
  async executeAutomatedResponse(@Body() data: { threatId: string; targetNodes: string[] }): Promise<ResponsePlan> {
    try {
      return this.orchestratorService.executeAutomatedResponse(data.threatId, data.targetNodes);
    } catch (error) {
      throw new HttpException('Failed to execute automated response', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('segmentation/enforce/:nodeId')
  async enforceSegmentation(@Param('nodeId') nodeId: string): Promise<SegmentationPolicy[]> {
    try {
      return this.orchestratorService.enforceSegmentation(nodeId);
    } catch (error) {
      throw new HttpException('Failed to enforce segmentation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
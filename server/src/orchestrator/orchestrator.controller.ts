import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrchestratorService } from './orchestrator.service';
import {
  CreateResponsePlanDto,
  UpdateResponsePlanDto,
  CreateVipProfileDto,
  CreateHoneytokenDto,
  UpdateHoneytokenDto,
  CreatePatchPrioritizationDto,
  CreateSegmentationPolicyDto,
  UpdateSegmentationPolicyDto,
  CreateTrafficFlowDto,
  AutomatedResponseDto,
} from './dto';
import { ResponsePlan, VIPProfile, Honeytoken, PatchPrioritization, SegmentationPolicy, TrafficFlow } from '@/types';

@ApiTags('orchestrator')
@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  // Response Plan Execution
  @Get('response-plans')
  @ApiOperation({ summary: 'Get all response plans' })
  @ApiResponse({ status: 200, description: 'Returns all response plans' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve response plans' })
  async getResponsePlans(): Promise<ResponsePlan[]> {
    try {
      return this.orchestratorService.getResponsePlans();
    } catch (error) {
      throw new HttpException('Failed to retrieve response plans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('response-plans/active')
  @ApiOperation({ summary: 'Get all active response plans' })
  @ApiResponse({ status: 200, description: 'Returns active response plans' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve active response plans' })
  async getActiveResponsePlans(): Promise<ResponsePlan[]> {
    try {
      return this.orchestratorService.getActiveResponsePlans();
    } catch (error) {
      throw new HttpException('Failed to retrieve active response plans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('response-plans/:id')
  @ApiOperation({ summary: 'Get response plan by ID' })
  @ApiParam({ name: 'id', description: 'Response plan ID', example: 'plan-123' })
  @ApiResponse({ status: 200, description: 'Returns the response plan' })
  @ApiResponse({ status: 404, description: 'Response plan not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve response plan' })
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
  @ApiOperation({ summary: 'Create a new response plan' })
  @ApiBody({ type: CreateResponsePlanDto })
  @ApiResponse({ status: 201, description: 'Response plan created' })
  @ApiResponse({ status: 500, description: 'Failed to create response plan' })
  async createResponsePlan(@Body() planData: CreateResponsePlanDto): Promise<ResponsePlan> {
    try {
      return this.orchestratorService.createResponsePlan(planData as Omit<ResponsePlan, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to create response plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('response-plans/:id')
  @ApiOperation({ summary: 'Update a response plan' })
  @ApiParam({ name: 'id', description: 'Response plan ID', example: 'plan-123' })
  @ApiBody({ type: UpdateResponsePlanDto })
  @ApiResponse({ status: 200, description: 'Response plan updated' })
  @ApiResponse({ status: 404, description: 'Response plan not found' })
  @ApiResponse({ status: 500, description: 'Failed to update response plan' })
  async updateResponsePlan(@Param('id') id: string, @Body() updates: UpdateResponsePlanDto): Promise<ResponsePlan> {
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
  @ApiOperation({ summary: 'Execute a response plan' })
  @ApiParam({ name: 'id', description: 'Response plan ID', example: 'plan-123' })
  @ApiResponse({ status: 200, description: 'Response plan execution started' })
  @ApiResponse({ status: 404, description: 'Response plan not found' })
  @ApiResponse({ status: 500, description: 'Failed to execute response plan' })
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
  @ApiOperation({ summary: 'Get all VIP profiles' })
  @ApiResponse({ status: 200, description: 'Returns all VIP profiles' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve VIP profiles' })
  async getVipProfiles(): Promise<VIPProfile[]> {
    try {
      return this.orchestratorService.getVipProfiles();
    } catch (error) {
      throw new HttpException('Failed to retrieve VIP profiles', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vip-profiles/high-risk')
  @ApiOperation({ summary: 'Get high-risk VIP profiles' })
  @ApiResponse({ status: 200, description: 'Returns high-risk VIP profiles' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve high risk VIPs' })
  async getHighRiskVips(): Promise<VIPProfile[]> {
    try {
      return this.orchestratorService.getHighRiskVips();
    } catch (error) {
      throw new HttpException('Failed to retrieve high risk VIPs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vip-profiles/:userId')
  @ApiOperation({ summary: 'Get VIP profile by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user-123' })
  @ApiResponse({ status: 200, description: 'Returns the VIP profile' })
  @ApiResponse({ status: 404, description: 'VIP profile not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve VIP profile' })
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
  @ApiOperation({ summary: 'Add a new VIP profile' })
  @ApiBody({ type: CreateVipProfileDto })
  @ApiResponse({ status: 201, description: 'VIP profile created' })
  @ApiResponse({ status: 500, description: 'Failed to add VIP profile' })
  async addVipProfile(@Body() profileData: CreateVipProfileDto): Promise<VIPProfile> {
    try {
      return this.orchestratorService.addVipProfile(profileData as VIPProfile);
    } catch (error) {
      throw new HttpException('Failed to add VIP profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Active Defense - Honeytokens
  @Get('honeytokens')
  @ApiOperation({ summary: 'Get all honeytokens' })
  @ApiResponse({ status: 200, description: 'Returns all honeytokens' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve honeytokens' })
  async getHoneytokens(): Promise<Honeytoken[]> {
    try {
      return this.orchestratorService.getHoneytokens();
    } catch (error) {
      throw new HttpException('Failed to retrieve honeytokens', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('honeytokens/:id')
  @ApiOperation({ summary: 'Get honeytoken by ID' })
  @ApiParam({ name: 'id', description: 'Honeytoken ID', example: 'token-123' })
  @ApiResponse({ status: 200, description: 'Returns the honeytoken' })
  @ApiResponse({ status: 404, description: 'Honeytoken not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve honeytoken' })
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
  @ApiOperation({ summary: 'Create a new honeytoken' })
  @ApiBody({ type: CreateHoneytokenDto })
  @ApiResponse({ status: 201, description: 'Honeytoken created' })
  @ApiResponse({ status: 500, description: 'Failed to create honeytoken' })
  async createHoneytoken(@Body() tokenData: CreateHoneytokenDto): Promise<Honeytoken> {
    try {
      return this.orchestratorService.createHoneytoken(tokenData as Omit<Honeytoken, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to create honeytoken', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('honeytokens/:id')
  @ApiOperation({ summary: 'Update a honeytoken' })
  @ApiParam({ name: 'id', description: 'Honeytoken ID', example: 'token-123' })
  @ApiBody({ type: UpdateHoneytokenDto })
  @ApiResponse({ status: 200, description: 'Honeytoken updated' })
  @ApiResponse({ status: 404, description: 'Honeytoken not found' })
  @ApiResponse({ status: 500, description: 'Failed to update honeytoken' })
  async updateHoneytoken(@Param('id') id: string, @Body() updates: UpdateHoneytokenDto): Promise<Honeytoken> {
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
  @ApiOperation({ summary: 'Trigger a honeytoken (simulate detection)' })
  @ApiParam({ name: 'id', description: 'Honeytoken ID', example: 'token-123' })
  @ApiResponse({ status: 200, description: 'Honeytoken triggered' })
  @ApiResponse({ status: 404, description: 'Honeytoken not found' })
  @ApiResponse({ status: 500, description: 'Failed to trigger honeytoken' })
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
  @ApiOperation({ summary: 'Get all patch prioritizations' })
  @ApiResponse({ status: 200, description: 'Returns all patch prioritizations' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve patch prioritizations' })
  async getPatchPrioritizations(): Promise<PatchPrioritization[]> {
    try {
      return this.orchestratorService.getPatchPrioritizations();
    } catch (error) {
      throw new HttpException('Failed to retrieve patch prioritizations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('patch-prioritization')
  @ApiOperation({ summary: 'Add a new patch prioritization' })
  @ApiBody({ type: CreatePatchPrioritizationDto })
  @ApiResponse({ status: 201, description: 'Patch prioritization created' })
  @ApiResponse({ status: 500, description: 'Failed to add patch prioritization' })
  async addPatchPrioritization(@Body() prioritizationData: CreatePatchPrioritizationDto): Promise<PatchPrioritization> {
    try {
      return this.orchestratorService.addPatchPrioritization(prioritizationData as PatchPrioritization);
    } catch (error) {
      throw new HttpException('Failed to add patch prioritization', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Segmentation Policy Management
  @Get('segmentation-policies')
  @ApiOperation({ summary: 'Get all segmentation policies' })
  @ApiResponse({ status: 200, description: 'Returns all segmentation policies' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve segmentation policies' })
  async getSegmentationPolicies(): Promise<SegmentationPolicy[]> {
    try {
      return this.orchestratorService.getSegmentationPolicies();
    } catch (error) {
      throw new HttpException('Failed to retrieve segmentation policies', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('segmentation-policies/:id')
  @ApiOperation({ summary: 'Get segmentation policy by ID' })
  @ApiParam({ name: 'id', description: 'Segmentation policy ID', example: 'policy-123' })
  @ApiResponse({ status: 200, description: 'Returns the segmentation policy' })
  @ApiResponse({ status: 404, description: 'Segmentation policy not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve segmentation policy' })
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
  @ApiOperation({ summary: 'Create a new segmentation policy' })
  @ApiBody({ type: CreateSegmentationPolicyDto })
  @ApiResponse({ status: 201, description: 'Segmentation policy created' })
  @ApiResponse({ status: 500, description: 'Failed to create segmentation policy' })
  async createSegmentationPolicy(@Body() policyData: CreateSegmentationPolicyDto): Promise<SegmentationPolicy> {
    try {
      return this.orchestratorService.createSegmentationPolicy(policyData as Omit<SegmentationPolicy, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to create segmentation policy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('segmentation-policies/:id')
  @ApiOperation({ summary: 'Update a segmentation policy' })
  @ApiParam({ name: 'id', description: 'Segmentation policy ID', example: 'policy-123' })
  @ApiBody({ type: UpdateSegmentationPolicyDto })
  @ApiResponse({ status: 200, description: 'Segmentation policy updated' })
  @ApiResponse({ status: 404, description: 'Segmentation policy not found' })
  @ApiResponse({ status: 500, description: 'Failed to update segmentation policy' })
  async updateSegmentationPolicy(@Param('id') id: string, @Body() updates: UpdateSegmentationPolicyDto): Promise<SegmentationPolicy> {
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
  @ApiOperation({ summary: 'Get all traffic flows' })
  @ApiResponse({ status: 200, description: 'Returns all traffic flows' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve traffic flows' })
  async getTrafficFlows(): Promise<TrafficFlow[]> {
    try {
      return this.orchestratorService.getTrafficFlows();
    } catch (error) {
      throw new HttpException('Failed to retrieve traffic flows', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('traffic-flows')
  @ApiOperation({ summary: 'Add a new traffic flow' })
  @ApiBody({ type: CreateTrafficFlowDto })
  @ApiResponse({ status: 201, description: 'Traffic flow created' })
  @ApiResponse({ status: 500, description: 'Failed to add traffic flow' })
  async addTrafficFlow(@Body() flowData: CreateTrafficFlowDto): Promise<TrafficFlow> {
    try {
      return this.orchestratorService.addTrafficFlow(flowData as Omit<TrafficFlow, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to add traffic flow', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get orchestrator statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns orchestrator statistics' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve orchestrator statistics' })
  async getOrchestratorStats(): Promise<any> {
    try {
      return this.orchestratorService.getOrchestratorStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve orchestrator statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Automated Actions
  @Post('automated-response')
  @ApiOperation({ summary: 'Execute automated threat response' })
  @ApiBody({ type: AutomatedResponseDto })
  @ApiResponse({ status: 201, description: 'Automated response initiated' })
  @ApiResponse({ status: 500, description: 'Failed to execute automated response' })
  async executeAutomatedResponse(@Body() data: AutomatedResponseDto): Promise<ResponsePlan> {
    try {
      return this.orchestratorService.executeAutomatedResponse(data.threatId, data.targetNodes);
    } catch (error) {
      throw new HttpException('Failed to execute automated response', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('segmentation/enforce/:nodeId')
  @ApiOperation({ summary: 'Enforce network segmentation for a node' })
  @ApiParam({ name: 'nodeId', description: 'Node ID to segment', example: 'node-123' })
  @ApiResponse({ status: 201, description: 'Segmentation policies enforced' })
  @ApiResponse({ status: 500, description: 'Failed to enforce segmentation' })
  async enforceSegmentation(@Param('nodeId') nodeId: string): Promise<SegmentationPolicy[]> {
    try {
      return this.orchestratorService.enforceSegmentation(nodeId);
    } catch (error) {
      throw new HttpException('Failed to enforce segmentation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

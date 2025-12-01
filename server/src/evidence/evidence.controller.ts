import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import {
  CreateChainEventDto,
  ChainEventResponseDto,
  CreateMalwareDto,
  MalwareResponseDto,
  MalwareQueryDto,
  CreateForensicJobDto,
  UpdateForensicJobDto,
  ForensicJobResponseDto,
  ForensicJobQueryDto,
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceResponseDto,
  DeviceQueryDto,
  CreatePcapDto,
  UpdatePcapDto,
  PcapResponseDto,
  PcapQueryDto,
  EvidenceStatsDto,
} from './dto';

@ApiTags('evidence')
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  // Chain of Custody Endpoints
  @Get('chain')
  @ApiOperation({
    summary: 'Get all chain of custody events',
    description: 'Retrieve the complete chain of custody log for all evidence items.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chain of custody events retrieved successfully',
    type: [ChainEventResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve chain of custody events',
  })
  async getChainEvents(): Promise<ChainEventResponseDto[]> {
    try {
      return this.evidenceService.getChainEvents();
    } catch (error) {
      throw new HttpException('Failed to retrieve chain of custody events', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('chain/:id')
  @ApiOperation({
    summary: 'Get chain event by ID',
    description: 'Retrieve a specific chain of custody event by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the chain event',
    example: 'ce-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Chain event retrieved successfully',
    type: ChainEventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Chain event not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve chain event',
  })
  async getChainEvent(@Param('id') id: string): Promise<ChainEventResponseDto> {
    try {
      const event = this.evidenceService.getChainEvent(id);
      if (!event) {
        throw new HttpException('Chain event not found', HttpStatus.NOT_FOUND);
      }
      return event;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve chain event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('chain')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add chain of custody event',
    description: 'Record a new chain of custody event for evidence handling.',
  })
  @ApiBody({ type: CreateChainEventDto })
  @ApiResponse({
    status: 201,
    description: 'Chain event added successfully',
    type: ChainEventResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid chain event data',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to add chain event',
  })
  async addChainEvent(@Body() eventData: CreateChainEventDto): Promise<ChainEventResponseDto> {
    try {
      return this.evidenceService.addChainEvent(eventData);
    } catch (error) {
      throw new HttpException('Failed to add chain event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Malware Endpoints
  @Get('malware')
  @ApiOperation({
    summary: 'Get all malware samples',
    description: 'Retrieve all malware samples with optional filtering by verdict.',
  })
  @ApiQuery({
    name: 'verdict',
    required: false,
    enum: ['MALICIOUS', 'SUSPICIOUS', 'CLEAN'],
    description: 'Filter by analysis verdict',
  })
  @ApiResponse({
    status: 200,
    description: 'Malware samples retrieved successfully',
    type: [MalwareResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve malware samples',
  })
  async getMalware(@Query() query: MalwareQueryDto): Promise<MalwareResponseDto[]> {
    try {
      if (query.verdict) {
        return this.evidenceService.getMalwareByVerdict(query.verdict);
      }
      return this.evidenceService.getMalware();
    } catch (error) {
      throw new HttpException('Failed to retrieve malware samples', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('malware/:id')
  @ApiOperation({
    summary: 'Get malware sample by ID',
    description: 'Retrieve a specific malware sample by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the malware sample',
    example: 'mw-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Malware sample retrieved successfully',
    type: MalwareResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Malware sample not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve malware sample',
  })
  async getMalwareById(@Param('id') id: string): Promise<MalwareResponseDto> {
    try {
      const sample = this.evidenceService.getMalwareById(id);
      if (!sample) {
        throw new HttpException('Malware sample not found', HttpStatus.NOT_FOUND);
      }
      return sample;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve malware sample', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('malware')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add malware sample',
    description: 'Register a new malware sample for analysis tracking.',
  })
  @ApiBody({ type: CreateMalwareDto })
  @ApiResponse({
    status: 201,
    description: 'Malware sample added successfully',
    type: MalwareResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid malware sample data',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to add malware sample',
  })
  async addMalware(@Body() sampleData: CreateMalwareDto): Promise<MalwareResponseDto> {
    try {
      return this.evidenceService.addMalware(sampleData);
    } catch (error) {
      throw new HttpException('Failed to add malware sample', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Forensic Jobs Endpoints
  @Get('forensics')
  @ApiOperation({
    summary: 'Get all forensic jobs',
    description: 'Retrieve all forensic analysis jobs with optional filtering by status.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    description: 'Filter by job status',
  })
  @ApiResponse({
    status: 200,
    description: 'Forensic jobs retrieved successfully',
    type: [ForensicJobResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve forensic jobs',
  })
  async getForensicJobs(@Query() query: ForensicJobQueryDto): Promise<ForensicJobResponseDto[]> {
    try {
      if (query.status) {
        return this.evidenceService.getForensicJobsByStatus(query.status);
      }
      return this.evidenceService.getForensicJobs();
    } catch (error) {
      throw new HttpException('Failed to retrieve forensic jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('forensics/:id')
  @ApiOperation({
    summary: 'Get forensic job by ID',
    description: 'Retrieve a specific forensic job by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the forensic job',
    example: 'fj-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Forensic job retrieved successfully',
    type: ForensicJobResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Forensic job not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve forensic job',
  })
  async getForensicJob(@Param('id') id: string): Promise<ForensicJobResponseDto> {
    try {
      const job = this.evidenceService.getForensicJob(id);
      if (!job) {
        throw new HttpException('Forensic job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve forensic job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('forensics')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create forensic job',
    description: 'Create a new forensic analysis job.',
  })
  @ApiBody({ type: CreateForensicJobDto })
  @ApiResponse({
    status: 201,
    description: 'Forensic job created successfully',
    type: ForensicJobResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid forensic job data',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create forensic job',
  })
  async createForensicJob(@Body() jobData: CreateForensicJobDto): Promise<ForensicJobResponseDto> {
    try {
      return this.evidenceService.createForensicJob(jobData);
    } catch (error) {
      throw new HttpException('Failed to create forensic job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('forensics/:id')
  @ApiOperation({
    summary: 'Update forensic job',
    description: 'Update an existing forensic job with new information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the forensic job',
    example: 'fj-1234567890',
  })
  @ApiBody({ type: UpdateForensicJobDto })
  @ApiResponse({
    status: 200,
    description: 'Forensic job updated successfully',
    type: ForensicJobResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Forensic job not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update forensic job',
  })
  async updateForensicJob(
    @Param('id') id: string,
    @Body() updates: UpdateForensicJobDto,
  ): Promise<ForensicJobResponseDto> {
    try {
      const job = this.evidenceService.updateForensicJob(id, updates);
      if (!job) {
        throw new HttpException('Forensic job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update forensic job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Devices Endpoints
  @Get('devices')
  @ApiOperation({
    summary: 'Get all devices',
    description: 'Retrieve all evidence devices with optional filtering by status.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'],
    description: 'Filter by device status',
  })
  @ApiResponse({
    status: 200,
    description: 'Devices retrieved successfully',
    type: [DeviceResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve devices',
  })
  async getDevices(@Query() query: DeviceQueryDto): Promise<DeviceResponseDto[]> {
    try {
      if (query.status) {
        return this.evidenceService.getDevicesByStatus(query.status);
      }
      return this.evidenceService.getDevices();
    } catch (error) {
      throw new HttpException('Failed to retrieve devices', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('devices/:id')
  @ApiOperation({
    summary: 'Get device by ID',
    description: 'Retrieve a specific device by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the device',
    example: 'dev-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Device retrieved successfully',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve device',
  })
  async getDevice(@Param('id') id: string): Promise<DeviceResponseDto> {
    try {
      const device = this.evidenceService.getDevice(id);
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return device;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve device', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('devices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add device',
    description: 'Register a new evidence device.',
  })
  @ApiBody({ type: CreateDeviceDto })
  @ApiResponse({
    status: 201,
    description: 'Device added successfully',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid device data',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to add device',
  })
  async addDevice(@Body() deviceData: CreateDeviceDto): Promise<DeviceResponseDto> {
    try {
      return this.evidenceService.addDevice(deviceData);
    } catch (error) {
      throw new HttpException('Failed to add device', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('devices/:id')
  @ApiOperation({
    summary: 'Update device',
    description: 'Update an existing device with new information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the device',
    example: 'dev-1234567890',
  })
  @ApiBody({ type: UpdateDeviceDto })
  @ApiResponse({
    status: 200,
    description: 'Device updated successfully',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update device',
  })
  async updateDevice(
    @Param('id') id: string,
    @Body() updates: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    try {
      const device = this.evidenceService.updateDevice(id, updates);
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return device;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update device', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('devices/:id/quarantine')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quarantine device',
    description: 'Place a device in quarantine status for security isolation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the device',
    example: 'dev-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Device quarantined successfully',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to quarantine device',
  })
  async quarantineDevice(@Param('id') id: string): Promise<DeviceResponseDto> {
    try {
      const device = this.evidenceService.quarantineDevice(id);
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return device;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to quarantine device', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('devices/:id/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Release device',
    description: 'Release a device from quarantine or analysis status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the device',
    example: 'dev-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Device released successfully',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to release device',
  })
  async releaseDevice(@Param('id') id: string): Promise<DeviceResponseDto> {
    try {
      const device = this.evidenceService.releaseDevice(id);
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return device;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to release device', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PCAPs Endpoints
  @Get('pcaps')
  @ApiOperation({
    summary: 'Get all PCAP files',
    description: 'Retrieve all PCAP network capture files with optional filtering by analysis status.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'ANALYZED'],
    description: 'Filter by analysis status',
  })
  @ApiResponse({
    status: 200,
    description: 'PCAPs retrieved successfully',
    type: [PcapResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve PCAPs',
  })
  async getPcaps(@Query() query: PcapQueryDto): Promise<PcapResponseDto[]> {
    try {
      if (query.status) {
        return this.evidenceService.getPcapsByStatus(query.status);
      }
      return this.evidenceService.getPcaps();
    } catch (error) {
      throw new HttpException('Failed to retrieve PCAPs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pcaps/:id')
  @ApiOperation({
    summary: 'Get PCAP by ID',
    description: 'Retrieve a specific PCAP file by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the PCAP',
    example: 'pcap-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'PCAP retrieved successfully',
    type: PcapResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'PCAP not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve PCAP',
  })
  async getPcap(@Param('id') id: string): Promise<PcapResponseDto> {
    try {
      const pcap = this.evidenceService.getPcap(id);
      if (!pcap) {
        throw new HttpException('PCAP not found', HttpStatus.NOT_FOUND);
      }
      return pcap;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve PCAP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('pcaps')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add PCAP',
    description: 'Register a new PCAP network capture file.',
  })
  @ApiBody({ type: CreatePcapDto })
  @ApiResponse({
    status: 201,
    description: 'PCAP added successfully',
    type: PcapResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid PCAP data',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to add PCAP',
  })
  async addPcap(@Body() pcapData: CreatePcapDto): Promise<PcapResponseDto> {
    try {
      return this.evidenceService.addPcap(pcapData);
    } catch (error) {
      throw new HttpException('Failed to add PCAP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('pcaps/:id')
  @ApiOperation({
    summary: 'Update PCAP',
    description: 'Update an existing PCAP file with new information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the PCAP',
    example: 'pcap-1234567890',
  })
  @ApiBody({ type: UpdatePcapDto })
  @ApiResponse({
    status: 200,
    description: 'PCAP updated successfully',
    type: PcapResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'PCAP not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update PCAP',
  })
  async updatePcap(
    @Param('id') id: string,
    @Body() updates: UpdatePcapDto,
  ): Promise<PcapResponseDto> {
    try {
      const pcap = this.evidenceService.updatePcap(id, updates);
      if (!pcap) {
        throw new HttpException('PCAP not found', HttpStatus.NOT_FOUND);
      }
      return pcap;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update PCAP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('pcaps/:id/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze PCAP',
    description: 'Trigger analysis of a PCAP file and update its status to ANALYZED.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the PCAP',
    example: 'pcap-1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'PCAP analysis completed successfully',
    type: PcapResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'PCAP not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to analyze PCAP',
  })
  async analyzePcap(@Param('id') id: string): Promise<PcapResponseDto> {
    try {
      const pcap = this.evidenceService.analyzePcap(id);
      if (!pcap) {
        throw new HttpException('PCAP not found', HttpStatus.NOT_FOUND);
      }
      return pcap;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to analyze PCAP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get evidence statistics',
    description: 'Retrieve aggregate statistics about all evidence items including counts and statuses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Evidence statistics retrieved successfully',
    type: EvidenceStatsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve evidence statistics',
  })
  async getEvidenceStats(): Promise<EvidenceStatsDto> {
    try {
      return this.evidenceService.getEvidenceStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve evidence statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

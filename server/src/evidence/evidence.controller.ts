import { Controller, Get, Post, Put, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { ChainEvent, Malware, ForensicJob, Device, Pcap } from '../../../types';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  // Chain of Custody
  @Get('chain')
  async getChainEvents(): Promise<ChainEvent[]> {
    try {
      return this.evidenceService.getChainEvents();
    } catch (error) {
      throw new HttpException('Failed to retrieve chain of custody events', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('chain/:id')
  async getChainEvent(@Param('id') id: string): Promise<ChainEvent> {
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
  async addChainEvent(@Body() eventData: Omit<ChainEvent, 'id'>): Promise<ChainEvent> {
    try {
      return this.evidenceService.addChainEvent(eventData);
    } catch (error) {
      throw new HttpException('Failed to add chain event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Malware
  @Get('malware')
  async getMalware(@Query('verdict') verdict?: string): Promise<Malware[]> {
    try {
      if (verdict) {
        return this.evidenceService.getMalwareByVerdict(verdict);
      }
      return this.evidenceService.getMalware();
    } catch (error) {
      throw new HttpException('Failed to retrieve malware samples', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('malware/:id')
  async getMalwareById(@Param('id') id: string): Promise<Malware> {
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
  async addMalware(@Body() sampleData: Omit<Malware, 'id'>): Promise<Malware> {
    try {
      return this.evidenceService.addMalware(sampleData);
    } catch (error) {
      throw new HttpException('Failed to add malware sample', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Forensic Jobs
  @Get('forensics')
  async getForensicJobs(@Query('status') status?: string): Promise<ForensicJob[]> {
    try {
      if (status) {
        return this.evidenceService.getForensicJobsByStatus(status);
      }
      return this.evidenceService.getForensicJobs();
    } catch (error) {
      throw new HttpException('Failed to retrieve forensic jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('forensics/:id')
  async getForensicJob(@Param('id') id: string): Promise<ForensicJob> {
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
  async createForensicJob(@Body() jobData: Omit<ForensicJob, 'id'>): Promise<ForensicJob> {
    try {
      return this.evidenceService.createForensicJob(jobData);
    } catch (error) {
      throw new HttpException('Failed to create forensic job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('forensics/:id')
  async updateForensicJob(@Param('id') id: string, @Body() updates: Partial<ForensicJob>): Promise<ForensicJob> {
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

  // Devices
  @Get('devices')
  async getDevices(@Query('status') status?: string): Promise<Device[]> {
    try {
      if (status) {
        return this.evidenceService.getDevicesByStatus(status);
      }
      return this.evidenceService.getDevices();
    } catch (error) {
      throw new HttpException('Failed to retrieve devices', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('devices/:id')
  async getDevice(@Param('id') id: string): Promise<Device> {
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
  async addDevice(@Body() deviceData: Omit<Device, 'id'>): Promise<Device> {
    try {
      return this.evidenceService.addDevice(deviceData);
    } catch (error) {
      throw new HttpException('Failed to add device', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('devices/:id')
  async updateDevice(@Param('id') id: string, @Body() updates: Partial<Device>): Promise<Device> {
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
  async quarantineDevice(@Param('id') id: string): Promise<Device> {
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
  async releaseDevice(@Param('id') id: string): Promise<Device> {
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

  // PCAPs
  @Get('pcaps')
  async getPcaps(@Query('status') status?: string): Promise<Pcap[]> {
    try {
      if (status) {
        return this.evidenceService.getPcapsByStatus(status);
      }
      return this.evidenceService.getPcaps();
    } catch (error) {
      throw new HttpException('Failed to retrieve PCAPs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pcaps/:id')
  async getPcap(@Param('id') id: string): Promise<Pcap> {
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
  async addPcap(@Body() pcapData: Omit<Pcap, 'id'>): Promise<Pcap> {
    try {
      return this.evidenceService.addPcap(pcapData);
    } catch (error) {
      throw new HttpException('Failed to add PCAP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('pcaps/:id')
  async updatePcap(@Param('id') id: string, @Body() updates: Partial<Pcap>): Promise<Pcap> {
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
  async analyzePcap(@Param('id') id: string): Promise<Pcap> {
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
  async getEvidenceStats(): Promise<any> {
    try {
      return this.evidenceService.getEvidenceStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve evidence statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
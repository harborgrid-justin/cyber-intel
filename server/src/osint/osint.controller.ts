import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OsintService } from './osint.service';
import {
  CreateDomainDto,
  CreateBreachDto,
  CreateSocialDto,
  CreateGeoDto,
  CreateDarkWebItemDto,
  CreateFileMetaDto,
} from './dto';
import {
  OsintDomain,
  OsintBreach,
  OsintSocial,
  OsintGeo,
  OsintDarkWebItem,
  OsintFileMeta
} from '@/types';

@ApiTags('osint')
@Controller('osint')
export class OsintController {
  constructor(private readonly osintService: OsintService) {}

  // Domain Intelligence
  @Get('domains')
  @ApiOperation({ summary: 'Get all domain intelligence data' })
  @ApiResponse({ status: 200, description: 'Returns all domain intelligence records' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve domain intelligence' })
  async getDomains(): Promise<OsintDomain[]> {
    try {
      return this.osintService.getDomains();
    } catch (error) {
      throw new HttpException('Failed to retrieve domain intelligence', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('domains/:id')
  @ApiOperation({ summary: 'Get domain intelligence by ID' })
  @ApiParam({ name: 'id', description: 'Domain intelligence record ID', example: 'domain-123' })
  @ApiResponse({ status: 200, description: 'Returns the domain intelligence record' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve domain' })
  async getDomain(@Param('id') id: string): Promise<OsintDomain> {
    try {
      const domain = this.osintService.getDomain(id);
      if (!domain) {
        throw new HttpException('Domain not found', HttpStatus.NOT_FOUND);
      }
      return domain;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve domain', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('domains')
  @ApiOperation({ summary: 'Add new domain intelligence' })
  @ApiBody({ type: CreateDomainDto })
  @ApiResponse({ status: 201, description: 'Domain intelligence record created' })
  @ApiResponse({ status: 500, description: 'Failed to add domain intelligence' })
  async addDomain(@Body() domainData: CreateDomainDto): Promise<OsintDomain> {
    try {
      return this.osintService.addDomain(domainData as Omit<OsintDomain, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to add domain intelligence', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Breach Data
  @Get('breaches')
  @ApiOperation({ summary: 'Get all breach data or filter by email' })
  @ApiQuery({ name: 'email', required: false, description: 'Filter breaches by email address', example: 'user@example.com' })
  @ApiResponse({ status: 200, description: 'Returns breach data' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve breach data' })
  async getBreaches(@Query('email') email?: string): Promise<OsintBreach[]> {
    try {
      if (email) {
        return this.osintService.getBreachesByEmail(email);
      }
      return this.osintService.getBreaches();
    } catch (error) {
      throw new HttpException('Failed to retrieve breach data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('breaches/:id')
  @ApiOperation({ summary: 'Get breach data by ID' })
  @ApiParam({ name: 'id', description: 'Breach record ID', example: 'breach-123' })
  @ApiResponse({ status: 200, description: 'Returns the breach record' })
  @ApiResponse({ status: 404, description: 'Breach not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve breach' })
  async getBreach(@Param('id') id: string): Promise<OsintBreach> {
    try {
      const breach = this.osintService.getBreach(id);
      if (!breach) {
        throw new HttpException('Breach not found', HttpStatus.NOT_FOUND);
      }
      return breach;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve breach', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('breaches')
  @ApiOperation({ summary: 'Add new breach data' })
  @ApiBody({ type: CreateBreachDto })
  @ApiResponse({ status: 201, description: 'Breach record created' })
  @ApiResponse({ status: 500, description: 'Failed to add breach data' })
  async addBreach(@Body() breachData: CreateBreachDto): Promise<OsintBreach> {
    try {
      return this.osintService.addBreach(breachData as Omit<OsintBreach, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to add breach data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Social Media Monitoring
  @Get('social')
  @ApiOperation({ summary: 'Get all social media monitoring data or filter by platform' })
  @ApiQuery({ name: 'platform', required: false, description: 'Filter by social media platform', example: 'Twitter' })
  @ApiResponse({ status: 200, description: 'Returns social media monitoring data' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve social media data' })
  async getSocial(@Query('platform') platform?: string): Promise<OsintSocial[]> {
    try {
      if (platform) {
        return this.osintService.getSocialByPlatform(platform);
      }
      return this.osintService.getSocial();
    } catch (error) {
      throw new HttpException('Failed to retrieve social media data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('social/:id')
  @ApiOperation({ summary: 'Get social media profile by ID' })
  @ApiParam({ name: 'id', description: 'Social profile record ID', example: 'social-123' })
  @ApiResponse({ status: 200, description: 'Returns the social profile record' })
  @ApiResponse({ status: 404, description: 'Social profile not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve social profile' })
  async getSocialById(@Param('id') id: string): Promise<OsintSocial> {
    try {
      const social = this.osintService.getSocialById(id);
      if (!social) {
        throw new HttpException('Social profile not found', HttpStatus.NOT_FOUND);
      }
      return social;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve social profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('social')
  @ApiOperation({ summary: 'Add new social media profile' })
  @ApiBody({ type: CreateSocialDto })
  @ApiResponse({ status: 201, description: 'Social profile record created' })
  @ApiResponse({ status: 500, description: 'Failed to add social media data' })
  async addSocial(@Body() socialData: CreateSocialDto): Promise<OsintSocial> {
    try {
      return this.osintService.addSocial(socialData as Omit<OsintSocial, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to add social media data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Geo-IP Analysis
  @Get('geo')
  @ApiOperation({ summary: 'Get all geo-IP data' })
  @ApiResponse({ status: 200, description: 'Returns all geo-IP records' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve geo-IP data' })
  async getGeo(): Promise<OsintGeo[]> {
    try {
      return this.osintService.getGeo();
    } catch (error) {
      throw new HttpException('Failed to retrieve geo-IP data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('geo/:id')
  @ApiOperation({ summary: 'Get geo-IP data by ID' })
  @ApiParam({ name: 'id', description: 'Geo-IP record ID', example: 'geo-123' })
  @ApiResponse({ status: 200, description: 'Returns the geo-IP record' })
  @ApiResponse({ status: 404, description: 'Geo-IP data not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve geo-IP data' })
  async getGeoById(@Param('id') id: string): Promise<OsintGeo> {
    try {
      const geo = this.osintService.getGeoById(id);
      if (!geo) {
        throw new HttpException('Geo-IP data not found', HttpStatus.NOT_FOUND);
      }
      return geo;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve geo-IP data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('geo/ip/:ip')
  @ApiOperation({ summary: 'Get geo-IP data by IP address' })
  @ApiParam({ name: 'ip', description: 'IP address to lookup', example: '192.168.1.1' })
  @ApiResponse({ status: 200, description: 'Returns the geo-IP record for the IP' })
  @ApiResponse({ status: 404, description: 'IP not found in geo database' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve geo-IP data' })
  async getGeoByIP(@Param('ip') ip: string): Promise<OsintGeo> {
    try {
      const geo = this.osintService.getGeoByIP(ip);
      if (!geo) {
        throw new HttpException('IP not found in geo database', HttpStatus.NOT_FOUND);
      }
      return geo;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve geo-IP data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('geo')
  @ApiOperation({ summary: 'Add new geo-IP data' })
  @ApiBody({ type: CreateGeoDto })
  @ApiResponse({ status: 201, description: 'Geo-IP record created' })
  @ApiResponse({ status: 500, description: 'Failed to add geo-IP data' })
  async addGeo(@Body() geoData: CreateGeoDto): Promise<OsintGeo> {
    try {
      return this.osintService.addGeo(geoData as Omit<OsintGeo, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to add geo-IP data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Dark Web Scanning
  @Get('darkweb')
  @ApiOperation({ summary: 'Get all dark web monitoring data' })
  @ApiResponse({ status: 200, description: 'Returns all dark web items' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve dark web data' })
  async getDarkWeb(): Promise<OsintDarkWebItem[]> {
    try {
      return this.osintService.getDarkWeb();
    } catch (error) {
      throw new HttpException('Failed to retrieve dark web data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('darkweb')
  @ApiOperation({ summary: 'Add new dark web item' })
  @ApiBody({ type: CreateDarkWebItemDto })
  @ApiResponse({ status: 201, description: 'Dark web item created' })
  @ApiResponse({ status: 500, description: 'Failed to add dark web item' })
  async addDarkWebItem(@Body() itemData: CreateDarkWebItemDto): Promise<OsintDarkWebItem> {
    try {
      return this.osintService.addDarkWebItem(itemData as OsintDarkWebItem);
    } catch (error) {
      throw new HttpException('Failed to add dark web item', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // File Metadata Extraction
  @Get('files')
  @ApiOperation({ summary: 'Get all file metadata records' })
  @ApiResponse({ status: 200, description: 'Returns all file metadata' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve file metadata' })
  async getFileMeta(): Promise<OsintFileMeta[]> {
    try {
      return this.osintService.getFileMeta();
    } catch (error) {
      throw new HttpException('Failed to retrieve file metadata', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('files')
  @ApiOperation({ summary: 'Add new file metadata' })
  @ApiBody({ type: CreateFileMetaDto })
  @ApiResponse({ status: 201, description: 'File metadata created' })
  @ApiResponse({ status: 500, description: 'Failed to add file metadata' })
  async addFileMeta(@Body() metaData: CreateFileMetaDto): Promise<OsintFileMeta> {
    try {
      return this.osintService.addFileMeta(metaData as OsintFileMeta);
    } catch (error) {
      throw new HttpException('Failed to add file metadata', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get OSINT statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns OSINT statistics' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve OSINT statistics' })
  async getOsintStats(): Promise<any> {
    try {
      return this.osintService.getOsintStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve OSINT statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('threat-landscape')
  @ApiOperation({ summary: 'Get threat landscape analysis' })
  @ApiResponse({ status: 200, description: 'Returns threat landscape data' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve threat landscape' })
  async getThreatLandscape(): Promise<any> {
    try {
      return this.osintService.getThreatLandscape();
    } catch (error) {
      throw new HttpException('Failed to retrieve threat landscape', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('high-priority-targets')
  @ApiOperation({ summary: 'Get high priority targets' })
  @ApiResponse({ status: 200, description: 'Returns high priority targets list' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve high priority targets' })
  async getHighPriorityTargets(): Promise<any[]> {
    try {
      return this.osintService.getHighPriorityTargets();
    } catch (error) {
      throw new HttpException('Failed to retrieve high priority targets', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Advanced Queries
  @Get('search/domain/:domain')
  @ApiOperation({ summary: 'Search OSINT data by domain name' })
  @ApiParam({ name: 'domain', description: 'Domain name to search', example: 'example.com' })
  @ApiResponse({ status: 200, description: 'Returns search results for the domain' })
  @ApiResponse({ status: 500, description: 'Failed to search by domain' })
  async searchByDomain(@Param('domain') domain: string): Promise<any> {
    try {
      return this.osintService.searchByDomain(domain);
    } catch (error) {
      throw new HttpException('Failed to search by domain', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

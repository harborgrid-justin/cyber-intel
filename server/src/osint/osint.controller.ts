import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { OsintService } from './osint.service';
import {
  OsintDomain,
  OsintBreach,
  OsintSocial,
  OsintGeo,
  OsintDarkWebItem,
  OsintFileMeta
} from '../../../types';

@Controller('osint')
export class OsintController {
  constructor(private readonly osintService: OsintService) {}

  // Domain Intelligence
  @Get('domains')
  async getDomains(): Promise<OsintDomain[]> {
    try {
      return this.osintService.getDomains();
    } catch (error) {
      throw new HttpException('Failed to retrieve domain intelligence', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('domains/:id')
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
  async addDomain(@Body() domainData: Omit<OsintDomain, 'id'>): Promise<OsintDomain> {
    try {
      return this.osintService.addDomain(domainData);
    } catch (error) {
      throw new HttpException('Failed to add domain intelligence', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Breach Data
  @Get('breaches')
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
  async addBreach(@Body() breachData: Omit<OsintBreach, 'id'>): Promise<OsintBreach> {
    try {
      return this.osintService.addBreach(breachData);
    } catch (error) {
      throw new HttpException('Failed to add breach data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Social Media Monitoring
  @Get('social')
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
  async addSocial(@Body() socialData: Omit<OsintSocial, 'id'>): Promise<OsintSocial> {
    try {
      return this.osintService.addSocial(socialData);
    } catch (error) {
      throw new HttpException('Failed to add social media data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Geo-IP Analysis
  @Get('geo')
  async getGeo(): Promise<OsintGeo[]> {
    try {
      return this.osintService.getGeo();
    } catch (error) {
      throw new HttpException('Failed to retrieve geo-IP data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('geo/:id')
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
  async addGeo(@Body() geoData: Omit<OsintGeo, 'id'>): Promise<OsintGeo> {
    try {
      return this.osintService.addGeo(geoData);
    } catch (error) {
      throw new HttpException('Failed to add geo-IP data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Dark Web Scanning
  @Get('darkweb')
  async getDarkWeb(): Promise<OsintDarkWebItem[]> {
    try {
      return this.osintService.getDarkWeb();
    } catch (error) {
      throw new HttpException('Failed to retrieve dark web data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('darkweb')
  async addDarkWebItem(@Body() itemData: OsintDarkWebItem): Promise<OsintDarkWebItem> {
    try {
      return this.osintService.addDarkWebItem(itemData);
    } catch (error) {
      throw new HttpException('Failed to add dark web item', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // File Metadata Extraction
  @Get('files')
  async getFileMeta(): Promise<OsintFileMeta[]> {
    try {
      return this.osintService.getFileMeta();
    } catch (error) {
      throw new HttpException('Failed to retrieve file metadata', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('files')
  async addFileMeta(@Body() metaData: OsintFileMeta): Promise<OsintFileMeta> {
    try {
      return this.osintService.addFileMeta(metaData);
    } catch (error) {
      throw new HttpException('Failed to add file metadata', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  async getOsintStats(): Promise<any> {
    try {
      return this.osintService.getOsintStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve OSINT statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('threat-landscape')
  async getThreatLandscape(): Promise<any> {
    try {
      return this.osintService.getThreatLandscape();
    } catch (error) {
      throw new HttpException('Failed to retrieve threat landscape', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('high-priority-targets')
  async getHighPriorityTargets(): Promise<any[]> {
    try {
      return this.osintService.getHighPriorityTargets();
    } catch (error) {
      throw new HttpException('Failed to retrieve high priority targets', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Advanced Queries
  @Get('search/domain/:domain')
  async searchByDomain(@Param('domain') domain: string): Promise<any> {
    try {
      return this.osintService.searchByDomain(domain);
    } catch (error) {
      throw new HttpException('Failed to search by domain', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Welcome to Sentinel CyberIntel Platform',
    description: 'Returns welcome information and API links'
  })
  @ApiResponse({
    status: 200,
    description: 'Welcome message with API information',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Welcome to Sentinel CyberIntel Platform'
        },
        version: {
          type: 'string',
          example: '1.0.0'
        },
        api: {
          type: 'object',
          properties: {
            documentation: {
              type: 'string',
              example: '/api'
            },
            health: {
              type: 'string',
              example: '/system/health'
            }
          }
        },
        timestamp: {
          type: 'string',
          example: '2025-12-01T00:00:00.000Z'
        }
      }
    }
  })
  getWelcome() {
    return {
      message: 'Welcome to Sentinel CyberIntel Platform',
      version: '1.0.0',
      description: 'A comprehensive cyber intelligence and threat management platform',
      api: {
        documentation: '/api',
        health: '/system/health',
        swagger: '/api'
      },
      features: [
        'Threat Intelligence Management',
        'Case Management & Investigation',
        'Vulnerability Assessment',
        'Incident Response Orchestration',
        'OSINT Operations',
        'Real-time Detection & Alerting',
        'Compliance Monitoring',
        'Collaborative Messaging'
      ],
      timestamp: new Date().toISOString()
    };
  }
}
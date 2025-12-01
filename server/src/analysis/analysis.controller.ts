import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { ChatRequestDto, ChatResponseDto, BriefingResponseDto } from './dto';

@ApiTags('analysis')
@Controller('api/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with AI Threat Intelligence Analyst',
    description: 'Send a message to the AI-powered cyber threat intelligence analyst for analysis, recommendations, or threat assessments.'
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({
    status: 200,
    description: 'AI analyst response generated successfully',
    type: ChatResponseDto
  })
  @ApiResponse({
    status: 503,
    description: 'AI service unavailable - API key not configured'
  })
  async chat(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    return this.analysisService.chat(body.message, body.history);
  }

  @Post('briefing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate Executive Threat Briefing',
    description: 'Generate an AI-powered executive summary of current global cyber threats, focusing on ransomware and zero-day exploits.'
  })
  @ApiResponse({
    status: 200,
    description: 'Executive briefing generated successfully',
    type: BriefingResponseDto
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded - briefing unavailable'
  })
  @ApiResponse({
    status: 503,
    description: 'AI service unavailable - API key not configured'
  })
  async generateBriefing(): Promise<BriefingResponseDto> {
    return this.analysisService.generateBriefing();
  }
}

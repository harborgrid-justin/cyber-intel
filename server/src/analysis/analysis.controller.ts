import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('api/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('chat')
  async chat(@Body() body: { message: string; history?: any[] }) {
    return this.analysisService.chat(body.message, body.history);
  }

  @Post('briefing')
  async generateBriefing() {
    return this.analysisService.generateBriefing();
  }
}

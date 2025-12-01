import { ApiProperty } from '@nestjs/swagger';

export class BriefingResponseDto {
  @ApiProperty({
    description: 'AI-generated executive briefing on current global cyber threats',
    example: 'THREAT BRIEFING: Elevated ransomware activity detected across EMEA region. New zero-day vulnerability CVE-2024-XXXX affecting enterprise firewalls...'
  })
  briefing: string;
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ThreatsService } from './threats.service';

@Controller('api/threats')
export class ThreatsController {
  constructor(private readonly threatsService: ThreatsService) {}

  @Get()
  findAll(@Query('sort') sort?: string) {
    return this.threatsService.findAll(sort === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threatsService.findOne(id);
  }

  @Post()
  create(@Body() threat: any) {
    return this.threatsService.create(threat);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() threat: any) {
    return this.threatsService.update(id, threat);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.threatsService.remove(id);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.threatsService.updateStatus(id, status);
  }

  @Get('actor/:name')
  findByActor(@Param('name') name: string) {
    return this.threatsService.findByActor(name);
  }
}

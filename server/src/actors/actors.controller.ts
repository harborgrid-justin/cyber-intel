import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ActorsService } from './actors.service';

@Controller('api/actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Get()
  findAll() {
    return this.actorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actorsService.findOne(id);
  }

  @Post()
  create(@Body() actor: any) {
    return this.actorsService.create(actor);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() actor: any) {
    return this.actorsService.update(id, actor);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actorsService.remove(id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('api/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll() {
    return this.casesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  create(@Body() caseData: any) {
    return this.casesService.create(caseData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() caseData: any) {
    return this.casesService.update(id, caseData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}

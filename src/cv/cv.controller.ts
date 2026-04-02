import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvOwnershipGuard } from '../auth/guards/cv-ownership.guard';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCvDto: CreateCvDto, @Request() req: any) {
    return this.cvService.create(createCvDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    return this.cvService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: number, @Request() req: any) {
    return this.cvService.findOneByUser(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, CvOwnershipGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CvOwnershipGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

 @Post()
create(@Body() createCvDto: CreateCvDto, @Req() req: AuthenticatedRequest) {
  const userId = req.userId;

  return this.cvService.create(createCvDto, userId as number);
}

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateCvDto: UpdateCvDto, @Req() req: AuthenticatedRequest) {
    const userId = req.userId;
    return this.cvService.update(id, updateCvDto, userId as number);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.userId;
    return this.cvService.remove(+id, userId as number);
  }
}

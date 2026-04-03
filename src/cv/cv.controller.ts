import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvOwnershipGuard } from '../auth/guards/cv-ownership.guard';
import { use } from 'passport';
// import { AdminGuard } from '../guards/admin/admin.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@UseGuards(JwtAuthGuard)
// @Roles(UserRoleEnum.ADMIN)
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Post()
  create(@Body() createCvDto: CreateCvDto, @Request() req: any) {
    return this.cvService.create(createCvDto, req.user.id);
  }

  // version before making tha admin see all CVs and the user only his

  // @Get()
  // // @UseGuards(JwtAuthGuard)
  // findAll(@Request() req: any) {
  //   return this.cvService.findByUser(req.user.id);
  // }

  @Get()
  // @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    return this.cvService.findAll(req.user);

  }
  // @UseGuards(RolesGuard)
  // @Roles(UserRoleEnum.ADMIN)
  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: number, @Request() req: any) {
    return this.cvService.findOneByUser(id, req.user.id);
  }
  // @UseGuards(RolesGuard)
  // @Roles(UserRoleEnum.ADMIN)
  @Patch(':id')
  @UseGuards(CvOwnershipGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(id, updateCvDto);
  }
  // @UseGuards(RolesGuard)
  // @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  @UseGuards(CvOwnershipGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.remove(id);
  }
}

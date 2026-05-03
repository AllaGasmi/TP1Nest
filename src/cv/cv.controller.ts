import { Body, Controller, Delete, Get, MessageEvent, Param, ParseIntPipe, Patch, Post, Sse, UseGuards } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Observable } from 'rxjs';
import { CvActorContext } from './cv-actor-context.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @CurrentUser() user: any) {
    return this.cvService.create(createCvDto, this.userToActor(user));
  }

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get('debug/me')
  getCurrentUser(@CurrentUser() user: any) {
    const actor = this.userToActor(user);
    return {
      rawUser: user,
      actor,
      message: 'This helps debug SSE access issues - admin should have role: "admin"'
    };
  }

  @Sse('events')
  streamOperations(@CurrentUser() user: any): Observable<MessageEvent> {
    return this.cvService.streamOperations(this.userToActor(user));
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateCvDto: UpdateCvDto, @CurrentUser() user: any) {
    return this.cvService.update(id, updateCvDto, this.userToActor(user));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cvService.remove(+id, this.userToActor(user));
  }

  private userToActor(user: any): CvActorContext {
    return {
      userId: user.userId,
      username: user.username,
      role: (user.role?.toLowerCase() === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    };
  }
}

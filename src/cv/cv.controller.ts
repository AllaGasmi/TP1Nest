import { Body, Controller, Delete, Get,  Param, ParseIntPipe, Patch, Post, Sse, UseGuards } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { fromEvent, map, Observable, merge, filter } from 'rxjs';
import { CvActorContext } from './cv-actor-context.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APP_EVENTS } from '../common/constants/app-events';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private readonly cvService: CvService, private eventEmitter: EventEmitter2) {}

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

 /* @Sse('events')
  streamOperations(@CurrentUser() user: any): Observable<MessageEvent> {
    return this.cvService.streamOperations(this.userToActor(user));
  }
*/



  @Sse('sse')
  sse(@CurrentUser() user: any): Observable<MessageEvent> {

    const CV_EVENTS = [
        {
          key: APP_EVENTS.CV_ADD,
          type: 'cv-added',
        },
        {
          key: APP_EVENTS.CV_UPDATE,
          type: 'cv-updated',
        },
        {
          key: APP_EVENTS.CV_DELETE,
          type: 'cv-deleted',
        },
    ];
    /*return merge(
      fromEvent(this.eventEmitter, APP_EVENTS.CV_ADD).pipe(
        map((payload: any) => ({
          type: 'cv-added',
          data: payload,
        })),
      ),

      fromEvent(this.eventEmitter, APP_EVENTS.CV_UPDATE).pipe(
        map((payload: any) => ({
          type: 'cv-updated',
          data: payload,
        })),
      ),

      fromEvent(this.eventEmitter, APP_EVENTS.CV_DELETE).pipe(
        map((payload: any) => ({
          type: 'cv-deleted',
          data: payload,
        })),
      ),
    ).pipe(
      filter((event: any) => {

      if (user.role === UserRoleEnum.ADMIN) return true;

      const cvOwnerId = event.data?.cv?.user?.id ?? event.data?.cvOwnerId;

      return cvOwnerId === user.userId;
    }),
    );
    */
    const streams = CV_EVENTS.map((event) =>
    fromEvent(this.eventEmitter, event.key).pipe(
        map((payload: any) => ({
          type: event.type,
          data: payload,
        })),
      ),
    );
    return merge(...streams).pipe(
    filter((event: any) => {

      if (user.role === UserRoleEnum.ADMIN) {
        return true;
      }

      const cvOwnerId =
        event.data?.cv?.user?.id ??
        event.data?.cvOwnerId;

      return cvOwnerId === user.userId;
    }),
  );
  }


  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateCvDto: UpdateCvDto, @CurrentUser() user: any) {
    return this.cvService.update(id, updateCvDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cvService.remove(+id, user);
  }

  private userToActor(user: any): CvActorContext {
    if (!user) {
      throw new Error('User not authenticated. Please enable JwtAuthGuard.');
    }
    return {
      userId: user.userId,
      username: user.username,
      role: (user.role?.toLowerCase() === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    };
  }
}

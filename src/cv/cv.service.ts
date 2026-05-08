import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { SkillService } from '../skill/skill.service';
import { UserService } from '../user/user.service';
import { CvActorContext, CvPersistenceEventPayload } from './cv-actor-context.interface';
import { MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APP_EVENTS } from 'src/common/constants/app-events';
import { UserRoleEnum } from 'src/enums/user-role.enum';
@Injectable()
export class CvService {
  private readonly persistenceEvents = new Subject<CvPersistenceEventPayload>();

  constructor(
    @InjectRepository(Cv) private readonly cvRepo: Repository<Cv>,
    private readonly skillService: SkillService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createCvDto: CreateCvDto, actor: CvActorContext) {
    const { skillIds, userId, ...cvData } = createCvDto;
    const skills = skillIds ? await this.skillService.findByIds(skillIds) : [];
    const user = userId ? await this.userService.findOne(userId) ?? undefined : undefined;
    const cv = await this.cvRepo.create({
      ...cvData,
      skills,
      user,
    });
    const savedCv = await this.cvRepo.save(cv);
    this.eventEmitter.emit(APP_EVENTS.CV_ADD, {
      cv: savedCv
    });
    return savedCv;
  }
    

  async findAll() {
    const result=await this.cvRepo.find({ relations: {user: true, skills:true} });
    return result;
  }

  async findOne(id: number) {
    const result= await this.cvRepo.findOne({ where: { id }, relations: ['user', 'skills'] });
    return result;
  }

  async update(id: number, updateCvDto: UpdateCvDto, user: any) {
    const { skillIds, userId, ...cvData } = updateCvDto;
    const cv = await this.cvRepo.findOne({ where: { id }, relations: ['skills', 'user'] });
    if (!cv) {
      throw new Error('CV not found');
    }
    
    
    const beforeUpdate = {
      name: cv.name,
      firstname: cv.firstname,
      age: cv.age,
      Cin: cv.Cin,
      Job: cv.Job,
      path: cv.path,
      userId: cv.user?.id ?? null,
      skillIds: cv.skills?.map((skill) => skill.id) ?? [],
    };

    Object.assign(cv, cvData);
    if (userId) {
      const user = await this.userService.findOne(userId);
      if(!user) {
        throw new Error('User not found');
      }
      cv.user = user;
    }
    if (user.role !== UserRoleEnum.ADMIN && cv.user?.id !== user.id) {
      throw new Error('Unauthorized: Only CV owner or admin can update');
    }
    if (skillIds) {
      const skills = await this.skillService.findByIds(skillIds);
      cv.skills = skills;
    }
    const updatedCv = await this.cvRepo.save(cv);
    this.eventEmitter.emit(APP_EVENTS.CV_UPDATE, {
      cv: updatedCv
    });
    return updatedCv;
  }

  async remove(id: number, user) {
    const existingCv = await this.cvRepo.findOne({ where: { id }, relations: ['user'] });
    
    if (!existingCv) {
      throw new Error('CV not found');
    }
    
    // Authorization check: only owner or admin can delete
    if (user.role !== UserRoleEnum.ADMIN && existingCv.user?.id !== user.id) {
      throw new Error('Unauthorized: Only CV owner or admin can delete');
    }
    
    const result = await this.cvRepo.delete(id);
    if (result.affected) {
     this.eventEmitter.emit(APP_EVENTS.CV_DELETE, {
      cv: existingCv
    }
    );
    }
    return result;
    }

  /*streamOperations(actor: CvActorContext): Observable<MessageEvent> {
    console.log(`SSE Stream started for user: ${actor.username} (userId: ${actor.userId}, role: ${actor.role})`);
    return this.persistenceEvents.pipe(
      filter((event) => this.canAccessEvent(actor, event)),
      map((event) => ({ type: 'cv-operation', data: event } as MessageEvent)),
    );
  }
*/
}
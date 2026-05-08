import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { SkillModule } from '../skill/skill.module';
import { UserModule } from '../user/user.module';
import { CvOperation } from './entities/cv-operation.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CvListener } from './cv.listener';
@Module({
  imports:[TypeOrmModule.forFeature([Cv, CvOperation]), 
  SkillModule, 
  UserModule
  ],
  controllers: [CvController],
  providers: [CvService, CvListener],
})
export class CvModule {}

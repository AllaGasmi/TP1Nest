import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { SkillModule } from '../skill/skill.module';
import { UserModule } from '../user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([Cv]), SkillModule, UserModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}

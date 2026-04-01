import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { SkillModule } from '../skill/skill.module';
import { UserModule } from '../user/user.module';
import { AuthMiddleware } from 'src/middlewares/auth-middleware/auth-middleware.middleware';

@Module({
  imports:[TypeOrmModule.forFeature([Cv]), SkillModule, UserModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(CvController);
  }
}
import { MiddlewareConsumer, Module, NestModule, UnauthorizedException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { SkillModule } from './skill/skill.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { NextFunction, Request, Response } from 'express';
import { CvController } from './cv/cv.controller';
import { verify } from 'jsonwebtoken';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UserModule,
    CvModule,
    SkillModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(authMiddleware)
      .forRoutes(CvController);
  }
  
}
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader= req.headers['authorization'];
  if(!authHeader){
    throw new UnauthorizedException("you need to add an authorization header to your request");
  }
  const token=authHeader.split(' ')[1];
  const decoded=verify(token,"a-string-secret-at-least-256-bits-long");
  console.log("Decoded token:", decoded["userId"]);
  req["user"]={"userId":decoded["userId"]};
  next();
}

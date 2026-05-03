import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CvService } from '../cv/cv.service';
import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import {randFirstName,randLastName,randJobTitle,randNumber,randUuid,} from '@ngneat/falso';
import { Skill } from '../skill/entities/skill.entity';
import { User } from '../user/entities/user.entity';

async function bootstrap() {
const app = await NestFactory.createApplicationContext(AppModule);
  const cvService = app.get(CvService);
  const userService = app.get(UserService);
  const skillService = app.get(SkillService);

  const users: User[] = [];
  
  // Create one admin user
  const adminUser = await userService.create({
    username: 'admin_user',
    email: 'admin@mail.com',
    password: 'admin123',
    role: 'admin',
  });
  users.push(adminUser);
  
  // Create regular users
  for (let i = 0; i < 4; i++) {
    const user = await userService.create({
      username: `user_${i + 1}`,
      email: `user${i + 1}@mail.com`,
      password: 'password123',
      role: 'user',
    });
    users.push(user);
  }

  const skills: Skill[] = [];
  for (let i = 0; i < 10; i++) {
    const skill = await skillService.create({
      designation: randJobTitle(),
    });
    skills.push(skill);
  }

  for (let i = 0; i < 10; i++) {
    const randomUser = users[randNumber({ min: 0, max: users.length - 1 })];
    const randomSkill = skills[randNumber({ min: 0, max: skills.length - 1 })];
    await cvService.create(
      {
        name: randLastName(),
        firstname: randFirstName(),
        age: randNumber({ min: 20, max: 50 }),
        Cin: randUuid(),
        Job: randJobTitle(),
        path: 'path/to/file.pdf',
        skillIds: [randomSkill.id],
        userId: randomUser.id,
      },
      {
        userId: randomUser.id,
        username: randomUser.username,
        role: randomUser.role,
      },
    );
    }
    
  await app.close();
}

bootstrap();

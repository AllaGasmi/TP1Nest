import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { SkillService } from '../skill/skill.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv) private readonly cvRepo: Repository<Cv>,
    private readonly skillService: SkillService,
    private readonly userService: UserService,
  ) {}

  async create(createCvDto: CreateCvDto) {
    const { skillIds, userId, ...cvData } = createCvDto;
    const skills = skillIds ? await this.skillService.findByIds(skillIds) : [];
    const user = userId ? await this.userService.findOne(userId)?? undefined : undefined;;
    const cv = await this.cvRepo.create({
      ...cvData,
      skills,
      user,
    });
    return await this.cvRepo.save(cv);
  }

  async findAll() {
    const result=await this.cvRepo.find({ relations: {user: true, skills:true} });
    return result;
  }

  async findOne(id: number) {
    const result= await this.cvRepo.findOne({ where: { id }, relations: ['user', 'skills'] });
    return result;
  }

  async update(id: number, updateCvDto: UpdateCvDto) {
    const { skillIds, userId, ...cvData } = updateCvDto;
    const cv = await this.cvRepo.findOne({ where: { id }, relations: ['skills', 'user'] });
    if (!cv) {
      throw new Error('CV not found');
    }
    Object.assign(cv, cvData);
    if (userId) {
      const user = await this.userService.findOne(userId);
      if(!user) {
        throw new Error('User not found');
      }
      cv.user = user;
    }
    if (skillIds) {
      const skills = await this.skillService.findByIds(skillIds);
      cv.skills = skills;
    }
    return await this.cvRepo.save(cv);
  }

  async remove(id: number) {
    const result= await this.cvRepo.delete(id);
    return result;
  }
}

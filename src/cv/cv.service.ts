import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { SkillService } from '../skill/skill.service';
import { UserService } from '../user/user.service';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv) private readonly cvRepo: Repository<Cv>,
    private readonly skillService: SkillService,
    private readonly userService: UserService,
  ) {}

  async create(createCvDto: CreateCvDto, userId: number) {
    const { skillIds, ...cvData } = createCvDto;
    const skills = skillIds ? await this.skillService.findByIds(skillIds) : [];
    const user = await this.userService.findOne(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cv = await this.cvRepo.create({
      ...cvData,
      skills,
      user,
    });
    return await this.cvRepo.save(cv);
  }

  async findAll(user) {
    if (user.role === UserRoleEnum.ADMIN){
    const result = await this.cvRepo.find({ relations: { user: true, skills: true } });
    return result;
    }
    return await this.cvRepo.find({
    where: { user: { id: user.id } },
    relations: { user: true, skills: true },
  });
  }

  // Récupère tous les CVs de l'utilisateur connecté
  async findByUser(userId: number) {
    const result = await this.cvRepo.find({
      where: { user: { id: userId } },
      relations: { user: true, skills: true },
    });
    return result;
  }

  async findOne(id: number) {
    const result = await this.cvRepo.findOne({ where: { id }, relations: ['user', 'skills'] });
    return result;
  }

  // Récupère un CV spécifique si l'utilisateur en est propriétaire
  async findOneByUser(id: number, userId: number) {
    const cv = await this.cvRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'skills'],
    });

    if (!cv) {
      throw new ForbiddenException('You do not have access to this CV');
    }

    return cv;
  }

  async update(id: number, updateCvDto: UpdateCvDto) {
    const { skillIds, ...cvData } = updateCvDto;
    const cv = await this.cvRepo.findOne({ where: { id }, relations: ['skills', 'user'] });
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    Object.assign(cv, cvData);
    
    if (skillIds) {
      const skills = await this.skillService.findByIds(skillIds);
      cv.skills = skills;
    }
    return await this.cvRepo.save(cv);
  }

  async remove(id: number) {
    const result = await this.cvRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('CV not found');
    }
    return result;
  }
}

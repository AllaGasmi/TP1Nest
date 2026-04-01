import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class SkillService {
  constructor(@InjectRepository(Skill) private readonly skillRepo: Repository<Skill>) {}

  async create(createSkillDto: CreateSkillDto) {
    const skill = await this.skillRepo.save(createSkillDto);
    return skill;
  }

  async findAll() {
    const skills = await this.skillRepo.find();
    return skills;
  }
  async findByIds(skillIds: number[]) {
    const skills = await this.skillRepo.find({ where: { id: In(skillIds) } });
    return skills;
  }

  async findOne(id: number) {
    const skill = await this.skillRepo.findOne({ where: { id } });
    return skill;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    await this.skillRepo.update(id, updateSkillDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const skill = await this.findOne(id);
    if(skill) {
      await this.skillRepo.remove(skill);
    }
    return skill;
  }
}

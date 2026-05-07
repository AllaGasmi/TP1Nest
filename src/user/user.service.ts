import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { WebhookService } from '../webhook/webhook.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly webhookService: WebhookService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepo.save(createUserDto);
    await this.webhookService.sendUserForValidation({
      id: user.id,
      age: user.age,
      
    });

    return user;
  }

  async findAll() {
    const users = await this.userRepo.find({ relations: ['cvs'] });
    return users;
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (user) {
      await this.userRepo.remove(user);
    }
    return user;
  }
}

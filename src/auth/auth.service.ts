import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(userData: RegisterDto): Promise<Partial<User>>{
    const user = await this.userRepository.create({
      ...userData
    });
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt)
    try{
      await this.userRepository.save(user)
    }
    catch(e){
      throw new ConflictException(`Le username et l'email doivent être unique`)
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  }

  async login(userData: LoginDto): Promise<Partial<User>> {
    const {username, password} = userData;
    const user = await this.userRepository.createQueryBuilder('user')
    .where('user.username = :username or user.email = :username',{username}).getOne();

    if(!user)
      throw new NotFoundException('Username ou password erroné');
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    if(bcrypt.compare(user.password, hashedPassword)){
      
      return {
        username: user.username,
        email: user.email,
        role: user.role
      };
    }

    throw new NotFoundException('Username ou password erroné')

  }
}
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
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

  async login(userData: LoginDto): Promise<{ access_token: string }> {
    const {username, password} = userData;
    const user = await this.userRepository.createQueryBuilder('user')
    .where('user.username = :username or user.email = :username',{username}).getOne();

    if(!user)
      throw new NotFoundException('Username ou password erroné');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid)
      throw new UnauthorizedException('Username ou password erroné');

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
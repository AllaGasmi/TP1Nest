import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.generateToken(user);
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.generateToken(user);
  }

  async validateUser(username: string, password: string) {
    const users = await this.userService.findAll();
    const user = users.find((u) => u.username === username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
      },
    };
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../user/entities/user.entity';

@Controller('webhook')
export class WebhookController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('user-validated')
  async handleUserValidated(
      @Body() body: { userId: number; status: 'APPROVED' | 'REJECTED'  },
  ) {
    await this.userRepository.update(body.userId, {
      status: body.status as UserStatus,
    });

    console.log(` User ${body.userId} mis à jour : ${body.status}`);

    return { message: 'statut mis à jour avec succès' };
  }
}

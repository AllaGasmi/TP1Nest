import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CvOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const cvId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const cv = await this.cvRepository.findOne({
      where: { id: parseInt(cvId) },
      relations: ['user'],
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.user.id !== user.id) {
      throw new ForbiddenException('You can only modify/delete your own CVs');
    }

    request.cv = cv;
    return true;
  }
}

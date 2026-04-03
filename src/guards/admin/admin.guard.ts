import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRoleEnum } from '../../enums/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
  
  if (!request.user) {
    console.log('User not found in request');
    throw new ForbiddenException('request.user is undefined');

  }

  if (user.role !== UserRoleEnum.ADMIN) {
        throw new ForbiddenException('only admin can access this route');
      }
  
      return true;
    }
}


import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRoleEnum } from '../../enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      'roles',
      [
        context.getHandler(),
        context.getClass(), 
      ],
    );
     const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;
    if (!requiredRoles) return true;
    console.log('requiredRoles:', requiredRoles);
    console.log('user.role:', user?.role);
    return requiredRoles.includes(user.role);
  }
}

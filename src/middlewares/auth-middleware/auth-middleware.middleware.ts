import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers['auth-user'] as string; 

    if (!token) {
      throw new UnauthorizedException('Token JWT manquant');
    }

    try {
      const secret = 'SECRET_KEY';
      const decoded = verify(token, secret) as { userId: string | number };

      if (!decoded.userId) {
        throw new UnauthorizedException('Token invalide : userId manquant');
      }

      // Injecter userId dans la request
      req.userId = decoded.userId;

      next();
    } catch (err) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
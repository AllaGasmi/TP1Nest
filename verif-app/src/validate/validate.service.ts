import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface UserPayload {
  id: number;
  age: number;
  callbackUrl: string;
}

interface ValidationResult {
  userId: number;
  status: string;
}

@Injectable()
export class ValidateService {
  private readonly logger = new Logger(ValidateService.name);

  private readonly AGE_MINIMUM = 18;

  constructor(private readonly httpService: HttpService) {}

  async validateAndCallback(payload: UserPayload): Promise<void> {
    const result = this.validate(payload);
    console.log(`Résultat validation userId ${payload.id}: ${result.status}`)

    await this.sendCallback(payload.callbackUrl, result);
  }

  private validate(payload: UserPayload): ValidationResult {
    if (payload.age < this.AGE_MINIMUM) {
      return {
        userId: payload.id,
        status: 'REJECTED',
      };
    }

    return {
      userId: payload.id,
      status: 'APPROVED',
    };
  }

  private async sendCallback(
    callbackUrl: string,
    result: ValidationResult,
  ): Promise<void> {
    try {
      this.logger.log(`Envoi du résultat à: ${callbackUrl}`);

      await firstValueFrom(
        this.httpService.post(callbackUrl, result),
      );

      this.logger.log(`Callback envoyé avec succès`);
    } catch (err: unknown) {
      this.logger.error(`Échec envoi callback: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }
}
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ValidateService } from './validate.service';

interface UserPayload {
  id: number;
  age: number;
  callbackUrl: string;
}

@Controller('validate')
export class ValidateController {
  private readonly logger = new Logger(ValidateController.name);

  constructor(private readonly validateService: ValidateService) {}

  @Post('user')
  async validateUser(@Body() payload: UserPayload) {
    this.logger.log(` Demande de validation reçue pour userId: ${payload.id}`);

    this.validateService.validateAndCallback(payload).catch((err) =>
      this.logger.error(`Erreur validation: ${err.message}`),
    );

    return { message: 'Validation en cours...' };
  }
}
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WebhookService {
  private readonly validationServerUrl = process.env.VALIDATION_URL ||'';

  async sendUserForValidation(user: {
    id: number;
    age: number;
  }) {
    try {
      await axios.post(this.validationServerUrl, {
        userId: user.id,
        age: user.age,
        callbackUrl: 'http://localhost:3000/webhook/user-validated',
      });
      console.log('User envoyé pour validation');
    } catch (error) {
      console.error('Erreur envoi webhook:', error.message);
    }
  }
}

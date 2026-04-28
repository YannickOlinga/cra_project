import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type RecaptchaVerifyResponse = {
  success?: boolean;
  hostname?: string;
  challenge_ts?: string;
  'error-codes'?: string[];
};

@Injectable()
export class RecaptchaService {
  constructor(private readonly configService: ConfigService) {}

  async verifyContactToken(token: string, remoteIp: string) {
    return this.verifyToken(token, remoteIp);
  }

  async verifyRegisterToken(token: string, remoteIp: string) {
    return this.verifyToken(token, remoteIp);
  }

  private async verifyToken(token: string, remoteIp: string) {
    if (!token?.trim()) {
      throw new BadRequestException('Verification reCAPTCHA manquante.');
    }

    const secret = this.configService.get<string>('RECAPTCHA_SECRET_KEY');

    if (!secret) {
      throw new ServiceUnavailableException('reCAPTCHA est mal configure.');
    }

    const body = new URLSearchParams({
      secret,
      response: token,
    });

    if (remoteIp && remoteIp !== 'unknown') {
      body.set('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const verification = (await response.json().catch(() => null)) as
      | RecaptchaVerifyResponse
      | null;

    if (!response.ok || !verification) {
      throw new ServiceUnavailableException('Verification reCAPTCHA impossible.');
    }

    if (!verification.success) {
      throw new UnauthorizedException('Verification reCAPTCHA invalide.');
    }
  }
}

import {
  Body,
  Controller,
  HttpException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ContactRateLimiterService } from './contact-rate-limiter.service';
import { ContactMessageDto } from './dto/contact-message.dto';
import { MailService } from './mail.service';
import { RecaptchaService } from './recaptcha.service';

@Controller('mail')
export class MailController {
  constructor(
    private readonly contactRateLimiterService: ContactRateLimiterService,
    private readonly mailService: MailService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('contact')
  async sendContactMessage(
    @Body() contactMessageDto: ContactMessageDto,
    @Req() request: Request,
  ) {
    if (contactMessageDto.website?.trim()) {
      return {
        message: 'Message envoye avec succes.',
      };
    }

    if (!this.contactRateLimiterService.isAllowed(this.getRequestIdentifier(request))) {
      throw new HttpException(
        'Trop de messages envoyes. Veuillez reessayer plus tard.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.recaptchaService.verifyContactToken(
      contactMessageDto.recaptchaToken,
      this.getRequestIdentifier(request),
    );

    await this.mailService.sendContactMessage(contactMessageDto);

    return {
      message: 'Message envoye avec succes.',
    };
  }

  private getRequestIdentifier(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const firstForwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0];

    return (
      firstForwardedIp?.trim() ||
      request.ip ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}

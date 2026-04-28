import { Module } from '@nestjs/common';
import { ContactRateLimiterService } from './contact-rate-limiter.service';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { RecaptchaService } from './recaptcha.service';

@Module({
  controllers: [MailController],
  providers: [ContactRateLimiterService, MailService, RecaptchaService],
  exports: [MailService, RecaptchaService],
})
export class MailModule {}

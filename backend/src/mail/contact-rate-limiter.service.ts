import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

@Injectable()
export class ContactRateLimiterService {
  private readonly attempts = new Map<string, RateLimitEntry>();

  constructor(private readonly configService: ConfigService) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowMs = Number(
      this.configService.get<string>('CONTACT_RATE_LIMIT_WINDOW_MS') ?? 15 * 60 * 1000,
    );
    const maxAttempts = Number(
      this.configService.get<string>('CONTACT_RATE_LIMIT_MAX') ?? 5,
    );
    const entry = this.attempts.get(identifier);

    this.cleanupExpired(now);

    if (!entry || entry.resetAt <= now) {
      this.attempts.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxAttempts) {
      return false;
    }

    entry.count += 1;
    return true;
  }

  private cleanupExpired(now: number) {
    for (const [identifier, entry] of this.attempts.entries()) {
      if (entry.resetAt <= now) {
        this.attempts.delete(identifier);
      }
    }
  }
}

import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { APP_FILTER } from '@nestjs/core';
import { SentryNestExceptionFilter } from './sentry.filter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryNestExceptionFilter,
    },
  ],
})
export class SentryModule implements OnModuleInit {
  private logger: Logger = new Logger('SentryModule');

  constructor(private config: ConfigService) {}

  onModuleInit(): void {
    const dsn = this.config.get('SENTRY_DSN');
    if (!dsn) {
      this.logger.log('Sentry is disabled (SENTRY_DSN is not set)');
      return;
    }

    Sentry.init({ dsn });
    this.logger.log('Sentry is enabled');
  }
}

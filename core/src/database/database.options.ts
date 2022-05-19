import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class DatabaseOptions implements TypeOrmOptionsFactory {
  constructor(private config: ConfigService) {}

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.config.get('DATABASE_HOST', 'localhost'),
      port: parseInt(this.config.get('DATABASE_PORT', '5432')),
      username: this.config.get('DATABASE_USER', 'postgres'),
      password: this.config.get('DATABASE_PASS', ''),
      database: this.config.get('DATABASE_NAME', 'postgres'),
      synchronize: this.config.get('DATABASE_SYNCHRONIZE', false) === 'true',
      logging: this.config.get('DATABASE_LOGGING', false) === 'true',
      migrations: [
        path.join(__dirname, 'migrations/**/*.{ts,js}'),
        path.join(
          __dirname,
          '../../node_modules/**/venat-module-*/dist/database/migrations/**/*.{ts,js}',
        ),
      ],
      migrationsRun: true,
      autoLoadEntities: true,
    };
  }
}

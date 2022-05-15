import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BotModule } from './bot/bot.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ModuleLoader } from './module-system/module.loader';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UsersModule,
    BotModule,
    ModuleLoader.findAndLoadModules(),
  ],
})
export class AppModule {}

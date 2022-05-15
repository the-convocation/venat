import { DiscordModule, registerGuardGlobally } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { PlayCommand } from './commands/play.command';
import { PlaylistCommand } from './commands/playlist.command';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordOptions } from './discord.options';
import { UserCanUseBotGuard } from '../users/guards/user-can-use-bot.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DiscordOptions,
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: registerGuardGlobally(),
      useClass: UserCanUseBotGuard,
    },
    PlayCommand,
    PlaylistCommand,
  ],
})
export class BotModule {}

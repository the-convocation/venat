import { Injectable } from '@nestjs/common';
import {
  DiscordModuleOption,
  DiscordOptionsFactory,
} from '@discord-nestjs/core';
import { Intents } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordOptions implements DiscordOptionsFactory {
  constructor(private config: ConfigService) {}

  public createDiscordOptions(): DiscordModuleOption {
    return {
      token: this.config.get('TOKEN'),
      discordClientOptions: {
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
      },
      registerCommandOptions: [
        {
          forGuild: this.config.get('GUILD_ID_WITH_COMMANDS'),
          removeCommandsBefore: true,
        },
      ],
    };
  }
}

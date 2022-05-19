import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';
import { ConfigService } from '@the-convocation/venat-core';

@Command({
  description: 'Dumps configuration data',
  name: 'dumpconfig',
})
export class DumpConfigCommand implements DiscordTransformedCommand<unknown> {
  private readonly logger: Logger = new Logger('DumpConfigCommand');

  public constructor(private readonly config: ConfigService) {}

  public async handler({
    interaction,
  }: TransformedCommandExecutionContext): Promise<InteractionReplyOptions> {
    const configs = await Promise.all([
      this.config.getGlobalConfig(),
      this.config.getGuildConfig(parseInt(interaction?.guild?.id ?? '0')),
      this.config.getUserConfig(parseInt(interaction?.user.id ?? '0')),
    ]);

    const embeds: MessageEmbed[] = [];
    for (const config of configs) {
      embeds.push(
        new MessageEmbed({
          title: 'Configuration',
          description: JSON.stringify(config, null, 2),
        }),
      );
    }

    return {
      embeds,
    };
  }
}

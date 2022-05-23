import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { Scraper } from '@the-convocation/twitter-scraper';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';
import {
  FashionReportInfo,
  getFashionReportInfographic,
} from '../data/fashion-report';
import { FashionDto } from '../dto/fashion.dto';

@Command({
  description: "Look up Kaiyoko's Fashion Report information.",
  name: 'fashion',
})
@UsePipes(TransformPipe)
export class FashionCommand implements DiscordTransformedCommand<FashionDto> {
  private readonly logger: Logger = new Logger('FashionCommand');
  private readonly scraper = new Scraper();

  public async handler(
    @Payload() dto: FashionDto,
  ): Promise<InteractionReplyOptions> {
    let fr: FashionReportInfo | null = null;
    try {
      fr = await getFashionReportInfographic(this.scraper, dto.info);
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      this.logger.error(err.message, err.stack);
    }

    if (fr == null) {
      return { content: 'Could not fetch tweets.' };
    }

    const embed = new MessageEmbed()
      .setTitle(fr.title)
      .setColor('#f14242')
      .setImage(fr.image)
      .setFooter({
        text: 'Infographics published by @KaiyokoStar',
        iconURL:
          'https://pbs.twimg.com/profile_images/1517674417282641921/3UiebMGj_normal.jpg',
      });

    return {
      embeds: [embed],
    };
  }
}

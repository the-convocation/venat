import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';
import { getMarketInfo } from '../data/universalis';
import { getItemIdByName } from '../data/xivapi';
import { MarketDto } from '../dto/market.dto';
import { buildTextTable, getMarketInfoByName } from '../data/listings';

@Command({
  description: 'Look up prices for an item on the market board.',
  name: 'market',
})
@UsePipes(TransformPipe)
export class MarketCommand implements DiscordTransformedCommand<MarketDto> {
  private readonly logger: Logger = new Logger('MarketCommand');

  public async handler(
    @Payload() dto: MarketDto,
  ): Promise<InteractionReplyOptions> {
    const getMarketInfoPartial = getMarketInfoByName(
      getItemIdByName,
      getMarketInfo,
      this.logger.error,
    );
    const marketInfo = await getMarketInfoPartial(dto.item, dto.server);
    if (typeof marketInfo === 'string') {
      return { content: marketInfo };
    }

    const { lastUploadTime, listings, worldName, dcName, itemName } =
      marketInfo;
    const listingsEmbed = new MessageEmbed()
      .setTitle(`Cheapest listings for ${itemName} on ${dcName ?? worldName}`)
      .setDescription('```' + buildTextTable(listings, worldName) + '```')
      .setColor('#a58947')
      .setFooter({
        text: 'Last updated:',
      })
      .setTimestamp(lastUploadTime);

    return {
      embeds: [listingsEmbed],
    };
  }
}

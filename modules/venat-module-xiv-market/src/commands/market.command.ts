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
import { getMarketInfoByName, ItemMarketListing } from '../data/listings';
import { table } from 'table';

function buildTextTable(
  listings: ItemMarketListing[],
  worldName: string | null | undefined,
  startIdx: number,
  endIdx: number,
): string {
  return table([
    ['HQ', 'Unit Price', 'Quantity', 'Total', 'World'],
    ...listings
      .sort((a, b) => a.pricePerUnit - b.pricePerUnit)
      .slice(startIdx, endIdx)
      .map((l) => [
        l.hq ? 'Yes' : 'No',
        l.pricePerUnit.toLocaleString('en'),
        l.quantity.toLocaleString('en'),
        l.total.toLocaleString('en'),
        worldName ?? l.worldName,
      ]),
  ]);
}

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

    const startIdx = 0;
    const endIdx = 10;

    const listingsEmbed = new MessageEmbed()
      .setTitle(`Cheapest listings for ${itemName} on ${dcName ?? worldName}`)
      .setDescription(
        '```' + buildTextTable(listings, worldName, startIdx, endIdx) + '```',
      )
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

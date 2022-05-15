import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';
import { getMarketListings } from '../data/universalis';
import { getItemIdByName } from '../data/xivapi';
import { table } from 'table';
import { MarketDto } from '../dto/market.dto';

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
    const itemLookup = await getItemIdByName(dto.item);
    if (itemLookup.err != null) {
      this.logger.error(itemLookup.err.message, itemLookup.err.stack);
      return {
        content: 'Failed to access XIVAPI; please try again later.',
      };
    }

    if (!itemLookup.success) {
      return {
        content:
          'The item could not be found; please check your spelling and try again.',
      };
    }

    const item = itemLookup.value;
    const marketLookup = await getMarketListings(item.ID, dto.server);
    if (marketLookup.err != null) {
      this.logger.error(marketLookup.err.message, marketLookup.err.stack);
      return {
        content:
          'The item could not be found; please check your spelling of the server and try again.',
      };
    }

    if (!marketLookup.success) {
      return {
        content:
          'The item could not be found; please check your spelling and try again.',
      };
    }

    const { lastUploadTime, listings, worldName, dcName } = marketLookup.value;
    const listingsEmbed = new MessageEmbed()
      .setTitle(`Cheapest listings for ${item.Name} on ${dcName ?? worldName}`)
      .setDescription(
        '```' +
          table([
            ['HQ', 'Unit Price', 'Quantity', 'Total', 'World'],
            ...listings
              .sort((a, b) => a.pricePerUnit - b.pricePerUnit)
              .slice(0, 10)
              .map((l) => [
                l.hq ? 'Yes' : 'No',
                l.pricePerUnit.toLocaleString('en'),
                l.quantity.toLocaleString('en'),
                l.total.toLocaleString('en'),
                worldName ?? l.worldName,
              ]),
          ]) +
          '```',
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

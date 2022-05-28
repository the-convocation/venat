import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';
import { Forecast, Forecaster } from '../data/weather';
import { WeatherDto } from '../dto/weather.dto';

@Command({
  description: 'See FFXIV zone weather.',
  name: 'weather',
})
@UsePipes(TransformPipe)
export class WeatherCommand implements DiscordTransformedCommand<WeatherDto> {
  private readonly logger: Logger = new Logger('WeatherCommand');
  private readonly forecaster: Forecaster = new Forecaster();

  public async handler(
    @Payload() dto: WeatherDto,
    { interaction }: TransformedCommandExecutionContext,
  ) {
    // Resolving XIVAPI requests can ultimately take longer than the
    // 3 seconds alloted to interactions by default, so we need to
    // defer the interaction resolution and edit the reserved reply.
    await interaction.deferReply();

    this.logger.log(`Calculating forecast for zone \"${dto.zone}\".`);

    let forecast: Forecast;
    try {
      forecast = await this.forecaster.getForecast(dto.zone, dto.lang, 1);
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      this.logger.error(err.message, err.stack);
      await interaction.editReply({ content: 'Failed to fetch weather.' });
      return;
    }

    await interaction.editReply({
      content: `${forecast[0].weather.name} (Started at ${forecast[0].time})`,
    });
  }
}

import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { MessageEmbed } from 'discord.js';
import { Forecast, Forecaster } from '../data/weather';
import { WeatherDto } from '../dto/weather.dto';
/// <reference path="colorthief.d.ts"/>
import { getColor } from 'colorthief';

function formatTime(t: Date): string {
  return t.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

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

    let res: Forecast;
    try {
      res = await this.forecaster.getForecast(dto.zone, dto.lang, 15);
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      this.logger.error(err.message, err.stack);
      await interaction.editReply({ content: 'Failed to fetch weather.' });
      return;
    }

    const { zone, forecast } = res;
    const color = await getColor(forecast[0].weather.icon);
    const embed = new MessageEmbed()
      .setTitle(`Forecast for ${zone}`)
      .setColor(`#${color.map((c) => c.toString(16)).join('')}`)
      .setThumbnail(forecast[0].weather.icon)
      .setDescription(
        forecast
          .map((f, i) =>
            i === 0
              ? `Current weather: ${f.weather.name}`
              : `${formatTime(f.time)}: ${f.weather.name}`,
          )
          .reduce((agg, next) => `${agg}\n${next}`, ''),
      )
      .setFooter({ text: 'Next weather starts at:' })
      .setTimestamp(forecast[1].time);

    await interaction.editReply({ embeds: [embed] });
  }
}

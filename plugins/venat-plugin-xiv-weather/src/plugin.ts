import { DiscordModule } from '@discord-nestjs/core';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { VenatPlugin } from '@the-convocation/venat-core';
import { WeatherCommand } from './commands/weather.command';

@VenatPlugin()
@Module({
  imports: [DiscordModule.forFeature()],
  providers: [WeatherCommand],
})
export class WeatherPlugin implements OnModuleInit {
  private readonly logger: Logger = new Logger('WeatherPlugin');

  public onModuleInit(): void {
    this.logger.log('WeatherPlugin loaded!');
  }
}

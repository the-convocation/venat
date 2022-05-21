import { DiscordModule } from '@discord-nestjs/core';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { VenatPlugin } from '@the-convocation/venat-core';
import { MarketCommand } from './commands/market.command';

@VenatPlugin()
@Module({
  imports: [DiscordModule.forFeature()],
  providers: [MarketCommand],
})
export class MarketPlugin implements OnModuleInit {
  private readonly logger: Logger = new Logger('MarketPlugin');

  public onModuleInit(): void {
    this.logger.log('MarketPlugin loaded!');
  }
}

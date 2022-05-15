import { DiscordModule } from '@discord-nestjs/core';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { VenatModule } from '@the-convocation/venat-core';
import { MarketCommand } from './commands/market.command';

@VenatModule({
  description: "A module for searching FFXIV's market data.",
  name: 'Market',
})
@Module({
  imports: [DiscordModule.forFeature()],
  providers: [MarketCommand],
})
export class MarketModule implements OnModuleInit {
  private readonly logger: Logger = new Logger('MarketModule');

  public onModuleInit(): void {
    this.logger.log('MarketModule loaded!');
  }
}

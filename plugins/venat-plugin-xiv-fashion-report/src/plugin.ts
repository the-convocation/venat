import { DiscordModule } from '@discord-nestjs/core';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { VenatPlugin } from '@the-convocation/venat-core';
import { FashionCommand } from './commands/fashion.command';

@VenatPlugin()
@Module({
  imports: [DiscordModule.forFeature()],
  providers: [FashionCommand],
})
export class MarketPlugin implements OnModuleInit {
  private readonly logger = new Logger('FashionPlugin');

  public onModuleInit(): void {
    this.logger.log('FashionPlugin loaded!');
  }
}

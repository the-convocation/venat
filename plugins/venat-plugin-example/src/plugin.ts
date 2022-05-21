import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import {
  ConfigModule,
  PLUGIN_PACKAGE_NAME,
  PLUGIN_PACKAGE_VERSION,
  UsersModule,
  VenatPlugin,
} from '@the-convocation/venat-core';
import { DumpConfigCommand } from './commands/dump-config.command';
import { DiscordModule } from '@discord-nestjs/core';

@VenatPlugin()
@Module({
  imports: [
    ConfigModule.forFeature(ExamplePlugin),
    DiscordModule.forFeature(),
    UsersModule,
  ],
  providers: [DumpConfigCommand],
})
export class ExamplePlugin implements OnModuleInit {
  private readonly logger: Logger = new Logger('ExamplePlugin');

  public constructor(
    @Inject(PLUGIN_PACKAGE_NAME) private readonly packageName: string,
    @Inject(PLUGIN_PACKAGE_VERSION) private readonly packageVersion: string,
  ) {}

  public onModuleInit(): void {
    this.logger.log('ExamplePlugin loaded!');
    this.logger.log(`${this.packageName} v${this.packageVersion}`);
  }
}

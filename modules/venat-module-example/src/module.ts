import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import {
  ConfigModule,
  MODULE_PACKAGE_NAME,
  MODULE_PACKAGE_VERSION,
  UsersModule,
  VenatModule,
} from '@the-convocation/venat-core';
import { DumpConfigCommand } from './commands/dump-config.command';
import { DiscordModule } from '@discord-nestjs/core';

@VenatModule({
  description: 'This is an example module',
  name: 'Example Module',
})
@Module({
  imports: [
    ConfigModule.forFeature(ExampleModule),
    DiscordModule.forFeature(),
    UsersModule,
  ],
  providers: [DumpConfigCommand],
})
export class ExampleModule implements OnModuleInit {
  private readonly logger: Logger = new Logger('ExampleModule');

  public constructor(
    @Inject(MODULE_PACKAGE_NAME) private readonly packageName: string,
    @Inject(MODULE_PACKAGE_VERSION) private readonly packageVersion: string,
  ) {}

  public onModuleInit(): void {
    this.logger.log('ExampleModule loaded!');
    this.logger.log(`${this.packageName} v${this.packageVersion}`);
  }
}

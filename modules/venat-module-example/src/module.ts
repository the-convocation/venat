import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
  VenatModule,
} from '@the-convocation/venat-core';
import { MODULE_PACKAGE_NAME } from '@the-convocation/venat-core/dist/src/module-system/module.constants';

@VenatModule({
  description: 'This is an example module',
  name: 'Example Module',
})
@Module({
  imports: [ConfigModule.forFeature()],
})
export class ExampleModule implements OnModuleInit {
  private readonly logger: Logger = new Logger('ExampleModule');

  private constructor(
    @Inject(MODULE_PACKAGE_NAME) private readonly packageName: string,
    private config: ConfigService,
  ) {}

  public onModuleInit(): void {
    this.logger.log('ExampleModule loaded! - ' + this.packageName);
  }
}

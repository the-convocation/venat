import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { VenatModule } from '@the-convocation/venat-core';

@VenatModule({
  description: 'This is an example module',
  name: 'Example Module',
})
@Module({
  imports: [],
})
export class ExampleModule implements OnModuleInit {
  private readonly logger: Logger = new Logger('ExampleModule');

  public onModuleInit(): void {
    this.logger.log('ExampleModule loaded!');
  }
}

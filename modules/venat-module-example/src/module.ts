import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { VenatModule } from '@the-convocation/venat-core';

@VenatModule({
  name: 'Example Module',
  description: 'This is an example module',
})
@Module({
  imports: [],
})
export class ExampleModule implements OnModuleInit {
  private readonly logger = new Logger('ExampleModule');

  onModuleInit() {
    this.logger.log('ExampleModule loaded!');
  }
}

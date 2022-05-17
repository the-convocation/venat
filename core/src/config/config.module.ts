import { DynamicModule, Module, Type } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigService } from './config.service';
import { MODULE_PACKAGE_NAME } from '../module-system/module.constants';
import { INQUIRER } from '@nestjs/core';

@Module({
  imports: [DatabaseModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
  static forFeature(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: ConfigService,
          useFactory: (inquirer: Type<unknown>) => {
            const packageName: string = Reflect.getMetadata(
              MODULE_PACKAGE_NAME,
              inquirer.constructor,
            );
            return new ConfigService(packageName);
          },
          inject: [INQUIRER],
        },
      ],
    };
  }
}

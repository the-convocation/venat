import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigService } from './config.service';
import { MODULE_PACKAGE_NAME } from '../module-system/module.constants';

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
          useFactory: (packageId: string) => {
            // @Inject(INQUIRER)
            return new ConfigService(packageId);
          },
          inject: [MODULE_PACKAGE_NAME],
        },
      ],
    };
  }
}

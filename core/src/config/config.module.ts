import { DynamicModule, Module, Type } from '@nestjs/common';
import { ConfigService } from './config.service';
import { MODULE_PACKAGE_NAME } from '../module-system/module.constants';
import { INQUIRER } from '@nestjs/core';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
import { DataSource } from 'typeorm';

@Module({})
export class ConfigModule {
  static forFeature(module?: Type<unknown>): DynamicModule {
    return {
      module: ConfigModule,
      imports: [TypeOrmModule.forFeature([Config])],
      providers: [
        {
          provide: ConfigService,
          useFactory: (inquirer: Type<unknown>, dataSource: DataSource) => {
            const target = module ?? inquirer;
            if (!target) {
              throw new Error(
                'Unknown target; try ConfigModule.forFeature(ModuleTypeName)',
              );
            }

            const packageName: string = Reflect.getMetadata(
              MODULE_PACKAGE_NAME,
              target.constructor,
            );

            return new ConfigService(
              packageName,
              dataSource.getRepository<Config>(Config),
            );
          },
          inject: [INQUIRER, getDataSourceToken()],
        },
      ],
      exports: [ConfigService],
    };
  }
}

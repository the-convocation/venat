import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { VenatModule } from './module-system/venat-module.decorator';
import { VenatModuleMetadata } from './module-system/venat-module.metadata';
import { LookupResult } from './util/io';
import { cleanText, TextParameter } from './util/text';
import {
  MODULE_PACKAGE_NAME,
  MODULE_PACKAGE_VERSION,
} from './module-system/module.constants';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { UserIsBotAdminGuard } from './users/guards/user-is-bot-admin.guard';

export {
  cleanText,
  ConfigModule,
  ConfigService,
  LookupResult,
  MODULE_PACKAGE_NAME,
  MODULE_PACKAGE_VERSION,
  TextParameter,
  UserIsBotAdminGuard,
  UsersModule,
  UsersService,
  VenatModule,
  VenatModuleMetadata,
};

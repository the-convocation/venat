import { Inject, Injectable, Scope } from '@nestjs/common';
import { MODULE_PACKAGE_NAME } from '../module-system/module.constants';

@Injectable({ scope: Scope.TRANSIENT })
export class ConfigService {
  constructor(@Inject(MODULE_PACKAGE_NAME) private readonly packageId: string) {
    console.log('packageId: ' + packageId);
  }

  whoami(): string {
    return this.packageId;
  }
}

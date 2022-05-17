import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class ConfigService {
  constructor(private readonly packageId: string) {}
}

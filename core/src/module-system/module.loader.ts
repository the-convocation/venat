import { DynamicModule, Logger, Module, Type } from '@nestjs/common';
import * as resolvePackagePath from 'resolve-package-path';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VenatModuleMetadata } from './venat-module.metadata';
import { METADATA_KEY } from './venat-module.decorator';
import { PackageManifest } from './package-manifest.type';
import {
  MODULE_PACKAGE_NAME,
  MODULE_PACKAGE_VERSION,
} from './module.constants';

@Module({})
export class ModuleLoader {
  private static readonly logger: Logger = new Logger('ModuleManager');
  private static loadedModuleInfo: VenatModuleMetadata[] = [];

  public static get loadedModules(): VenatModuleMetadata[] {
    return ModuleLoader.loadedModuleInfo;
  }

  public static async findAndLoadModules(): Promise<DynamicModule> {
    let foundNodeModules = false;
    let checkPath = resolvePackagePath(
      '@the-convocation/venat-core',
      __dirname,
    );

    if (checkPath == null) {
      throw new Error(`Failed to resolve own package path.`);
    }

    let modulesPath;

    do {
      modulesPath = path.join(checkPath, 'node_modules');
      try {
        await fs.stat(modulesPath);
        foundNodeModules = true;
      } catch (e) {
        checkPath = path.dirname(checkPath);
      }
    } while (!foundNodeModules);

    this.logger.log(`Found modules path: ${modulesPath}`);

    const resolved = await ModuleLoader.resolveModules(modulesPath);
    return ModuleLoader.loadModules(resolved);
  }

  private static async resolveModules(
    rootPath: string,
    prefix?: string,
  ): Promise<DynamicModule[]> {
    const nodeModules = await fs.readdir(rootPath);
    const resolvedModules: DynamicModule[] = [];
    for (const nodeModule of nodeModules) {
      if (nodeModule.startsWith('@') && prefix == null) {
        resolvedModules.push(
          ...(await this.resolveModules(
            path.join(rootPath, nodeModule),
            nodeModule + '/',
          )),
        );

        continue;
      }

      if (nodeModule.startsWith('venat-module-')) {
        try {
          const modulePath = (prefix ?? '') + nodeModule;
          const module: { [key: string]: object } = await import(modulePath);
          const { name: moduleName, version: moduleVersion }: PackageManifest =
            await import(modulePath + '/package.json');

          const nestModule = Object.values(module).find(
            (item): item is Type<unknown> =>
              Reflect.hasMetadata(METADATA_KEY, item),
          );

          if (nestModule == null) {
            throw new Error(
              `Module ${module} does not have @VenatModule decorator`,
            );
          }

          const metadata: VenatModuleMetadata = Reflect.getMetadata(
            METADATA_KEY,
            nestModule,
          );

          ModuleLoader.logger.log(
            `Found module: ${metadata.name} (${modulePath})`,
          );

          const providers = [
            {
              provide: MODULE_PACKAGE_NAME,
              useValue: moduleName,
            },
            {
              provide: MODULE_PACKAGE_VERSION,
              useValue: moduleVersion,
            },
          ];
          const dynamicModule: DynamicModule = {
            providers: providers,
            exports: providers,
            module: nestModule,
          };
          resolvedModules.push(dynamicModule);
          ModuleLoader.loadedModuleInfo.push(metadata);
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }
          ModuleLoader.logger.error(
            `Failed to load module ${nodeModule}: ${error.message}`,
          );
        }
      }
    }

    return resolvedModules;
  }

  private static async loadModules(
    resolvedModules: DynamicModule[],
  ): Promise<DynamicModule> {
    ModuleLoader.logger.log(`Loading ${resolvedModules.length} modules`);

    return {
      imports: resolvedModules,
      module: ModuleLoader,
    } as DynamicModule;
  }
}

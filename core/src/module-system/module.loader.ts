import { DynamicModule, Logger, Module } from '@nestjs/common';
import * as resolvePackagePath from 'resolve-package-path';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VenatModuleMetadata } from './venat-module.metadata';
import { METADATA_KEY } from './venat-module.decorator';

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
    prefix: string = null,
  ): Promise<DynamicModule[]> {
    const nodeModules = await fs.readdir(rootPath);
    const resolvedModules = [];
    for (const nodeModule of nodeModules) {
      if (nodeModule.startsWith('@') && !prefix) {
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
          let module = await import(modulePath);
          let metadata: VenatModuleMetadata;
          for (const exp of Object.values(module)) {
            if (Reflect.hasMetadata(METADATA_KEY, exp)) {
              module = exp;
              metadata = Reflect.getMetadata(METADATA_KEY, exp);
              break;
            }
          }

          if (!metadata) {
            throw new Error(
              `Module ${module} does not have @VenatModule decorator`,
            );
          }

          ModuleLoader.logger.log(
            `Found module: ${metadata.name} (${modulePath})`,
          );
          resolvedModules.push(module);
          ModuleLoader.loadedModuleInfo.push(metadata);
        } catch (e) {
          ModuleLoader.logger.error(
            `Failed to load module ${nodeModule}: ${e.message}`,
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

import { DynamicModule, Logger, Module, Type } from '@nestjs/common';
import * as resolvePackagePath from 'resolve-package-path';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VenatPluginMetadata } from './venat-plugin.metadata';
import { METADATA_KEY } from './venat-plugin.decorator';
import { PackageManifest } from './package-manifest.type';
import {
  PLUGIN_MANIFEST,
  PLUGIN_PACKAGE_NAME,
  PLUGIN_PACKAGE_VERSION,
} from './plugin.constants';

@Module({})
export class PluginLoader {
  private static readonly logger: Logger = new Logger('PluginLoader');
  private static loadedPluginInfo: VenatPluginMetadata[] = [];

  public static get loadedPlugins(): VenatPluginMetadata[] {
    return PluginLoader.loadedPluginInfo;
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

    let pluginsPath;

    do {
      pluginsPath = path.join(checkPath, 'node_modules');
      try {
        await fs.stat(pluginsPath);
        foundNodeModules = true;
      } catch (e) {
        checkPath = path.dirname(checkPath);
      }
    } while (!foundNodeModules);

    this.logger.log(`Found plugins path: ${pluginsPath}`);

    const resolved = await PluginLoader.resolvePlugins(pluginsPath);
    return PluginLoader.loadPlugins(resolved);
  }

  private static async resolvePlugins(
    rootPath: string,
    prefix?: string,
  ): Promise<DynamicModule[]> {
    const nodeModules = await fs.readdir(rootPath);
    const resolvedPlugins: DynamicModule[] = [];
    for (const nodeModule of nodeModules) {
      if (nodeModule.startsWith('@') && prefix == null) {
        resolvedPlugins.push(
          ...(await this.resolvePlugins(
            path.join(rootPath, nodeModule),
            nodeModule + '/',
          )),
        );

        continue;
      }

      if (nodeModule.startsWith('venat-plugin-')) {
        try {
          const modulePath = (prefix ?? '') + nodeModule;
          const module: { [key: string]: object } = await import(modulePath);
          const {
            name: pluginName,
            version: pluginVer,
            venat: pluginMeta,
          }: PackageManifest = await import(modulePath + '/package.json');

          if (!pluginMeta || !pluginMeta.name) {
            PluginLoader.logger.warn(
              `Found plugin-like package named ${name} in plugins directory but "venat" metadata is not present/is invalid in package.json, skipping`,
            );
            continue;
          }

          const nestModule = Object.values(module).find(
            (item): item is Type<unknown> =>
              Reflect.hasMetadata(METADATA_KEY, item),
          );

          if (nestModule == null) {
            throw new Error(
              `Plugin ${module} does not have @VenatPlugin decorator`,
            );
          }

          PluginLoader.logger.log(
            `Found plugin: ${pluginMeta.name} (${modulePath})`,
          );

          // define metadata with the plugin name and version
          // this is used to hop from INQUIRER to the module
          Reflect.defineMetadata(PLUGIN_PACKAGE_NAME, pluginName, nestModule);
          Reflect.defineMetadata(PLUGIN_PACKAGE_VERSION, pluginVer, nestModule);
          Reflect.defineMetadata(PLUGIN_MANIFEST, pluginMeta, nestModule);

          // define those as providers too, for ease of access within the plugin
          const dynamicModule: DynamicModule = {
            providers: [
              {
                provide: PLUGIN_PACKAGE_NAME,
                useValue: pluginName,
              },
              {
                provide: PLUGIN_PACKAGE_VERSION,
                useValue: pluginVer,
              },
              {
                provide: PLUGIN_MANIFEST,
                useValue: pluginMeta,
              },
            ],
            module: nestModule,
          };

          // plugin is resolved and metadata added, move on
          resolvedPlugins.push(dynamicModule);
          PluginLoader.loadedPluginInfo.push(pluginMeta);
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }
          PluginLoader.logger.error(
            `Failed to load plugin ${nodeModule}: ${error.message}`,
          );
        }
      }
    }

    return resolvedPlugins;
  }

  private static async loadPlugins(
    resolvedModules: DynamicModule[],
  ): Promise<DynamicModule> {
    PluginLoader.logger.log(`Loading ${resolvedModules.length} plugins`);

    return {
      imports: resolvedModules,
      module: PluginLoader,
    } as DynamicModule;
  }
}

import { VenatPluginMetadata } from './venat-plugin.metadata';

export interface PackageManifest {
  name: string;
  description?: string;
  version?: string;
  venat?: VenatPluginMetadata;
}

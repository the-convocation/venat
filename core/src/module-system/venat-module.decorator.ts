import { VenatModuleMetadata } from './venat-module.metadata';

export const METADATA_KEY = 'venatModule';

export default function VenatModule(
  metadata: VenatModuleMetadata,
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEY, metadata, target);
  };
}

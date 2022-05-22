export const METADATA_KEY = 'venat_plugin';

export function VenatPlugin(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEY, true, target);
  };
}

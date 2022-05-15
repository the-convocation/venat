export interface TextParameter {
  value: string;
}

/**
 * Cleans a text value for use in commands.
 * @param value - The value to transform.
 * @returns The cleaned text.
 */
export function cleanText({ value }: TextParameter): string {
  const duplicateWhitespace = /(\s\s+)*/gm;
  return value.normalize().replaceAll(duplicateWhitespace, '').trim();
}

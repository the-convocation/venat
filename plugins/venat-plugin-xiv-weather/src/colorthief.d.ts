declare module 'colorthief' {
  export function getColor(
    path: string,
    quality?: number,
  ): Promise<[number, number, number]>;
}

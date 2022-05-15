import { Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

interface TextParameter {
  value: string;
}

function cleanText({ value }: TextParameter): string {
  const duplicateWhitespace = /(\s\s+)*/gm;
  return value.normalize().replaceAll(duplicateWhitespace, '').trim();
}

export class MarketDto {
  @Transform(cleanText)
  @Param({
    description: 'The name of the item to look up prices for.',
    name: 'item',
    required: true,
  })
  public item: string;

  @Transform(cleanText)
  @Param({
    description: 'The server to look up prices on.',
    name: 'server',
    required: true,
  })
  public server: string;
}

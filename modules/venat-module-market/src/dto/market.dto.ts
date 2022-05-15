import { Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

interface TextParameter {
  value: string;
}

function cleanText({ value }: TextParameter) {
  const duplicateWhitespace = /(\s\s+)*/gm;
  return value.normalize().replaceAll(duplicateWhitespace, '').trim();
}

export class MarketDto {
  @Transform(cleanText)
  @Param({
    name: 'item',
    description: 'The name of the item to look up prices for.',
    required: true,
  })
  item: string;

  @Transform(cleanText)
  @Param({
    name: 'server',
    description: 'The server to look up prices on.',
    required: true,
  })
  server: string;
}

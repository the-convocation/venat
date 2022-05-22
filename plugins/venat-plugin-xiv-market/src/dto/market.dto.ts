import { Choice, Param, ParamType } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { cleanText } from '@the-convocation/venat-core';
import { Language } from '../data/listings';

const langMap = new Map<string, Language>([
  ['English', Language.English],
  ['日本語', Language.Japanese],
  ['Deutsch', Language.German],
  ['Français', Language.French],
]);

export class MarketDto {
  @Transform(cleanText)
  @Param({
    description: 'The name of the item to look up prices for.',
    name: 'item',
    required: true,
  })
  public item!: string;

  @Choice(langMap)
  @Param({
    description: 'The language of the item name to search for.',
    name: 'language',
    required: true,
    type: ParamType.INTEGER,
  })
  public lang!: Language;

  @Transform(cleanText)
  @Param({
    description: 'The server to look up prices on.',
    name: 'server',
    required: true,
  })
  public server!: string;
}

import { Choice, Param, ParamType } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { cleanText } from '@the-convocation/venat-core';
import { Language } from '../data/weather';

const langMap = new Map<string, Language>([
  ['English', Language.English],
  ['日本語', Language.Japanese],
  ['Deutsch', Language.German],
  ['Français', Language.French],
]);

export class WeatherDto {
  @Transform(cleanText)
  @Param({
    description: 'The name of the zone.',
    name: 'zone',
    required: true,
  })
  public zone!: string;

  @Choice(langMap)
  @Param({
    description: 'The language of the zone name.',
    name: 'language',
    required: true,
    type: ParamType.INTEGER,
  })
  public lang!: Language;
}

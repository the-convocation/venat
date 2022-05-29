import { LocalizedAsyncResource } from './resource';
import {
  getTerritoryTypeIndex,
  getWeatherIndex,
  getWeatherRateIndex,
  XIVAPILanguage,
  XIVAPITerritoryType,
  XIVAPIWeather,
  XIVAPIWeatherRate,
} from './xivapi';

const SECONDS = 1;
const MINUTES = 60 * SECONDS;
const WEATHER_PERIOD = 23 * MINUTES + 20 * SECONDS;

export enum Language {
  English,
  Japanese,
  French,
  German,
}

const xivapiLangMap = new Map<Language, XIVAPILanguage>([
  [Language.English, XIVAPILanguage.EN],
  [Language.Japanese, XIVAPILanguage.JA],
  [Language.German, XIVAPILanguage.DE],
  [Language.French, XIVAPILanguage.FR],
]);

function getXivapiLang(lang: Language): XIVAPILanguage {
  const xivapiLang = xivapiLangMap.get(lang);
  if (xivapiLang == null) {
    throw new Error('No XIVAPI language found for the provided language.');
  }

  return xivapiLang;
}

async function getWeathersLang(lang: Language) {
  const xivapiLang = getXivapiLang(lang);
  const index = await getWeatherIndex(xivapiLang);
  if (!index.success) {
    throw index.err;
  }

  return index.value.Results;
}

async function getWeatherRatesLang(lang: Language) {
  const xivapiLang = getXivapiLang(lang);
  const index = await getWeatherRateIndex(xivapiLang);
  if (!index.success) {
    throw index.err;
  }

  return index.value.Results;
}

async function getTerritoriesLang(lang: Language) {
  const xivapiLang = getXivapiLang(lang);
  const index = await getTerritoryTypeIndex(xivapiLang);
  if (!index.success) {
    throw index.err;
  }

  return index.value.Results;
}

export type Forecast = {
  zone: string;
  forecast: {
    time: Date;
    weather: {
      id: number;
      icon: string;
      name: string;
    };
  }[];
};

export class Forecaster {
  private weathersCache: LocalizedAsyncResource<Language, XIVAPIWeather[]>;
  private weatherRatesCache: LocalizedAsyncResource<
    Language,
    XIVAPIWeatherRate[]
  >;
  private territoriesCache: LocalizedAsyncResource<
    Language,
    XIVAPITerritoryType[]
  >;

  constructor() {
    this.weathersCache = new LocalizedAsyncResource<Language, XIVAPIWeather[]>(
      getWeathersLang,
    );
    this.weatherRatesCache = new LocalizedAsyncResource<
      Language,
      XIVAPIWeatherRate[]
    >(getWeatherRatesLang);
    this.territoriesCache = new LocalizedAsyncResource<
      Language,
      XIVAPITerritoryType[]
    >(getTerritoriesLang);
  }

  /**
   * Calculates the weather forecast for a zone.
   * @param zoneName The name of the zone to check.
   * @param lang The language of the zone name.
   * @param count The number of forecast entries to return.
   * @param sampleIncrement The sampling interval to use for jumping between times.
   * @param initialOffset The offset, in seconds, from the present moment to calculate based on.
   * @returns The forecast.
   */
  public async getForecast(
    zoneName: string,
    lang: Language,
    count = 1,
    sampleIncrement = WEATHER_PERIOD,
    initialOffset = 0,
  ): Promise<Forecast> {
    const territory = await this.getTerritoryByName(zoneName, lang);
    if (territory == null) {
      throw new Error(`Zone ${zoneName} could not be found.`);
    }

    if (territory.WeatherRate == null) {
      throw new Error(`Zone ${zoneName} does not have known weathers.`);
    }

    const weatherRate = await this.getWeatherRate(territory.WeatherRate, lang);
    if (weatherRate == null) {
      throw new Error(`Weather rates for zone ${zoneName} could not be found.`);
    }

    const startTime = this.getCurrentWeatherStartTime(initialOffset);

    const forecast = [];
    for (let i = 0; i < count; i++) {
      const time = new Date(startTime.valueOf() + sampleIncrement * i * 1000);

      const target = this.calculateTarget(time);
      if (target < 0 || target > 99) {
        throw new Error(
          `Weather target calculation returned ${target} (time=${time.valueOf()}); outside of the range [0, 100).`,
        );
      }

      const weatherId = this.getWeatherIdForRateTarget(weatherRate, target);
      if (weatherId == null) {
        throw new Error(
          `Weather for rate index ${weatherRate.ID} (territoryId=${territory.ID}) could not be found.`,
        );
      }

      const weather = await this.getWeather(weatherId, lang);
      if (weather == null) {
        throw new Error(`Weather ${weatherId} could not be found.`);
      }

      if (weather.Name == null) {
        throw new Error(`Weather ${weatherId} has no name.`);
      }

      forecast.push({
        time,
        weather: {
          id: weather.ID,
          icon: `https://xivapi.com${weather.Icon}`,
          name: weather.Name,
        },
      });
    }

    return {
      zone: territory.PlaceName?.Name ?? '',
      forecast,
    };
  }

  /**
   * Calculates the current weather's start time.
   * @param initialOffset The offset, in seconds, from the present moment to calculate based on.
   * @returns The start time of the current weather.
   */
  private getCurrentWeatherStartTime(initialOffset = 0): Date {
    const now = new Date();
    now.setUTCMilliseconds(0);
    now.setUTCSeconds(now.getUTCSeconds() + initialOffset);

    // Remove the extra seconds after the weather period began
    const extraSeconds = Math.trunc(now.valueOf() / 1000) % WEATHER_PERIOD;
    now.setUTCSeconds(now.getUTCSeconds() - extraSeconds);

    return now;
  }

  /**
   * Calculates the weather rate target for the provided time.
   * @param time The time to calculate the target value for.
   * @returns The time's weather rate target, which can be in the range [0, 100).
   */
  private calculateTarget(time: Date): number {
    const unix = Math.trunc(time.valueOf() / 1000);
    const bell = Math.trunc(unix / 175);
    const increment = (bell + 8 - (bell % 8)) % 24;

    const totalDays = Math.trunc(unix / 4200);

    const calcBase = totalDays * 0x64 + increment;

    const step1 = (calcBase << 0xb) ^ calcBase;
    const step2 = ((step1 >>> 8) ^ step1) >>> 0;

    return step2 % 0x64;
  }

  /**
   * Returns the weather ID for the provide weather rate and rate target.
   * @param weatherRate The weather rate data to reference.
   * @param target The weather rate target.
   * @returns The ID of the weather corresponding to the rate target.
   */
  private getWeatherIdForRateTarget(
    weatherRate: XIVAPIWeatherRate,
    target: number,
  ): number | null {
    if (target < 0 || target > 99) {
      throw new Error('Weather rate target is outside of the range [0, 100).');
    }

    let cumulativeRate = 0;
    for (let i = 0; i < weatherRate.Rates.length; i++) {
      cumulativeRate += weatherRate.Rates[i];
      if (target < cumulativeRate) {
        return weatherRate.Weathers[i].ID;
      }
    }

    throw new Error('Weather rates are poorly-formed or invalid!');
  }

  private async getWeather(
    id: number,
    lang: Language,
  ): Promise<XIVAPIWeather | undefined> {
    const weathers = await this.weathersCache.get(lang);
    const weather = weathers.find((w) => w.ID === id);
    return weather;
  }

  private async getWeatherRate(
    id: number,
    lang: Language,
  ): Promise<XIVAPIWeatherRate | undefined> {
    const weatherRates = await this.weatherRatesCache.get(lang);
    const weatherRate = weatherRates.find((wr) => wr.ID === id);
    return weatherRate;
  }

  private async getTerritoryByName(
    name: string,
    lang: Language,
  ): Promise<XIVAPITerritoryType | undefined> {
    const nameLower = name.toLowerCase();

    const territories = await this.territoriesCache.get(lang);
    const territory = territories.find(
      (t) => t.PlaceName?.Name?.toLowerCase() === nameLower,
    );
    return territory;
  }
}

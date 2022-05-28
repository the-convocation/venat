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
  time: Date;
  weather: {
    icon: string;
    name: string;
  };
}[];

export class Forecaster {
  private weathersCache: LocalizedAsyncResource<XIVAPIWeather[]>;
  private weatherRatesCache: LocalizedAsyncResource<XIVAPIWeatherRate[]>;
  private territoriesCache: LocalizedAsyncResource<XIVAPITerritoryType[]>;

  constructor() {
    this.weathersCache = new LocalizedAsyncResource<XIVAPIWeather[]>(
      getWeathersLang,
    );
    this.weatherRatesCache = new LocalizedAsyncResource<XIVAPIWeatherRate[]>(
      getWeatherRatesLang,
    );
    this.territoriesCache = new LocalizedAsyncResource<XIVAPITerritoryType[]>(
      getTerritoriesLang,
    );
  }

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
      const time = new Date(startTime.valueOf() + sampleIncrement * 1000);

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
        time: startTime,
        weather: {
          icon: weather.Icon,
          name: weather.Name,
        },
      });
    }

    return forecast;
  }

  private getCurrentWeatherStartTime(initialOffset: number): Date {
    const now = new Date();
    now.setUTCMilliseconds(0);
    now.setUTCSeconds(now.getUTCSeconds() + initialOffset);

    // Remove the extra seconds after the weather period began
    const extraSeconds = Math.trunc(now.valueOf() / 1000) % WEATHER_PERIOD;
    now.setUTCSeconds(now.getUTCSeconds() - extraSeconds);

    return now;
  }

  private calculateTarget(time: Date): number {
    const unix = Math.trunc(time.valueOf() / 1000);
    const bell = Math.trunc(unix / 175);
    const increment = (bell + 8 - (bell % 8)) % 24;

    const totalDays = Math.trunc(unix / 4200);

    const calcBase = totalDays * 0x64 + increment;

    const step1 = (calcBase << 0xb) ^ calcBase;
    const step2 = (step1 >> 8) ^ step1;

    return step2 % 0x64;
  }

  private getWeatherIdForRateTarget(
    weatherRate: XIVAPIWeatherRate,
    target: number,
  ): number | null {
    let cumulativeRate = 0;
    for (let i = 0; i < weatherRate.Rates.length; i++) {
      cumulativeRate += weatherRate.Rates[i];
      if (target < cumulativeRate) {
        return weatherRate.Weathers[i].ID;
      }
    }

    return null;
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

class LocalizedAsyncResource<T> {
  private resourceLangs: Map<Language, CachedAsyncResource<T>>;
  private getFn: (lang: Language) => Promise<T>;

  constructor(getFn: (lang: Language) => Promise<T>) {
    this.resourceLangs = new Map<Language, CachedAsyncResource<T>>();
    this.getFn = getFn;
  }

  public async get(lang: Language): Promise<T> {
    if (!this.resourceLangs.has(lang)) {
      this.resourceLangs.set(
        lang,
        new CachedAsyncResource<T>(() => this.getFn(lang)),
      );
    }

    const resourceLang = this.resourceLangs.get(lang);
    if (resourceLang == null) {
      throw new Error('Resource language was null.');
    }

    return await resourceLang?.get();
  }
}

class CachedAsyncResource<T> {
  data?: T;
  getFn: () => Promise<T>;

  constructor(getFn: () => Promise<T>) {
    this.getFn = getFn;
  }

  public async get(): Promise<T> {
    if (this.data == null) {
      this.data = await this.getFn();
    }

    return this.data;
  }
}

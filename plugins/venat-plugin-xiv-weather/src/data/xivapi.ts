import axios, { AxiosResponse } from 'axios';
import { LookupResult } from '@the-convocation/venat-core';

export enum XIVAPILanguage {
  EN = 'en',
  JA = 'ja',
  DE = 'de',
  FR = 'fr',
}

export interface XIVAPIWeather {
  ID: number;
  Icon: string;
  Name?: string;
}

export interface XIVAPIWeatherRateLinkedWeather {
  ID: number;
}

export interface XIVAPIWeatherRateRaw {
  ID: number;
  Rate0: number;
  Rate1: number;
  Rate2: number;
  Rate3: number;
  Rate4: number;
  Rate5: number;
  Rate6: number;
  Weather0?: XIVAPIWeatherRateLinkedWeather;
  Weather1?: XIVAPIWeatherRateLinkedWeather;
  Weather2?: XIVAPIWeatherRateLinkedWeather;
  Weather3?: XIVAPIWeatherRateLinkedWeather;
  Weather4?: XIVAPIWeatherRateLinkedWeather;
  Weather5?: XIVAPIWeatherRateLinkedWeather;
  Weather6?: XIVAPIWeatherRateLinkedWeather;
}

export interface XIVAPIWeatherRate {
  ID: number;
  Rates: number[];
  Weathers: XIVAPIWeatherRateLinkedWeather[];
}

export interface XIVAPITerritoryType {
  ID: number;
  PlaceName?: {
    Name?: string;
  };
  WeatherRate?: number;
}

export type Results<T> = {
  Results: T[];
};

export async function getWeatherIndex(
  lang: XIVAPILanguage,
): Promise<LookupResult<Results<XIVAPIWeather>>> {
  return get<XIVAPIWeather>(
    `https://xivapi.com/Weather?columns=ID,Icon,Name&language=${lang}`,
  );
}

export async function getWeatherRateIndex(
  lang: XIVAPILanguage,
): Promise<LookupResult<Results<XIVAPIWeatherRate>>> {
  const weatherRatesRaw = await get<XIVAPIWeatherRateRaw>(
    `https://xivapi.com/WeatherRate?columns=ID,Rate0,Rate1,Rate2,Rate3,Rate4,Rate5,Rate6,Weather0.ID,Weather1.ID,Weather2.ID,Weather3.ID,Weather4.ID,Weather5.ID,Weather6.ID&language=${lang}`,
  );

  if (!weatherRatesRaw.success) {
    return { success: false, err: weatherRatesRaw.err };
  }

  const results = weatherRatesRaw.value.Results.map((r) => {
    const rate: XIVAPIWeatherRate = {
      ID: r.ID,
      Rates: [],
      Weathers: [],
    };

    // The weathers at the end of the array may be null; push data until we find one.
    const rates = [
      r.Rate0,
      r.Rate1,
      r.Rate2,
      r.Rate3,
      r.Rate4,
      r.Rate5,
      r.Rate6,
    ];
    const weathers = [
      r.Weather0,
      r.Weather1,
      r.Weather2,
      r.Weather3,
      r.Weather4,
      r.Weather5,
      r.Weather6,
    ];

    for (let i = 0; i < rates.length; i++) {
      const weather = weathers[i];
      if (weather != null) {
        rate.Rates.push(rates[i]);
        rate.Weathers.push(weather);
      } else {
        break;
      }
    }

    return rate;
  });

  return {
    success: true,
    value: {
      Results: results,
    },
  };
}

export async function getTerritoryTypeIndex(
  lang: XIVAPILanguage,
): Promise<LookupResult<Results<XIVAPITerritoryType>>> {
  return get<XIVAPITerritoryType>(
    `https://xivapi.com/TerritoryType?columns=ID,WeatherRate,PlaceName.Name&language=${lang}`,
  );
}

type PageNumber = number | null;

type Paginated = {
  Pagination: {
    PageNext: PageNumber;
  };
};

async function get<T>(url: string): Promise<LookupResult<Results<T>>> {
  let nextPage: PageNumber = 1;
  const results = [];
  do {
    let res: AxiosResponse<Results<T> & Paginated, any>;
    try {
      res = await axios.get<Results<T> & Paginated>(url + `&page=${nextPage}`);
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }
      return { success: false, err };
    }

    nextPage = res.data.Pagination.PageNext;
    results.push(...res.data.Results);
  } while (nextPage != null);

  return { value: { Results: results }, success: true };
}

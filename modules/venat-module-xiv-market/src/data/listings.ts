import { LookupResult } from '@the-convocation/venat-core';
import { UniversalisMarketInfo } from './universalis';
import { XIVAPIItem, XIVAPILanguage } from './xivapi';

export interface ItemMarketListing {
  pricePerUnit: number;
  quantity: number;
  total: number;
  hq: boolean;
  worldName?: string;
}

export interface ItemMarketInfo {
  itemId: number;
  itemName: string;
  worldName?: string;
  dcName?: string;
  lastUploadTime: number;
  listings: ItemMarketListing[];
}

export type GetItemInfoByName = (
  itemName: string,
  lang: XIVAPILanguage,
) => Promise<LookupResult<XIVAPIItem>>;

export type GetItemMarketInfo = (
  itemId: number,
  server: string,
) => Promise<LookupResult<UniversalisMarketInfo>>;

export type LogError = (message?: string, stack?: string) => void;

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

function langToXivapi(lang: Language): XIVAPILanguage {
  const xivapiLang = xivapiLangMap.get(lang);
  if (xivapiLang == null) {
    throw new Error(
      `The language code "${lang}" could not be converted into a Language.`,
    );
  }

  return xivapiLang;
}

/**
 * Gets an item's market info using its name and a game server. Requires provider functions for I/O.
 * @param getItemInfoByName An async function that returns an item's information by its name and language.
 * @param getMarketInfo An async function that returns an item's market info by its item ID and a game server.
 * @param logError An error-logging function.
 * @returns An async function that returns an item's market info by its name, its language, and a game server.
 * If something goes wrong, an error message is returned describing the problem.
 */
export function getMarketInfoByName(
  getItemInfoByName: GetItemInfoByName,
  getMarketInfo: GetItemMarketInfo,
  logError: LogError,
): (
  itemName: string,
  server: string,
  lang: Language,
) => Promise<ItemMarketInfo | string> {
  return async (
    itemName: string,
    server: string,
    lang: Language,
  ): Promise<ItemMarketInfo | string> => {
    let xivapiLang: XIVAPILanguage;
    try {
      xivapiLang = langToXivapi(lang);
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      logError(err.message, err.stack);
      xivapiLang = XIVAPILanguage.EN;
    }

    const itemLookup = await getItemInfoByName(itemName, xivapiLang);
    if (!itemLookup.success) {
      logError(itemLookup.err.message, itemLookup.err.stack);
      return 'The item could not be found; please check your item name spelling and try again.';
    }

    const item = itemLookup.value;
    if (item.ItemSearchCategory.ID == null || item.ItemSearchCategory.ID == 0) {
      return 'The requested item is not marketable.';
    }

    const marketLookup = await getMarketInfo(item.ID, server);
    if (!marketLookup.success) {
      logError(marketLookup.err.message, marketLookup.err.stack);
      return 'The item could not be found on the market; please check your server spelling and try again.';
    }

    return {
      ...marketLookup.value,
      itemId: itemLookup.value.ID,
      itemName: itemLookup.value.Name,
    };
  };
}

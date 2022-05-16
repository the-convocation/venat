import { LookupResult } from '@the-convocation/venat-core';
import { UniversalisMarketInfo } from './universalis';
import { XIVAPIItem } from './xivapi';

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

type GetItemInfoByName = (
  itemName: string,
) => Promise<LookupResult<XIVAPIItem>>;

type GetItemMarketInfo = (
  itemId: number,
  server: string,
) => Promise<LookupResult<UniversalisMarketInfo>>;

type LogError = (message?: string, stack?: string) => void;

/**
 * Gets an item's market info using its name and a game server. Requires provider functions for I/O.
 * @param getItemInfoByName An async function that returns an item's information by its name.
 * @param getMarketInfo An async function that returns an item's market info by its item ID and a game server.
 * @param logError An error-logging function.
 * @returns An async function that returns an item's market info by its name and a game server. If something goes
 * wrong, an error message is returned describing the problem.
 */
export function getMarketInfoByName(
  getItemInfoByName: GetItemInfoByName,
  getMarketInfo: GetItemMarketInfo,
  logError: LogError,
): (itemName: string, server: string) => Promise<ItemMarketInfo | string> {
  return async (
    itemName: string,
    server: string,
  ): Promise<ItemMarketInfo | string> => {
    const itemLookup = await getItemInfoByName(itemName);
    if (!itemLookup.success) {
      logError(itemLookup.err.message, itemLookup.err.stack);
      return 'The item could not be found; please check your item name spelling and try again.';
    }

    const item = itemLookup.value;
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

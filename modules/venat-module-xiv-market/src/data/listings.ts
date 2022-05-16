import { LookupResult } from '@the-convocation/venat-core';
import { table } from 'table';
import { UniversalisMarketInfo } from './universalis';
import { XIVAPIItem } from './xivapi';

export interface MarketListing {
  pricePerUnit: number;
  quantity: number;
  total: number;
  hq: boolean;
  worldName?: string;
}

export interface MarketInfo {
  itemId: number;
  itemName: string;
  worldName?: string;
  dcName?: string;
  lastUploadTime: number;
  listings: MarketListing[];
}

export function buildTextTable(
  listings: MarketListing[],
  worldName?: string,
): string {
  return table([
    ['HQ', 'Unit Price', 'Quantity', 'Total', 'World'],
    ...listings
      .sort((a, b) => a.pricePerUnit - b.pricePerUnit)
      .slice(0, 10)
      .map((l) => [
        l.hq ? 'Yes' : 'No',
        l.pricePerUnit.toLocaleString('en'),
        l.quantity.toLocaleString('en'),
        l.total.toLocaleString('en'),
        worldName ?? l.worldName,
      ]),
  ]);
}

export function getMarketInfoByName(
  getItemIdByName: (itemName: string) => Promise<LookupResult<XIVAPIItem>>,
  getMarketInfo: (
    itemId: number,
    server: string,
  ) => Promise<LookupResult<UniversalisMarketInfo>>,
  logError: (message?: string, stack?: string) => void,
): (itemName: string, server: string) => Promise<MarketInfo | string> {
  return async (
    itemName: string,
    server: string,
  ): Promise<MarketInfo | string> => {
    const itemLookup = await getItemIdByName(itemName);
    if (itemLookup.err != null) {
      logError(itemLookup.err.message, itemLookup.err.stack);
      return 'Failed to access XIVAPI; please try again later.';
    }

    if (!itemLookup.success) {
      return 'The item could not be found; please check your spelling and try again.';
    }

    const item = itemLookup.value;
    const marketLookup = await getMarketInfo(item.ID, server);
    if (marketLookup.err != null) {
      logError(marketLookup.err.message, marketLookup.err.stack);
      return 'The item could not be found; please check your spelling of the server and try again.';
    }

    if (!marketLookup.success) {
      return 'The item could not be found; please check your spelling and try again.';
    }

    return {
      ...marketLookup.value,
      itemId: itemLookup.value.ID,
      itemName: itemLookup.value.Name,
    };
  };
}

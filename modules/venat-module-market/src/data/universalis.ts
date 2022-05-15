import axios, { AxiosResponse } from 'axios';
import { LookupResult } from './result';

export interface UniversalisMarketInfo {
  lastUploadTime: number;
  listings: {
    pricePerUnit: number;
    quantity: number;
    total: number;
    hq: boolean;
    worldName?: string;
  }[];

  worldName?: string;
  dcName?: string;
}

export async function getMarketListings(
  itemId: number,
  server: string,
): Promise<LookupResult<UniversalisMarketInfo>> {
  let res: AxiosResponse<UniversalisMarketInfo, any>;
  try {
    res = await axios.get<UniversalisMarketInfo>(
      `https://universalis.app/api/${server}/${itemId}`,
    );
  } catch (err) {
    return { value: null, success: false, err };
  }

  return { value: res.data, success: true };
}

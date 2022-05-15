import axios, { AxiosResponse } from 'axios';
import { LookupResult } from './result';

export interface XIVAPIItem {
  ID: number;
  Name: string;
}

export interface XIVAPISearchResponse {
  Results: XIVAPIItem[];
}

export async function getItemIdByName(
  name: string,
): Promise<LookupResult<XIVAPIItem>> {
  let res: AxiosResponse<XIVAPISearchResponse, any>;
  try {
    res = await axios.get<XIVAPISearchResponse>(
      `https://xivapi.com/search?string=${name}&filters=ItemSearchCategory.ID>8&columns=ID,Name`,
    );
  } catch (err) {
    return { value: null, success: false, err };
  }

  const nameLower = name.toLowerCase();
  for (const item of res.data.Results) {
    if (nameLower === item.Name.toLowerCase()) {
      return { value: item, success: true };
    }
  }

  return { value: null, success: false };
}

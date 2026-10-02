import { MOCK_HISTORIES, MOCK_SITES } from './mockData';
import type { ParameterKey, Site } from '../types';

const USE_MOCK_DATA = true; // TODO: set to false once ThingSpeak API key is received.

// TODO: Fill these in when the hardware team provides the channel details.
const THINGSPEAK_CHANNEL_ID = '';
const THINGSPEAK_READ_API_KEY = '';

export async function getSites(): Promise<Site[]> {
  if (USE_MOCK_DATA) {
    return MOCK_SITES.map((site) => ({ ...site, latest: { ...site.latest } }));
  }

  throw new Error('ThingSpeak is not configured yet. Set channel credentials in dataSource.ts.');
}

export async function getSiteHistory(siteId: string, param: string): Promise<number[]> {
  if (USE_MOCK_DATA) {
    const siteHistory = MOCK_HISTORIES[siteId];
    const values = siteHistory?.[param as ParameterKey];

    if (!values) {
      throw new Error(`No readings found for ${siteId}/${param}.`);
    }

    return [...values];
  }

  throw new Error('ThingSpeak is not configured yet. Set channel credentials in dataSource.ts.');
}

/*
 * REAL THINGSPEAK IMPLEMENTATION — ready when credentials arrive:
 *
 * const FIELD_BY_PARAMETER: Record<string, string> = {
 *   ph: 'field1', tds: 'field2', turb: 'field3', doo: 'field4', temp: 'field5',
 * };
 *
 * async function fetchThingSpeakFeeds() {
 *   const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}` +
 *     `/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=24`;
 *   const response = await fetch(url);
 *   if (!response.ok) throw new Error(`ThingSpeak request failed: ${response.status}`);
 *   return response.json() as Promise<{ feeds: Record<string, string | null>[] }>;
 * }
 *
 * Replace the two non-mock branches above with calls to fetchThingSpeakFeeds().
 * Screens and components do not need any changes.
 */

// Keep these references intentional until the real branch is enabled.
void THINGSPEAK_CHANNEL_ID;
void THINGSPEAK_READ_API_KEY;

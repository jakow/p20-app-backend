import axios from 'axios';
import { omit } from 'lodash';
import { parseDates, toCamelCaseObject } from './objects';

import * as queryString from 'querystring';
import { OrderObject } from '../db/model/Order';
import { TicketObject } from '../db/model/Ticket';

export function toOrderObject(o: any): OrderObject {
  const camelCased = toCamelCaseObject(o);
  parseDates(camelCased);
  return camelCased;
}

export function toTicketObject(o: any): TicketObject {
  const camelCased = toCamelCaseObject(o);
  parseDates(camelCased);
  return omit(camelCased, 'order') as TicketObject; // replacing order with a Order document referene
}

interface ResourceMap {
  orders: OrderObject;
  tickets: TicketObject;
}

const mapper = {
  orders: toOrderObject,
  tickets: toTicketObject,
};

interface TicketbaseConfig {
  apiKey: string;
  eventId: string;
}

export async function* getAll<T extends keyof ResourceMap>(
  resource: T,
  tbConfig: TicketbaseConfig): AsyncIterableIterator<ResourceMap[T]> {
  const query = {
    api_key: tbConfig.apiKey,
    page: 1, // pages start at 1 in the API
    per_page: 100,
  };

  for (;;) {
    const qs = queryString.stringify(query);
    const url = `https://api.ticketbase.com/v1/events/${tbConfig.eventId}/${resource}.json?${qs}`;
    const { data } = await axios.get(url);
    if (!Array.isArray(data)) {
      throw new TypeError('Invalid response received');
    }
    const orders = data.map(mapper[resource] as (o: any) => ResourceMap[T]);
    yield* orders;
    if (orders.length < query.per_page) {
      return;
    }
    query.page++;
  }
}

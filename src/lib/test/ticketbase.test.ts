
import { expect } from 'chai';

import axios from 'axios';
import MockAdapter = require('axios-mock-adapter');
import { OK } from 'http-status-codes';

import { getAll } from '../ticketbase';
import { expectedOrders, expectedTickets, ordersResponse, ticketsResponse } from './ticketbase.fixture';

describe('ticketbase helpers', () => {
  beforeEach(() => {
    const mock = new MockAdapter(axios);
    mock.onGet(/^https:\/\/api\.ticketbase\.com\/v1\/events\/\d+\/orders.json/)
      .reply(OK, ordersResponse);
    mock.onGet(/^https:\/\/api\.ticketbase\.com\/v1\/events\/\d+\/tickets.json/)
      .reply(OK, ticketsResponse);

  });

  describe('getAll()', () => {
    const tbConfig = {
      apiKey: 's3cr3t',
      eventId: '42',
    };

    it('gets all requested resource data [orders]', async () => {
      const orders = [];
      for await (const order of getAll('orders', tbConfig)) {
        orders.push(order);
      }

      expect(orders).to.deep.equal(expectedOrders);
    });

    it('gets all requested resource data [tickets]', async () => {
      const tickets = [];
      for await (const order of getAll('tickets', tbConfig)) {
        tickets.push(order);
      }

      expect(tickets).to.deep.equal(expectedTickets);
    });
  });
});

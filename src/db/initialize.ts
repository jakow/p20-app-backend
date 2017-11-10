import * as mongoose from 'mongoose';
import { TICKETBASE_API_KEY, TICKETBASE_EVENT_ID } from '../config';
import { getAll } from '../lib/ticketbase';
import Order, { OrderObject } from './model/Order';
import Ticket, { TicketObject } from './model/Ticket';
import { testOrders, testTickets } from './tbTestData';

const MS_PER_MINUTE = 60000;
const SYNC_INTERVAL = MS_PER_MINUTE * 10;

(mongoose as any).Promise = Promise;

export async function initializeDb() {
  await new Promise<mongoose.Connection>((res, rej) => {
    mongoose.connect('mongodb://localhost/p20-app-backend', {
      useMongoClient: true,
    }).then(() => res(mongoose.connection));
  });

  periodicSync();

  async function periodicSync() {
    await syncWithTicketbase();
    setTimeout(periodicSync, SYNC_INTERVAL);
  }
}

async function syncWithTicketbase() {
  let tickets: TicketObject[] = [];
  let orders: OrderObject[] = [];
  try {
    const data = await getTicketbaseData();
    tickets = data.tickets;
    orders = data.orders;
  } catch {
    console.error('[Ticketbase] Sync failed because data could not be fetched. Falling back to local data.');
    return;
  }

  // clear current data if exists
  console.info('[Tickebase] Dropping current records');
  await Ticket.remove({});
  await Order.remove({});

  await Order.create(orders);
  // Ticket creation automatically assigns orders to Tickets in save hook
  await Ticket.create(tickets);
  // ...aaaaand we're done
  console.info('[Ticketbase] Sync complete.');
}

export async function getTicketbaseData() {
  const tbConfig = {
    apiKey: TICKETBASE_API_KEY,
    eventId: TICKETBASE_EVENT_ID,
  };

  const orders: OrderObject[] = [];
  const tickets: TicketObject[] = [];
  for await (const ticket of getAll('tickets', tbConfig)) {
    tickets.push(ticket);
  }
  console.info(`[Ticketbase] ${tickets.length} tickets found.`);

  for await (const order of getAll('orders', tbConfig)) {
    orders.push(order);
  }
  console.info(`[Ticketbase] ${orders.length} orders found.`);

  // initialize test data
  orders.push(...testOrders);
  tickets.push(...testTickets);

  return {
    orders,
    tickets,
  };
}

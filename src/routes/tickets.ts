import axios from 'axios';
import { NOT_FOUND, OK } from 'http-status-codes';
import { Context } from 'koa';
import { TICKETBASE_API_KEY, TICKETBASE_EVENT_ID } from '../config';
import Ticket from '../db/model/Ticket';

interface TicketQuery {
  identifier?: string;
  email?: string;
}

export function findTicket(request: TicketQuery) {
  const { identifier, email } = request;
  if (identifier == null || email == null) {
    return;
  }
  return Ticket.findOne({ identifier, email }).exec();

}

export async function handleValidateTicket(ctx: Context) {
  const ticket = await findTicket(ctx.request.body);
  if (ticket == null) {
    ctx.status = NOT_FOUND;
  } else {
    ctx.body = ticket.toJSON();
  }
}

export async function getAvailableTickets() {
  const url = `https://api.ticketbase.com/v1/events/${TICKETBASE_EVENT_ID}/tickets.json?` +
    `api_key=${TICKETBASE_API_KEY}`;
  const response = await axios.get(url);
  const tickets = response.status === OK ? response.data : [];
  return tickets;
}

export async function handleGetTicketAvailability(ctx: Context) {
  const availableTickets = await getAvailableTickets();
  if (availableTickets.length > 0) {
    ctx.body = {
      available: true,
      url: `https://www.ticketbase.com/events/${TICKETBASE_EVENT_ID}`,
    };
  } else {
    ctx.body = {
      available: false,
    };
  }
}

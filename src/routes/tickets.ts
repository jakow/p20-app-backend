import { NOT_FOUND } from 'http-status-codes';
import { Context } from 'koa';
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

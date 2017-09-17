import { Schema } from 'mongoose';

export interface Ticket {
  id: string;
  orderId: string;
  price: number;
}

export const TicketSchema = new Schema({
  id: { type: String, required: true },
  orderId: { type: String, required: true },
  price: Number,
});

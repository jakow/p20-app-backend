import { Document, model, Schema } from 'mongoose';
import Order, { OrderDocument } from './Order';

export interface TicketObject {
  identifier: string;
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  checkedIn: boolean;
  void: boolean;
  ticketType: string;
  ticketTypeId: number;
  order: OrderDocument;
}

export type TicketDocument = TicketObject & Document;

export const TicketSchema = new Schema({
  identifier: { type: String, required: true, index: true },
  orderId: { type: String, required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  checkedIn: { type: Boolean, required: true },
  void: { type: Boolean, required: true },
  ticketType: { type: String, required: true },
  ticketTypeId: Number,
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
});

/**
 * Save reference to the order by its ticketbase id
 */
TicketSchema.pre('save', async function(this: TicketDocument, done: () => void) {
  if (!this.order) {
    const order = await Order.findOne({ reference: this.orderId }).exec();
    if (order) {
      this.order = order._id;
    }
  }
  done();
});

export default model<TicketDocument>('Ticket', TicketSchema);

import { Document, model, Schema } from 'mongoose';

export interface OrderObject {
  buyerName: string;
  buyerEmail: string;
  source: string;
  datePurchased: Date;
  status: string;
  reference: string;
  transactionStatus: string;
  transactionNumber: string | null;
  amount: string;
  discountedAmount: string;
  totalFees: string;
  currency: string;
  manualPaymentType: string;
  paypalPayKey: string | null;
}

export type OrderDocument = OrderObject & Document;

export const OrderSchema = new Schema({
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true, index: true },
  source: { type: String, required: true },
  datePurchased: Date,
  status: { type: String, required: true },
  reference: { type: String, required: true },
  transactionStatus: { type: String, required: true },
  transactionNumber: { type: String, required: true },
  amount: { type: String, required: true },
  discountedAmount: { type: String, required: true },
  totalFees: { type: String, required: true },
  currency: { type: String, required: true },
  manualPaymentType: String,
  paypalPayKey: String,
});

export default model<OrderDocument>('Order', OrderSchema);

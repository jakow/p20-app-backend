import { OrderObject } from './model/Order';
import { TicketObject } from './model/Ticket';

export const testTickets: TicketObject[] = [
  {
    firstName: 'Tony',
    lastName: 'Test',
    email: 'tony@test.com',
    identifier: '11122233344455566',
    checkedIn: false,
    orderId: 'aabbccdd',
    void: false,
    ticketType: 'Conference + Ball',
    ticketTypeId: 123123,
  },
];

export const testOrders: OrderObject[] = [
  {
    reference: 'aabbccdd',
    buyerName: 'Tony Test',
    amount: '70.0',
    buyerEmail: 'tony@test.com',
    currency: 'GBP',
    datePurchased: new Date(),
    source: 'sth',
    discountedAmount: '0.0',
    transactionStatus: 'paid',
    totalFees: '0.65',
    status: 'ok',
    transactionNumber: '123',
    manualPaymentType: '123',
    paypalPayKey: null,
  },
];

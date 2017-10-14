import { expect } from 'chai';

import { Schema } from 'mongoose';

import { TicketSchema } from '../Ticket';

describe('Ticket', () => {
  describe('schema', () => {
    it('is an instance of mongoose schema', () => {
      expect(TicketSchema).to.be.instanceOf(Schema);
    });
  });
});

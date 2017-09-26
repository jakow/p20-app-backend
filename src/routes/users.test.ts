// tslint:disable:no-unused-expression
import { expect } from 'chai';

// import { Context } from 'koa';
import { CREATED, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import * as mongoose from 'mongoose';

import { ValidationError } from './errors';
import { createUser, handleCreateUser } from './users';

describe('users route', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost/p20-backend-test-db', { useMongoClient: true });
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });
  describe('createUser()', () => {
    it('creates a new user when correct data is entered', () => {
      // this is the minimum data required:
      const newUser = {
        firstName: 'Johnny B.',
        lastName: 'Goode',
        email: 'johnny.b@goode.com',
      };

      expect(createUser(newUser)).to.be.fulfilled;
    });

    it('throws a ValidationError when missing data is entered', () => {
      const newUser = {
        firstName: 'Johnny B.',
        lastName: '',
        email: 'johnny.b@goode.com',
      };

      expect(createUser(newUser)).to.be.rejectedWith(ValidationError);
    });
  });

  describe('handleCreateUser()', () => {
    function createCtxFromBody(body: any): any {
      return { request: { body } };
    }
    it('results in a 201 Created if the request data is correct', async () => {
      const ctx = createCtxFromBody({
        firstName: 'Johnny B.',
        lastName: 'Goode',
        email: 'johnny.b@goode.com',
      });
      await handleCreateUser(ctx);
      expect(ctx.status).to.equal(CREATED);
    });

    it('results in a 422 Unprocessable entity if the request data is correct', async () => {
      const ctx = createCtxFromBody({
        firstName: 'Johnny B.',
        lastName: '',
        email: 'johnny.b@goode.com',
      });
      await handleCreateUser(ctx);
      expect(ctx.status).to.equal(UNPROCESSABLE_ENTITY);
    });
  });
});

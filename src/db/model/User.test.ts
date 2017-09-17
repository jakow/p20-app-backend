// tslint:disable:no-unused-expression
import { expect } from 'chai';

import * as mongoose from 'mongoose';

(mongoose as any).Promise = Promise;

import User, { UserSchema } from './User';

describe('User', () => {
  describe('schema', () => {
    it('is an instance of mongoose schema', () => {
      expect(UserSchema).to.be.instanceOf(mongoose.Schema);
    });
  });

  describe('model', () => {
    before(async () => {
      await mongoose.connect('mongodb://localhost/p20-backend-test-db', { useMongoClient: true });
    });

    after(async () => {
      await mongoose.connection.db.dropDatabase();
      await mongoose.connection.close();
    });

    it('has the correct name', () => {
      expect(User.modelName).to.equal('User');
    });

    it('creates a new instance', async () => {
      const user = new User({
        firstName: 'Johnny B.',
        lastName: 'Goode',
        email: 'johnny.b@goode.com',
      });
      await user.save();
      expect(user.firstName).to.equal('Johnny B.');
    });

    it('throws when a new instance has missing data', () => {
      const user = new User({
        firstName: 'Johnny B.',
        email: 'johnny.b@goode.com',
      });
      expect(user.save()).to.be.rejected;
    });
  });
});

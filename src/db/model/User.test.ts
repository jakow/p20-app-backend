// tslint:disable:no-unused-expression
import { expect } from 'chai';

import * as mongoose from 'mongoose';

(mongoose as any).Promise = Promise;

import User, { UserDocument, UserSchema } from './User';

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

    describe('accessCode', () => {
      it('gets hashed when created or modified', async () => {
        const user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          accessCode: 's3cr3t',
        });
        await user.save();
        expect(user.accessCode).to.not.equal('s3cr3t');
      });

      it('can be cleared', async () => {
        const user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          accessCode: 's3cr3t',
        });
        await user.save();
        user.accessCode = undefined;
        await user.save();
        expect(user.accessCode).to.be.undefined;
      });
    });
    describe('verifyAccessCode()', () => {
      let user: UserDocument;
      before(async () => {
        user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          accessCode: 's3cr3t',
        });
        await user.save();
      });

      it('resolves to true when a correct access code is supplied', async () => {
        expect(await user.verifyAccessCode('s3cr3t')).to.be.true;
      });

      it('resolves to false when a wrong access code is supplied', async () => {
        expect(await user.verifyAccessCode('wrong')).to.be.false;
      });
    });
  });
});

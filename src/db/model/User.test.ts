// tslint:disable:no-unused-expression
import { expect } from 'chai';

import * as mongoose from 'mongoose';

(mongoose as any).Promise = Promise;

import { Mockgoose } from 'mockgoose';
const storage = new Mockgoose(mongoose);

before(async () => {
  await storage.prepareStorage();
});

import User, { UserDocument, UserSchema } from './User';

describe('User', () => {
  describe('schema', () => {
    it('is an instance of mongoose schema', () => {
      expect(UserSchema).to.be.instanceOf(mongoose.Schema);
    });
  });

  describe('model', () => {
    let user: UserDocument;
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
      user = new User({
        firstName: 'Johnny B.',
        lastName: 'Goode',
        email: 'johnny.b@goode.com',
      });
      await user.save();
      expect(user.firstName).to.equal('Johnny B.');
      await user.remove();
    });

    it('throws when a new instance has missing data', () => {
      user = new User({
        firstName: 'Johnny B.',
        email: 'johnny.b@goode.com',
      });
      expect(user.save()).to.be.rejected;
    });

    describe('accessCode', () => {
      it('gets hashed when created or modified', async () => {
        user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          accessCode: 's3cr3t',
        });
        await user.save();
        expect(user.accessCode).to.not.equal('s3cr3t');
        await user.remove();
      });

      it('can be cleared', async () => {
        user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          accessCode: 's3cr3t',
        });
        await user.save();
        user.accessCode = undefined;
        await user.save();
        expect(user.accessCode).to.be.undefined;
        await user.remove();
      });
    });

    describe('verifyAccessCode()', () => {
      it('resolves to true when a correct access code is supplied', async () => {
        user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          accessCode: 's3cr3t',
        });
        await user.save();
        expect(await user.verifyAccessCode('s3cr3t')).to.be.true;
        await user.remove();
      });

      it('resolves to false when a wrong access code is supplied', async () => {
        user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          accessCode: 's3cr3t',
        });
        expect(await user.verifyAccessCode('wrong')).to.be.false;
      });

      it('resolves to false when no code is provided', async () => {
        user = new User({
          firstName: 'Johnny B.',
          lastName: 'Goode',
          email: 'johnny.b@goode.com',
          // no accessCode
        });
        expect(await user.verifyAccessCode('test')).to.be.false;
      });
    });
  });
});

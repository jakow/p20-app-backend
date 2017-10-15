// tslint:disable:no-unused-expression
import { expect } from 'chai';
import * as mongoose from 'mongoose';
import AdminUser, { AdminUserDocument } from '../AdminUser';

describe('AdminUser', () => {
  describe('model', () => {
    const firstName = 'Miles';
    const lastName = 'Davis';
    const email = 'miles@davis.com';
    const password = 'correct-horse-battery-staple';
    before(async () => {
      await mongoose.connect('mongodb://localhost/p20-backend-test-db', { useMongoClient: true });
    });

    after(async () => {
      await mongoose.connection.db.dropDatabase();
      await mongoose.connection.close();
    });

    let admin: AdminUserDocument;

    it('requires a password', () => {
      admin = new AdminUser({
        firstName, lastName, email, // no password
      });
      expect(admin.save()).to.be.rejected;
    });

    it('can be saved when password is provided', async () => {
      admin = new AdminUser({ firstName, lastName, email, password });
      expect(async () => await admin.save()).not.to.throw;
      await admin.remove();
    });

    it('hashes the passwords', async () => {
      admin = new AdminUser({ firstName, lastName, email, password });
      await admin.save();
      expect(admin.password).to.not.equal(password);
      await admin.remove();
    });

    describe('verifyPassword()', () => {
      before(async () => {
        admin = new AdminUser({ firstName, lastName, email, password });
        await admin.save();
      });

      after(async () => {
        await admin.remove();
      });

      it('resolves to true if a correct password is supplied', async () => {
        expect(await admin.verifyPassword(password)).to.be.true;
      });

      it('resolves to false if an incorrect password is supplied', async () => {
        expect(await admin.verifyPassword('wrong')).to.be.false;
      });

    });
  });
});

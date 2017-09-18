// tslint:disable:no-unused-expression
import { expect } from 'chai';
import * as mongoose from 'mongoose';
import AdminUser, { AdminUserDocument } from './AdminUser';

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

    it('requires a password', () => {
      const admin = new AdminUser({
        firstName, lastName, email, // no password
      });
      expect(admin.save()).to.be.rejected;
    });

    it('can be saved when password is provided', () => {
      const admin = new AdminUser({
        firstName: 'Miles',
        lastName: 'Davis',
        email: 'miles@davis.com',
        password: 'correct-horse-battery-staple',
      });
      expect(admin.save()).to.be.fulfilled;
    });

    it('hashes the passwords', async () => {
      const admin = new AdminUser({ firstName, lastName, email, password });
      await admin.save();
      expect(admin.password).to.not.equal(password);
    });

    describe('verifyPassword()', () => {
      let admin: AdminUserDocument;
      before(async () => {
        admin = new AdminUser({ firstName, lastName, email, password });
        await admin.save();
      });

      it('resolves to true if a correct password is supplied', async () => {
        expect(await admin.verifyPassword(password)).to.be.true;
      });

      it('resolves to false if an incorrect password is supplied', async () => {
        expect(await admin.verifyPassword('incorrect-battery-paperclip-donkey')).to.be.false;
      });

    });
  });
});

import { expect } from 'chai';
import 'mocha';

import { Schema } from 'mongoose';

import User, { UserSchema } from './User';

describe('User', () => {
  describe('schema', () => {
    it('is an instance of mongoose schema', () => {
      expect(UserSchema).to.be.instanceOf(Schema);
    });
  });

  describe('model', () => {
    it('has the correct name', () => {
      expect(User.modelName).to.equal('User');
    });
  });
});

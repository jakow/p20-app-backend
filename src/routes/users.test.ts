// tslint:disable:no-unused-expression
import { expect } from 'chai';

import { CREATED, NOT_FOUND } from 'http-status-codes';
import { Context } from 'koa';
import * as mongoose from 'mongoose';
import User, { UserDocument, UserObject } from '../db/model/User';
import { ValidationError } from './errors';
import * as users from './users';

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

      expect(users.createUser(newUser)).to.be.fulfilled;
    });

    it('throws a ValidationError when missing data is entered', () => {
      const newUser = {
        firstName: 'Johnny B.',
        lastName: '',
        email: 'johnny.b@goode.com',
      };

      expect(users.createUser(newUser)).to.be.rejectedWith(ValidationError);
    });

    it('creates an admin user if the input data requests an admin user to be created', async () => {
      const newUser = {
        firstName: 'Ernest',
        lastName: 'Hemingway',
        email: 'ernest@hemingway.com',
        password: 'passw0rd',
        kind: 'Admin',
      };
      const user = await users.createUser(newUser);
      expect(user.kind).to.equal('Admin');
    });

    it('generates an access code for the created user', async () => {
      const newUser = {
        firstName: 'Charles',
        lastName: 'Bukowski',
        email: 'charles@bukowski.com',
        password: 'passw0rd',
      };
      const user = await users.createUser(newUser);
      expect(user.accessCode).to.be.a('string');
    });
  });

  describe('updateUser()', () => {
    let user: UserDocument;

    beforeEach(async () => {
      user = await users.createUser({
        firstName: 'John',
        lastName: 'Steinbeck',
        email: 'john@steinbeck.com',
      });
    });

    afterEach(async () => {
      await user.remove();
    });

    it('updates fields of a user', async () => {
      await users.updateUser(user, { lastName: 'Kipling' });
      expect(user.lastName).to.equal('Kipling');
    });
  });

  describe('handleGetUser', () => {
    let user: UserDocument;
    let userId: string;
    let mockContext: any;

    before(async () => {
      user = await users.createUser({
        firstName: 'John',
        lastName: 'Steinbeck',
        email: 'john@steinbeck.com',
      });
      userId = user.id as string;
    });

    after(async () => {
      user.remove();
    });

    beforeEach(() => {
      mockContext = {
        params: {},
      };
    });

    it('gets the user from the database by id', async () => {
      mockContext.params.id = userId;
      await users.handleGetUser(mockContext as Context);
      expect(mockContext.body).to.contain({
        _id: userId,
        firstName: 'John',
        lastName: 'Steinbeck',
        email: 'john@steinbeck.com',
      });
    });

    it('results in 404 Not Found if the user does not exist', async () => {
      const wrongUserId = 'abcdef01234567899871caeb';
      mockContext.params.id = wrongUserId;
      await users.handleGetUser(mockContext as Context);
      expect(mockContext.status).to.equal(NOT_FOUND);
    });
  });

  describe('handleGetUsers()', () => {
    let mockContext: any;
    let userList: UserObject[];
    before(async () => {
      await mongoose.connection.db.dropCollection('users');
      userList = [
        {
          firstName: 'Bob',
          lastName: 'Bobinator',
          email: 'bob@bobinator.net',
        },
        {
          firstName: 'Tommy Lee',
          lastName: 'Jones',
          email: 'tljones@mail.net',
        },
        {
          firstName: 'Tommy Lee',
          lastName: 'Jones',
          email: 'tljones@mail.net',
        },
      ];
      await User.create(userList);
    });

    beforeEach(() => {
      mockContext = {
        params: {},
        query: {},
      };
    });

    it('gets users in database', async () => {
      await users.handleGetUsers(mockContext);
      expect(mockContext.body).to.be.an('array');
    });

    it('uses the query params to filter results', async () => {
      mockContext.query.email = 'bob@bobinator.net';
      await users.handleGetUsers(mockContext);
      expect(mockContext.body).to.have.length(1);
    });

    it('ignores queries not in a query param whitelist', async () => {
      mockContext.query.accessCode = '123adf3';
      await users.handleGetUsers(mockContext);
      expect(mockContext.body).to.have.length(userList.length);
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
      await users.handleCreateUser(ctx);
      expect(ctx.status).to.equal(CREATED);
    });

    it('throws a ValidationError if the request data is correct', () => {
      const ctx = createCtxFromBody({
        firstName: 'Johnny B.',
        lastName: '',
        email: 'johnny.b@goode.com',
      });
      expect(users.handleCreateUser(ctx)).to.be.rejectedWith(ValidationError);
    });
  });

  describe('handleDeleteUser()', () => {
    it('removes a user from the collection by id', async () => {
      const user = await users.createUser({
        firstName: 'John',
        lastName: 'Steinbeck',
        email: 'john@steinbeck.com',
      });
      const id = user.id;
      const mockContext: any = {
        params: { id },
        query: {},
      };
      await users.handleDeleteUser(mockContext);
      expect(await User.findById(id as string).exec()).to.be.null;
    });
  });

  describe('handleEditField', () => {
    let user: UserDocument;
    let id: string;
    before(async () => {
      user = await users.createUser({
        firstName: 'John',
        lastName: 'Steinbeck',
        email: 'john@steinbeck.com',
      });
      id = user.id as string;
    });

    after(async () => {
      await user.remove();
    });

    it('changes a value of a field of a user', async () => {
      const mockContext: any = {
        params: { id, field: 'firstName' },
        request: { body: { value: 'Bob' } },
        query: {},
      };
      await users.handleEditField(mockContext);
      const updatedUser = await User.findById(id) as UserDocument;
      expect(updatedUser.firstName).to.equal('Bob');
    });

    it('does not allow changing non-whitelisted fields', async () => {
      const previousAccessCode = user.accessCode;
      const mockContext: any = {
        params: { id, field: 'accessCode' },
        request: { body: { value: 'Ha4cked' } },
        query: {},
      };
      await users.handleEditField(mockContext);
      const updatedUser = await User.findById(id) as UserDocument;
      expect(updatedUser.accessCode).to.equal(previousAccessCode); // unchanged
    });
  });
});

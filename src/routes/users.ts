import { CREATED, FORBIDDEN, NO_CONTENT, NOT_FOUND } from 'http-status-codes';
import { Context } from 'koa';
import { omit, pick } from 'lodash';

import AdminUser from '../db/model/AdminUser';
import User, { UserDocument, UserObject } from '../db/model/User';
import { RawDocument } from '../db/types';

import { generateAccessCode } from '../lib/access-codes';
import { wrapValidationErrors } from './errors';

const DEFAULT_RESULTS_PER_PAGE = 25;

export const createUser = wrapValidationErrors((data: Partial<UserObject>) => {
  const userData = { ...data, accessCode: generateAccessCode() };
  let user;
  switch (userData.kind) {
    case 'Admin':
      user = new AdminUser(userData);
      break;
    default:
      user = new User(userData);
  }
  return user.save();
});

export const updateUser = wrapValidationErrors((user: UserDocument, data: Partial<UserObject>) => {
  Object.assign(user, data);
  return user.save();
});

function createUserRequest(body: any) {
  const val = omit(body, 'accessCode');
  return val;
}

function createUserResponse(u: UserDocument) {
  const data = omit(u.toJSON(), 'accessCode', 'password') as Partial<UserObject> & RawDocument;
  data._id = data._id.toString();
  return data;
}

function createUserQuery(queryObject: any) {
  const permittedQueryParams = ['firstName', 'lastName', 'email', 'kind'];
  const q = pick(queryObject, ...permittedQueryParams);
  return q;
}

export async function handleCreateUser(ctx: Context) {
  const userRequest = createUserRequest(ctx.request.body);
  const user = await createUser(userRequest);
  ctx.body = createUserResponse(user);
  ctx.status = CREATED;
}

export async function handleGetUser(ctx: Context) {
  const user = await User.findById(ctx.params.id);
  if (user) {
    ctx.body = createUserResponse(user);
  } else {
    ctx.status = NOT_FOUND;
  }
}

export async function handleGetUsers(ctx: Context) {
  // TODO: pagination, filtering
  const page: number = parseInt(ctx.query.page, 10) || 0;
  const perPage: number = parseInt(ctx.query.perPage, 10) || DEFAULT_RESULTS_PER_PAGE;
  const query = createUserQuery(ctx.query);
  const users = await User
    .find(query)
    // .select({ password: 0, accessCode: 0 })
    .skip(perPage * page)
    .limit(perPage)
    .exec();

  ctx.body = users.map(createUserResponse);
}

export async function handleDeleteUser(ctx: Context) {
  const userId = ctx.params.id;
  await User.findByIdAndRemove(userId).exec();
  ctx.status = NO_CONTENT;
}

export async function handleEditField(ctx: Context) {
  const editableFields = ['firstName', 'lastName', 'password'];
  const field: string = ctx.params.field;
  const value = ctx.request.body.value;
  if (!editableFields.includes(field)) {
    ctx.status = FORBIDDEN;
    return;
  }
  const id: string = ctx.params.id;
  const user = await User.findById(id);
  if (user) {
    await updateUser(user, { [field]: value });
    ctx.body = createUserResponse(user);
  } else {
    ctx.status = NOT_FOUND;
  }
}

export async function handleEditEmail(ctx: Context) {
  // bit of a special case - email gives access so access code must be regenerated
  const id = ctx.params.id;
  const email = ctx.request.body.value;
  const user = await User.findById(id);
  if (user) {
    await updateUser(user, {
      email,
      accessCode: generateAccessCode(),
    });
    ctx.body = createUserResponse(user);
  } else {
    ctx.status = NOT_FOUND;
  }
}

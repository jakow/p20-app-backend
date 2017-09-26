import { CREATED, FORBIDDEN, NO_CONTENT, NOT_FOUND } from 'http-status-codes';
import { Context } from 'koa';
import { omit } from 'lodash';

import AdminUser from '../db/model/AdminUser';
import User, { UserDocument, UserObject } from '../db/model/User';

import { generateAccessCode } from '../lib/access-codes';
import { wrapValidationErrors } from './errors';

const DEFAULT_RESULTS_PER_PAGE = 25;

export async function getUser(ctx: Context) {
  const user = await User.findById(ctx.params.id).exec();
  if (user) {
    // pluck login data from the response
    const { accessCode, password, ...response } = user.toObject() as any;
    ctx.body = response;
  }
}

export const createUser = wrapValidationErrors(async (data: any) => {
  const userData = { ...data, accessCode: generateAccessCode() };
  let user;
  if (data.kind === 'Admin') {
    user = new AdminUser(userData);
  } else {
    user = new User(userData);
  }
  await user.save();
  return user;
});

export const updateUser = wrapValidationErrors(async (user: UserDocument, data: any) => {
  Object.assign(user, data);
  return await user.save();
});

function createUserRequest(body: any) {
  const val = omit(body, 'accessCode');
  return val;
}

function createUserResponse(u: UserDocument) {
  return omit(u.toObject(), 'accessCode', 'password') as Partial<UserObject>;
}

function createUserQuery(queryObject: any) {
  const permittedQueryParams = ['firstName', 'lastName', 'email', 'kind'];
  const q: {[k: string]: string} = {};
  for (const [k, v] of Object.entries(queryObject)) {
    if (permittedQueryParams.includes(k)) {
      q[k] = v;
    }
  }
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
  const editableFields = ['firstName', 'lastName'];
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

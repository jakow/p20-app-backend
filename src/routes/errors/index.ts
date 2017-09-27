// tslint:disable:max-classes-per-file
import { FORBIDDEN, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { Context } from 'koa';
import { pick } from 'lodash';

interface ValidationErrorMap {
  [key: string]: {
    path: string;
    kind: string;
    reason: string;
  };
}

export class ValidationError extends Error {

  public static fromMongooseValidationErrors(errorObject: any) {
    const errors: ValidationErrorMap = {};
    for (const [key, value] of Object.entries(errorObject)) {
      errors[key] = pick(value, 'path', 'kind', 'reason');
    }
    return new ValidationError(errors);
  }

  public code = UNPROCESSABLE_ENTITY;

  constructor(public readonly errors: ValidationErrorMap) {
    super('ValidationError');
  }
}

export class UnauthorizedError extends Error {
  public code = UNAUTHORIZED;
}

export class ForbiddenError extends Error {
  public code = FORBIDDEN;
}

type AsyncFunction = (...args: any[]) => Promise<any>;

export function wrapValidationErrors<F extends AsyncFunction>(f: F): F {
  const wrapped = (async (...args: any[]) => {
    try {
      return await f(...args);
    } catch (e) {
      if (e.name === 'ValidationError') {
        throw ValidationError.fromMongooseValidationErrors(e.errors);
      }
      throw e;
    }
  }) as F;
  return wrapped;
}

/**
 * Use known error classes to enhance API responses without handling them
 * explicitly in API code.
 * @param ctx
 * @param next
 */
export async function processErrors(ctx: Context, next: () => Promise<any>) {
  try {
    await next();
  } catch (e) {
    // intercept errors

    if (e.code) {
      ctx.status = e.code;
    }

    if (e instanceof ValidationError) {
      ctx.body = e.errors;
    } else {
      throw e;
    }
  }
}

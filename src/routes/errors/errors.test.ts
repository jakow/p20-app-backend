import { expect } from 'chai';

import { UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { processErrors, ValidationError } from './index';

describe('route error handling', () => {
  describe('processErrors', () => {
    it('returns a 422 if a ValidationError is caught', () => {
      const ctx: any = {};
      processErrors(ctx, () => {
        throw new ValidationError({});
      });
      expect(ctx.status).to.equal(UNPROCESSABLE_ENTITY);
    });

    it('rethrows if generic error is caught', () => {
      const ctx: any = {};
      expect(processErrors(ctx, async () => {
        throw new Error();
      })).to.be.rejectedWith(Error);
    });
  });
});

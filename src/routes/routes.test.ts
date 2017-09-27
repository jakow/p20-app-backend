import { expect } from 'chai';

import * as Router from 'koa-router';

import router from './index';

describe('router', () => {
  it('is an instance of Koa router', () => {
    expect(router).to.be.an.instanceOf(Router);
  });
});

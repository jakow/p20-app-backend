import { expect } from 'chai';

import { Schema } from 'mongoose';

import { ImageSchema } from './Image';

describe('Image', () => {
  describe('schema', () => {
    it('is an instance of mongoose schema', () => {
      expect(ImageSchema).to.be.instanceOf(Schema);
    });
  });
});

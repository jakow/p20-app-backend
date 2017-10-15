// tslint:disable:no-unused-expression
import { expect } from 'chai';

import { parseDates, toCamelCaseObject } from '../objects';

describe('object helper functions', () => {
  describe('toCamelCaseObject', () => {
    it('converts a underscore_case object to a camelCase object', () => {
      const input = {
        first_name: 'Johnny',
        last_name: 'Goode',
      };
      const output = {
        firstName: 'Johnny',
        lastName: 'Goode',
      };

      expect(toCamelCaseObject(input)).to.deep.equal(output);
    });

    it('handles nested objects', () => {
      const input = {
        first_name: 'Johnny',
        address: {
          street_number: 12,
          street_name: 'Chippy Lane',
        },
      };
      const output = {
        firstName: 'Johnny',
        address: {
          streetNumber: 12,
          streetName: 'Chippy Lane',
        },
      };
      expect(toCamelCaseObject(input)).to.deep.equal(output);
    });
  });

  describe('parseDates', () => {
    it('replaces date-like strings with Date objects', () => {
      const obj = {
        datelike: '2018-02-16 13:00',
      };
      parseDates(obj);
      expect((obj.datelike as any).getTime()).to.be.a('number').and.not.be.NaN;
    });
  });
});

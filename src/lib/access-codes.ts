import { characters, generate } from 'shortid';

// set shortid characters
characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

export function generateAccessCode() {
  return generate();
}

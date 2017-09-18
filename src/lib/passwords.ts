import { compare, genSalt, hash } from 'bcrypt';

const WORK_FACTOR = 12;

export async function encryptPassword(password: string) {
  const salt = await genSalt(WORK_FACTOR);
  return hash(password, salt);
}

export async function verifyPassword(candidate: string, encrypted: string) {
  return compare(candidate, encrypted);
}

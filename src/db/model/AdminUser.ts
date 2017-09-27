/**
 * Admin users need passwords. Regular users only need app access codes.
 * This model uses mongoose's discriminator features to create a specialised
 * User model which includes a password
 */

import { Schema } from 'mongoose';
import { encryptPassword, verifyPassword } from '../../lib/passwords';
import UserModel, { UserDocument, userSchemaOptions } from './User';

export interface AdminUserDocument extends UserDocument {
  password: string;
  verifyPassword(candidate: string): Promise<boolean>;
}

export const AdminUserSchema = new Schema({
  password: { type: String, required: true },
}, userSchemaOptions);

AdminUserSchema.pre('save', async function(this: AdminUserDocument, done) {
  if (this.isModified('password') && this.password !== '') {
    this.password = await encryptPassword(this.password);
  }
  done();
});

AdminUserSchema.methods.verifyPassword = function(this: AdminUserDocument, candidate: string) {
  return verifyPassword(candidate, this.password);
};

export default UserModel.discriminator<AdminUserDocument>('Admin', AdminUserSchema);

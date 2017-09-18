/**
 *
 * Because we are not dealing
 * with highly sensitive data here, we issue access codes to the user which then he uses
 * to authenticate his app
 *
 *
 */

import { Document, model, Schema } from 'mongoose';
import { encryptPassword, verifyPassword } from '../../lib/passwords';
import { Image, ImageSchema } from './Image';

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  accessCode?: string;
  photo?: Image; // url provided on save
  // schema methods
  verifyAccessCode(candidate: string): Promise<boolean>;
}

export const userSchemaOptions = {
  discriminatorKey: 'kind',
};

export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  accessCode: String,
  photo: { type: ImageSchema },

}, userSchemaOptions);

UserSchema.pre('save', async function(this: UserDocument, done) {
  if (this.isModified('accessCode') && this.accessCode) {
    try {
      this.accessCode = await encryptPassword(this.accessCode);
    } catch (e) {
      return done(e);
    }
  }
  return done();
});

UserSchema.methods.verifyAccessCode = function(this: UserDocument, accessCode: string) {
  if (this.accessCode == null) {
    return false;
  }
  return verifyPassword(accessCode, this.accessCode);
};

export default model<UserDocument>('User', UserSchema);

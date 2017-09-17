import { Document, model, Schema } from 'mongoose';
import { ImageSchema } from './Image';

interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  photo?: string; // url provided on save
}

export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  photo: { type: ImageSchema },
});

export default model<UserDocument>('User', UserSchema);

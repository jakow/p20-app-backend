import { Schema } from 'mongoose';

export interface Image {
  url: string;
  secureUrl: string;
  dimensions: { x: number, y: number };
}

export const ImageSchema = new Schema({
  url: { type: String, required: true },
  secureUrl: { type: String, required: true },
  dimensions: {
    x: Number,
    y: Number,
  },
});

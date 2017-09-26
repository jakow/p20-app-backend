import { Schema } from 'mongoose';

export interface UserInformation {
  occupation: string; // student/professional?
  affiliation: string; // University or company
  position: string; // Job title or study level
  // if a student only
  research: string;
}

export const UserInformationSchema = new Schema({
  occupation: String,
  affiliation: String,
  position: String,
  research: String,
});

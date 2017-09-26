import * as mongoose from 'mongoose';

(mongoose as any).Promise = Promise;

export function initializeDb() {
  return mongoose.connect('mongodb://localhost/p20-app-backend', {
    useMongoClient: true,
  });

}

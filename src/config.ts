// tslint:disable:no-magic-numbers
import * as dotenv from 'dotenv';

const environmentEnvVar = process.env.NODE_ENV;
export const environment = typeof environmentEnvVar === 'undefined' ? 'development' : environmentEnvVar;

if (environment === 'development') {
  try {
    const result = dotenv.config();
    if (result.error) { throw new Error('Failed parsing .dotenv'); }
  } catch {
    // tslint:disable-next-line:max-line-length
    console.error(`Create a ".env" file to use in development mode. At minimum, it must contain the following environment variables:
    HOST
    PORT
    `);
    process.exit(1);
  }
}

export const PORT = parseInt(process.env.PORT as string, 10) || 5000;

const hostEnvVar = process.env.HOST;
export const HOST = hostEnvVar == null ? 'localhost' : hostEnvVar;

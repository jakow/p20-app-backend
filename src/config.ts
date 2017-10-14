// tslint:disable:no-magic-numbers
import { stripIndent } from 'common-tags';
import * as dotenv from 'dotenv';

export const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  try {
    const result = dotenv.config();

    if (result.error) { throw new Error('Failed parsing .dotenv'); }
  } catch {
    console.error(stripIndent`Create a ".env" file to use in development mode.
    At minimum, it must contain the following environment variables:
    HOST
    PORT
    `);
    process.exit(1);
  }
}

export const PORT = parseInt(process.env.PORT as string, 10) || 5000;

const hostEnvVar = process.env.HOST;
export const HOST = hostEnvVar == null ? 'localhost' : hostEnvVar;

export const TICKETBASE_API_KEY = process.env.TICKETBASE_API_KEY as string;

if (!TICKETBASE_API_KEY) {
  throw new Error('Ticketbase key missing');
}

export const TICKETBASE_EVENT_ID = process.env.TICKETBASE_EVENT_ID as string;

if (!TICKETBASE_EVENT_ID) {
  throw new Error('Ticketbase event id missing');
}

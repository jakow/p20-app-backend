import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as logger from 'koa-logger';

import { HOST, PORT } from './config';

import router from './routes';

async function main() {
  const app = new Koa();
  app.use(bodyParser());
  app.use(logger());
  app.use(router.routes());

  app.listen(PORT, HOST);
}

main();

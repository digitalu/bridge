import { BridgeRoutes } from '../../routes';
import { ErrorHandler } from '../../error';
import type * as express from 'express';
import formidableLib from 'formidable';

import { createHttpHandler } from './node-http';

export const createExpressMiddleware = (
  routes: BridgeRoutes,
  { errorHandler, formidable }: { errorHandler?: ErrorHandler; formidable?: typeof formidableLib },
): express.Handler => createHttpHandler(routes, { errorHandler, formidable });

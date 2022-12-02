import { BridgeRoutes } from '../../routes';
import { ErrorHandler } from '../../error';
import type * as express from 'express';

import { createHttpHandler } from './node-http';

export const createExpressMiddleware = (
  routes: BridgeRoutes,
  { errorHandler }: { errorHandler?: ErrorHandler },
): express.Handler => createHttpHandler(routes, { errorHandler });

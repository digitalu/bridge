import { BridgeRoutes } from '../../routes';
import { ErrorHandler } from '../../error';
import type * as express from 'express';

import { createHttpHandler } from './node-http';

export const createExpressMiddleware = (
  routes: BridgeRoutes,
  onError?: ErrorHandler,
): express.Handler => createHttpHandler(routes, onError);

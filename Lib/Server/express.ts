import { BridgeRoutes } from '../Routes';
import { ErrorHandler } from '../Errors/types';
import type * as express from 'express';

import { createHttpHandler } from './standalone';

export const createExpressMiddleware = (routes: BridgeRoutes, onError?: ErrorHandler): express.Handler =>
  createHttpHandler(routes, onError);

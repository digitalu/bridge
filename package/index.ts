export { handler } from './core';
export { httpError, onError, StatusCode } from './error';
export { apply } from './utilities';
export { createExpressMiddleware } from './server';
export { RoutesToBridgeType } from './routes';

import { BridgeRoutes } from './routes';
import { ErrorHandler } from './error';
import { RoutesToBridgeType } from '../dist/package';
import { handler } from './core';

export const initBridge = <Routes extends BridgeRoutes>({
  routes,
  url,
  errorHandler,
}: {
  routes: Routes;
  url?: string;
  errorHandler?: ErrorHandler;
}): RoutesToBridgeType<Routes> => {
  return '' as any;
};

const routes = {
  test: handler({ resolve: () => ({ uo: 56 }) }),
};

const test = initBridge({
  routes,
});

export type HJhj = RoutesToBridgeType<typeof routes>;

type u = typeof test;

type k = u;

import { BridgeRoutes } from './routes';
import { ErrorHandler } from './error';
import { RoutesToBridgeType } from './routes';
import { handler } from './core';
import type * as express from 'express';
import formidableLib from 'formidable';
import { createHttpHandler } from './server/adapters/node-http';

// export const initBridge = <Routes extends BridgeRoutes>({
//   routes,
//   url,
//   errorHandler,
//   formidable,
// }: {
//   routes: Routes;
//   url?: string;
//   formidable?: typeof formidableLib;
//   errorHandler?: ErrorHandler;
// }): { bridgeType: RoutesToBridgeType<Routes>; createExpressMiddleware: () => express.Handler } => {
//   return {
//     createExpressMiddleware: () => createHttpHandler(routes, { formidable, errorHandler }),
//   } as any;
// };

class Bridge<Routes extends BridgeRoutes> {
  private bridgeType!: RoutesToBridgeType<Routes>;

  constructor(
    public routes: Routes,
    private config: { errorHandler?: ErrorHandler; formidable?: typeof formidableLib },
    private url: string,
  ) {}

  public expressMiddleware = (): express.Handler => createHttpHandler(this.routes, this.config);
}

export const initBridge = <Routes extends BridgeRoutes>({
  routes,
  url,
  errorHandler,
  formidable,
}: {
  routes: Routes;
  url?: string;
  formidable?: typeof formidableLib;
  errorHandler?: ErrorHandler;
}): Bridge<Routes> => new Bridge(routes, { formidable, errorHandler }, url || '');

import { BridgeRoutes } from './routes';
import { ErrorHandler } from './error';
import { RoutesToBridgeType } from './routes';
import type * as express from 'express';
// @ts-ignore
import formidableLib from 'formidable';
import { createHttpHandler } from './server/adapters/node-http';

class Bridge<Routes extends BridgeRoutes> {
  public bridgeType!: RoutesToBridgeType<Routes>;

  constructor(
    public routes: Routes,
    private config: { errorHandler?: ErrorHandler; formidable?: typeof formidableLib },
    private url: string,
  ) {}

  public expressMiddleware = (): express.Handler => createHttpHandler(this.routes, this.config);
}

// @ts-nocheck
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

import { BridgeHandler, Handler } from '../core';

export type Method = 'POST' | 'PATCH' | 'GET' | 'DELETE' | 'PUT';

export type BridgeRoutes = { [key: string]: BridgeRoutes | BridgeHandler };

export interface ServerRoutes {
  [key: string]: {
    endpoint: Handler;
  };
}

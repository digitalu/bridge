import { BridgeHandler } from '../core';

export type Method = 'POST' | 'PATCH' | 'GET' | 'DELETE' | 'PUT';

export type BridgeRoutes<Object extends BridgeRoutes = {}> = {
  [key: string]: Object | BridgeHandler;
};

export const isBridgeRoutes = (data: any): data is BridgeRoutes => typeof data === 'object';

export interface ServerRoutes {
  [key: string]: {
    endpoint: BridgeHandler;
  };
}

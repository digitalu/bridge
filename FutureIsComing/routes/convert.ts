import { BridgeRoutes, ServerRoutes } from './types';
import { handler, isBridgeHandler } from '../core';
import { httpError } from '../error';

const defaultServerRoutes: ServerRoutes = {
  'not-found': {
    endpoint: handler({
      resolve: () => httpError('Not Found', 'Root not found'),
    }),
  },
};

const serverRoutes: ServerRoutes = {};

export const convertBridgeRoutesToServerRoutes = (
  routes: BridgeRoutes,
  prefix = '',
): ServerRoutes => {
  for (const [key, value] of Object.entries(routes)) {
    if (isBridgeHandler(value)) serverRoutes[`${prefix}/${key}`] = { endpoint: value };
    else convertBridgeRoutesToServerRoutes(value, `${prefix}/${key}`);
  }

  return { ...defaultServerRoutes, ...serverRoutes };
};

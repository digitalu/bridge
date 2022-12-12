import { BridgeRoutes, ServerRoutes, isBridgeRoutes } from './types';
import { handler, isBridgeHandler } from '../core';
import { httpError, StatusCode } from '../error';

const defaultServerRoutes: ServerRoutes = {
  'not-found': {
    endpoint: handler({
      resolve: () => httpError(StatusCode.NOT_FOUND, 'Root not found'),
    }),
  },
};

const serverRoutes: ServerRoutes = {};

export const convertBridgeRoutesToServerRoutes = (
  routes: BridgeRoutes,
  prefix = '',
): ServerRoutes => {
  if (typeof routes === 'object')
    for (const [key, value] of Object.entries(routes)) {
      if (isBridgeHandler(value)) serverRoutes[`${prefix}/${key}`] = { endpoint: value };
      else if (isBridgeRoutes(value)) convertBridgeRoutesToServerRoutes(value, `${prefix}/${key}`);
    }

  return { ...defaultServerRoutes, ...serverRoutes };
};

import { ControllerI, handler } from '../Controller';
import { httpError } from '../Errors';
import { BridgeRoutes, ServerRoutes, ClearRoutes } from '../Routes';
import { isController, isBridgeHandler } from '../Utilities';

const defaultServerRoutes: ServerRoutes = {
  'not-found': {
    endpoint: handler({
      resolve: () => httpError('Not Found', 'Root not found'),
    }),
  },
};

export const createRoutes = (
  routes: BridgeRoutes,
  serverRoutes: ServerRoutes = defaultServerRoutes,
  prefix = ''
): ServerRoutes => {
  Object.entries(routes).forEach(([name, subRoutesOrController]) => {
    if (isController(subRoutesOrController))
      createRoutesFromController(subRoutesOrController, serverRoutes, `${prefix}/${name}`);
    else createRoutes(subRoutesOrController, serverRoutes, `${prefix}/${name}`);
  });
  return serverRoutes;
};

export const createClearRoutes = (routes: BridgeRoutes | ControllerI): ClearRoutes => {
  const clearRoutes: ClearRoutes = {};

  Object.entries(routes).forEach(([key, value]) => {
    if (isBridgeHandler(value)) {
      clearRoutes[key] = value;
    } else if (isController(value)) {
      clearRoutes[key] = createClearRoutes(value);
    } else {
      clearRoutes[key] = createClearRoutes(value);
    }
  });

  return clearRoutes;
};

const createRoutesFromController = (controller: ControllerI, serverRoutes: ServerRoutes, prefix: string): void => {
  Object.entries(controller).forEach(([name, endpoint]) => {
    if (isBridgeHandler(endpoint))
      serverRoutes[`${prefix}/${name}`] = {
        endpoint: endpoint,
        filesConfig: endpoint.filesConfig,
      };
    else if (isController(endpoint)) createRoutesFromController(endpoint, serverRoutes, `${prefix}/${name}`);
  });
};

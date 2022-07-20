import { ControllerI, handler } from '../Controller';
import { httpError } from '../Errors';
import { BridgeRoutes, ServerRoutes } from '../Routes';
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

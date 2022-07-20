import { ControllerI } from '../Controller';
import { BridgeHandler } from '../Handler';
import { httpError } from '../Errors';

// This is a BridgeHandler
export const handler: ControllerI['handler'] = (routeParams) => {
  return new BridgeHandler({
    bodySchema: routeParams.body,
    querySchema: routeParams.query,
    headersSchema: routeParams.headers,
    filesConfig: routeParams.file,
    method: routeParams.method,
    middlewares: routeParams.middlewares,
    description: routeParams.description,
    resolve: routeParams.resolve,
  });
};

export class Controller implements ControllerI {
  public isBridgeController = true;

  public handler: ControllerI['handler'] = (routeParams) => {
    return new BridgeHandler({
      bodySchema: routeParams.body,
      querySchema: routeParams.query,
      headersSchema: routeParams.headers,
      filesConfig: routeParams.file,
      method: routeParams.method,
      middlewares: routeParams.middlewares,
      description: routeParams.description,
      resolve: routeParams.resolve,
    });
  };
  public httpError = httpError;
}

import { CreateHandler } from './types';
import { BridgeHandler } from './handlers';

// This is a BridgeHandler
export const handler: CreateHandler = (routeParams) => {
  return new BridgeHandler({
    bodySchema: routeParams.body,
    parametersSchema: routeParams.parameters,
    headersSchema: routeParams.headers,
    // filesConfig: routeParams.file,
    method: routeParams.method,
    middlewares: routeParams.middlewares,
    description: routeParams.description,
    resolve: routeParams.resolve,
  });
};

export * from './types';
export * from './handlers';
export * from './handler';

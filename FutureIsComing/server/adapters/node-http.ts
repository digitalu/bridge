import { IncomingMessage, ServerResponse } from 'http';
import { ErrorHandler } from '../../error';
import { getJSONDataFromRequestStream, getJSONQueryFromURL } from '../httpTransormers';
import { convertBridgeRoutesToServerRoutes, BridgeRoutes, Method } from '../../routes';

export const createHttpHandler = (routes: BridgeRoutes, onError?: ErrorHandler) => {
  let path: string;
  let parametersString: string;

  const serverRoutes = convertBridgeRoutesToServerRoutes(routes);

  return async (req: IncomingMessage, res: ServerResponse) => {
    let body: Record<any, any> = {};
    // let file: formidable.Files = {};

    const parameters = getJSONQueryFromURL(req.url || '');

    try {
      [path, parametersString] = (req.url || '/').split('?');

      const route = serverRoutes[path] || serverRoutes['not-found'];

      // if (route.filesConfig) file = await formidableAsyncParseFiles(req); else
      body = await getJSONDataFromRequestStream(req);

      const mid = {};

      const result = await route.endpoint.handle({
        body,
        // file,
        parameters,
        headers: req.headers,
        method: req.method as Method,
        mid,
      });

      if (result.error) {
        onError?.({ error: result.error, path: path });
        return res
          .writeHead(result.error.status || 500, { 'Content-Type': 'application/json' })
          .end(JSON.stringify({ error: result.error }));
      }

      return res
        .writeHead(200, {
          'Content-Type': typeof result === 'object' ? 'application/json' : 'text/plain',
        })
        .end(typeof result === 'object' ? JSON.stringify(result) : result);
    } catch (err) {
      onError?.({ error: { status: 500, name: 'Internal server error', data: err }, path: path });
      return res
        .writeHead(500, { 'Content-Type': 'application/json' })
        .end(JSON.stringify({ status: 500, name: 'Internal server error' }));
    }
  };
};

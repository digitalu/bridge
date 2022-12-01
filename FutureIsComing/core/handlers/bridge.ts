import { AbstractHandler, Handler } from '../handler';
import { Method } from '../../routes';
import { MiddelwaresHandler } from './middleware';
import { Resolver } from './resolver';
import { MethodValidator } from './methodValidator';
import { DataParser, DataValidator } from './dataValidator';

export interface BridgeHandlerDocumentation {
  title?: string;
  text?: string;
}

export class BridgeHandler<
  Resolve extends (...args: any[]) => any = any,
  Middlewares extends ReadonlyArray<BridgeHandler> = any,
> extends AbstractHandler {
  public handler: Handler;

  public constructor(
    public config: {
      resolve: Resolve;
      bodySchema?: DataParser;
      parametersSchema?: DataParser;
      headersSchema?: DataParser;
      method?: Method;
      middlewares?: Middlewares;
      description?: BridgeHandlerDocumentation; // NEED TO INFER FROM DATA TO DOCUMENTATE PARAMS
    },
  ) {
    super();

    if (config.bodySchema && config.method === 'GET')
      throw new Error("You can't have a body with a GET endpoint.");

    // if (p.bodySchema && p.filesConfig)
    //   throw new Error("You can't get a JSON body and files in the same endpoint.");

    const firstHandler: Handler = new MethodValidator(config.method);

    let handler = firstHandler;

    if (config.bodySchema) handler = handler.setNext(new DataValidator(config.bodySchema, 'body'));
    if (config.parametersSchema)
      handler = handler.setNext(new DataValidator(config.parametersSchema, 'parameters'));
    if (config.headersSchema)
      handler = handler.setNext(new DataValidator(config.headersSchema, 'headers'));

    // if (config.filesConfig) handler = handler.setNext(new FilesValidator(config.filesConfig));

    if (config.middlewares) handler = handler.setNext(new MiddelwaresHandler(config.middlewares));

    handler = handler.setNext(new Resolver(config.resolve));

    this.handler = firstHandler;
  }

  /**
   *
   * If the middleware returns an error, we stop the chain and return it
   * otherwise we add the result in the mid data of the next handler
   * If there is no next handler, we return the last result
   */
  public handle: Handler['handle'] = async (data) => {
    const res = await this.handler.handle(data);

    if (res && res.error) return res;

    data.mid = { ...res, ...data.mid };

    if (this.nextHandler) return this.nextHandler.handle(data);

    return res;
  };
}

export const isBridgeHandler = (data: any): data is BridgeHandler =>
  typeof data === 'object' &&
  typeof data.handler === 'object' &&
  typeof data.handle === 'function' &&
  typeof data.config === 'object' &&
  typeof data.config.resolve === 'function';

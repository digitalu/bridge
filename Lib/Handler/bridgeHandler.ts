import { Method } from '../Routes';
import { Resolver } from './resolver';
import { DataValidator, MethodValidator, FilesValidator, DataParser, FilesConfig } from './Validators';
import { Handler, AbstractHandler, MiddelwaresHandler } from './handler';

export class BridgeHandler<
  Resolve extends (...args: any[]) => any = any,
  Middlewares extends ReadonlyArray<BridgeHandler> = any
> extends AbstractHandler {
  public isBridgeHandler = true;

  public resolve: Resolve;
  public handler: Handler;
  public description?: string;
  public method?: Method;
  public filesConfig?: FilesConfig;
  public bodySchema?: DataParser;
  public querySchema?: DataParser;
  public headersSchema?: DataParser;
  public middlewares?: Middlewares;

  public constructor(
    public p: {
      resolve: Resolve;
      bodySchema?: DataParser;
      querySchema?: DataParser;
      headersSchema?: DataParser;
      filesConfig?: FilesConfig;
      method?: Method;
      middlewares?: Middlewares;
      description?: string;
    }
  ) {
    super();
    this.resolve = p.resolve;
    this.description = p.description;
    this.method = p.method;
    this.filesConfig = p.filesConfig;
    this.bodySchema = p.bodySchema;
    this.querySchema = p.querySchema;
    this.headersSchema = p.headersSchema;
    this.middlewares = p.middlewares;

    if (p.method === 'GET' && p.bodySchema) throw new Error("You can't have a body with a GET endpoint.");
    if (p.bodySchema && p.filesConfig) throw new Error("You can't get a JSON body and files in the same endpoint.");

    const firstHandler: Handler = new MethodValidator(p.method);
    let handler = firstHandler;

    if (p.bodySchema) handler = handler.setNext(new DataValidator(p.bodySchema, 'body'));
    if (p.querySchema) handler = handler.setNext(new DataValidator(p.querySchema, 'query'));
    if (p.headersSchema) handler = handler.setNext(new DataValidator(p.headersSchema, 'headers'));
    if (p.filesConfig) handler = handler.setNext(new FilesValidator(p.filesConfig));

    if (p.middlewares) handler = handler.setNext(new MiddelwaresHandler(p.middlewares));

    // if (p.middlewares)
    //   p.middlewares.forEach((mid) => {
    //     handler = handler.setNext(mid);
    //   });

    handler = handler.setNext(new Resolver(p.resolve));

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

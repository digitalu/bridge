import { Method } from '../Routes/types';

type AnyObject = Record<any, any>;

export interface BridgeParameters {
  body: AnyObject;
  query: AnyObject;
  headers: AnyObject;
  file: AnyObject;
  mid: AnyObject;
  method: Method;
}

export interface Handler {
  setNext(handler: Handler): Handler;

  handle: (p: BridgeParameters) => any;
}

export abstract class AbstractHandler implements Handler {
  protected nextHandler: Handler | undefined;

  public setNext(handler: Handler): Handler {
    this.nextHandler = handler;

    return handler;
  }

  public async handle(data: BridgeParameters) {
    if (this.nextHandler) return this.nextHandler.handle(data);
    return data;
  }
}

export class MiddelwaresHandler extends AbstractHandler {
  constructor(private handlers: ReadonlyArray<Handler>) {
    super();
  }

  public handle: Handler['handle'] = async (data) => {
    const results = await Promise.all(this.handlers.map(async (handler) => handler.handle(data)));

    for (const res of results) if (res && res.error) return res;

    return super.handle({ ...data, mid: Object.assign({}, ...results) });
  };
}

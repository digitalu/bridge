import { AbstractHandler, Handler, BridgeParameters } from './handler';

export class Resolver extends AbstractHandler {
  public isResolver = true;

  constructor(private resolve: (p: BridgeParameters) => any) {
    super();
  }

  public handle: Handler['handle'] = async (data) => this.resolve(data);
}

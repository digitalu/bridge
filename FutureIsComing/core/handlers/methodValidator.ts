import { Method } from '../../routes';
import { AbstractHandler, Handler } from '../handler';
import { httpError } from '../../error';

export class MethodValidator extends AbstractHandler {
  constructor(private method: Method = 'POST') {
    super();
  }

  public handle: Handler['handle'] = async (data) => {
    if (data.method === this.method) return super.handle(data);

    return httpError('Not Found', 'Wrong method', { method: this.method });
  };
}

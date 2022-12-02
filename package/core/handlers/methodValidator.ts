import { Method } from '../../routes';
import { AbstractHandler, Handler } from '../handler';
import { httpError, StatusCode } from '../../error';

export class MethodValidator extends AbstractHandler {
  constructor(private method: Method = 'POST') {
    super();
  }

  public handle: Handler['handle'] = async (data) => {
    if (data.method === this.method) return super.handle(data);

    return httpError(StatusCode.NOT_FOUND, 'Wrong method', { method: this.method });
  };
}

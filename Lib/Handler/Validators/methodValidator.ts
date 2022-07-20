import { Method } from '../../Routes';
import { AbstractHandler, Handler } from '../handler';
import { httpError } from '../../Errors';

export class MethodValidator extends AbstractHandler {
  constructor(private method?: Method) {
    super();
  }

  public handle: Handler['handle'] = async (data) => {
    if (!this.method || data.method === this.method) return super.handle(data);
    return httpError('Not Found', 'Wrong method', { method: this.method });
  };
}

import { AbstractHandler, Handler } from '../handler';
import { httpError } from '../../Errors';

export type FilesConfig = ReadonlyArray<string> | 'any';

export class FilesValidator extends AbstractHandler {
  constructor(private config: FilesConfig) {
    super();
  }

  public handle: Handler['handle'] = async (data) => {
    const missingFiles: string[] = [];

    // req.body contains the files
    if (this.config !== 'any') for (const name of this.config) if (!data.file[name]) missingFiles.push(name);

    if (missingFiles.length > 0)
      return httpError('Unprocessable entity', "You didn't send all required files", { missingFiles });

    return super.handle(data);
  };
}

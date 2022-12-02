import formidableLib from 'formidable';
import { IncomingMessage } from 'http';

export const formidableAsyncParseFiles = async (
  req: IncomingMessage,
  formidable: typeof formidableLib,
): Promise<formidableLib.Files> => {
  let form = formidable({ multiples: true });

  return new Promise((resolve, reject) => {
    form.parse(req, function (error, fields, files) {
      if (error) {
        reject(error);
        return;
      }

      resolve(files);
    });
  });
};

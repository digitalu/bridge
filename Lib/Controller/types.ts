import { MidsReturnsIntersection, MidsParams } from '../Utilities';
import { Method } from '../Routes';
import { BridgeHandler, DataParser, InferDataParser, FilesConfig } from '../Handler';
import formidable from 'formidable';

export interface RouteParams<Body, Query, Mids, Resolve, Method, Headers, File> {
  body?: Body /** Can't have a body with GET method or with files, an error is throw if ther developer tries to, but the type here doesnt block to keep a clean UI */;
  query?: Query;
  headers?: Headers;
  file?: File;
  method?: Method;
  middlewares?: Mids;
  description?: string;
  resolve: Resolve;
}

type KeysWithValNotEmptyObject<T> = keyof { [P in keyof T as keyof T[P] extends never ? never : P]: P };
// The following type has not been used to type the handler method below to show a clean interface through the editor
type ExcludeEmptyObject<T> = { [key in KeysWithValNotEmptyObject<T> & keyof T]: T[key] };

export interface ControllerI {
  handler: <
    Resolve extends (p: {
      [key in KeysWithValNotEmptyObject<{
        mid: MidsReturnsIntersection<Mids> extends never ? {} : MidsReturnsIntersection<Mids>;
        body: (InferDataParser<Body> extends never ? {} : InferDataParser<Body>) &
          (MidsParams<Mids>['body'] extends never ? {} : MidsParams<Mids>['body']);
        query: (InferDataParser<Query> extends never ? {} : InferDataParser<Query>) &
          (MidsParams<Mids>['query'] extends never ? {} : MidsParams<Mids>['query']);
        headers: (InferDataParser<Headers> extends never ? {} : InferDataParser<Headers>) &
          (MidsParams<Mids>['headers'] extends never ? {} : MidsParams<Mids>['headers']);
        file: File extends ['BridgeFilesDoNotExists']
          ? {}
          : File extends 'any'
          ? { [key: string]: formidable.File }
          : { [key in File[number]]: formidable.File };
      }> &
        keyof {
          mid: MidsReturnsIntersection<Mids> extends never ? {} : MidsReturnsIntersection<Mids>;
          body: (InferDataParser<Body> extends never ? {} : InferDataParser<Body>) &
            (MidsParams<Mids>['body'] extends never ? {} : MidsParams<Mids>['body']);
          query: (InferDataParser<Query> extends never ? {} : InferDataParser<Query>) &
            (MidsParams<Mids>['query'] extends never ? {} : MidsParams<Mids>['query']);
          headers: (InferDataParser<Headers> extends never ? {} : InferDataParser<Headers>) &
            (MidsParams<Mids>['headers'] extends never ? {} : MidsParams<Mids>['headers']);
          file: File extends ['BridgeFilesDoNotExists']
            ? {}
            : File extends 'any'
            ? { [key: string]: formidable.File }
            : { [key in File[number]]: formidable.File };
        }]: {
        mid: MidsReturnsIntersection<Mids> extends never ? {} : MidsReturnsIntersection<Mids>;
        body: (InferDataParser<Body> extends never ? {} : InferDataParser<Body>) &
          (MidsParams<Mids>['body'] extends never ? {} : MidsParams<Mids>['body']);
        query: (InferDataParser<Query> extends never ? {} : InferDataParser<Query>) &
          (MidsParams<Mids>['query'] extends never ? {} : MidsParams<Mids>['query']);
        headers: (InferDataParser<Headers> extends never ? {} : InferDataParser<Headers>) &
          (MidsParams<Mids>['headers'] extends never ? {} : MidsParams<Mids>['headers']);
        file: File extends ['BridgeFilesDoNotExists']
          ? {}
          : File extends 'any'
          ? { [key: string]: formidable.File }
          : { [key in File[number]]: formidable.File };
      }[key];
    }) => Res,
    Res,
    Body extends DataParser<Record<any, any>> = never,
    Query extends DataParser<Record<string, any>> = never,
    Headers extends DataParser<Record<string, any>> = never,
    File extends FilesConfig = ['BridgeFilesDoNotExists'],
    Mids extends ReadonlyArray<BridgeHandler> = never,
    Meth extends Method = 'POST'
  >(
    p: RouteParams<Body, Query, Mids, Resolve, Meth, Headers, File>
  ) => BridgeHandler<Resolve, Mids>;
}

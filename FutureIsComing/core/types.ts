import { Method } from '../routes';
import { KeysWithValNotEmptyObject, MidsReturnsIntersection, MidsParams } from '../utilities';
import { DataParser, BridgeHandler, InferDataParser, BridgeHandlerDocumentation } from './handlers';

// type AnyObject = Record<any, any>;

// export interface BridgeParams {
//   body: AnyObject;
//   parameters: AnyObject;
//   headers: AnyObject;
//   file: AnyObject;
//   mid: AnyObject;
//   method: Method;
// }

export interface BridgeParams<
  Resolve = any,
  Mids extends ReadonlyArray<BridgeHandler> = never,
  Meth extends Method = 'POST',
  Body extends DataParser<Record<any, any>> = never,
  Parameters extends DataParser<Record<any, any>> = never,
  Headers extends DataParser<Record<any, any>> = never,
> {
  resolve: Resolve;
  middlewares?: Mids;
  method?: Meth;
  body?: Body /** Can't have a body with GET method or with files, an error is throw if ther developer tries to, but the type here doesnt block to keep a clean UI */;
  parameters?: Parameters;
  headers?: Headers;
  description?: BridgeHandlerDocumentation;
}

export type CreateHandler = <
  Resolve extends (p: {
    [key in KeysWithValNotEmptyObject<{
      mid: MidsReturnsIntersection<Mids> extends never ? {} : MidsReturnsIntersection<Mids>;
      body: (InferDataParser<Body> extends never ? {} : InferDataParser<Body>) &
        (MidsParams<Mids>['body'] extends never ? {} : MidsParams<Mids>['body']);
      parameters: (InferDataParser<Parameters> extends never ? {} : InferDataParser<Parameters>) &
        (MidsParams<Mids>['parameters'] extends never ? {} : MidsParams<Mids>['parameters']);
      headers: (InferDataParser<Headers> extends never ? {} : InferDataParser<Headers>) &
        (MidsParams<Mids>['headers'] extends never ? {} : MidsParams<Mids>['headers']);
      //   file: File extends ['BridgeFilesDoNotExists']
      //     ? {}
      //     : File extends 'any'
      //     ? { [key: string]: formidable.File }
      //     : { [key in File[number]]: formidable.File };
    }> &
      keyof {
        mid: MidsReturnsIntersection<Mids> extends never ? {} : MidsReturnsIntersection<Mids>;
        body: (InferDataParser<Body> extends never ? {} : InferDataParser<Body>) &
          (MidsParams<Mids>['body'] extends never ? {} : MidsParams<Mids>['body']);
        query: (InferDataParser<Parameters> extends never ? {} : InferDataParser<Parameters>) &
          (MidsParams<Mids>['parameters'] extends never ? {} : MidsParams<Mids>['parameters']);
        headers: (InferDataParser<Headers> extends never ? {} : InferDataParser<Headers>) &
          (MidsParams<Mids>['headers'] extends never ? {} : MidsParams<Mids>['headers']);
        // file: File extends ['BridgeFilesDoNotExists']
        //   ? {}
        //   : File extends 'any'
        //   ? { [key: string]: formidable.File }
        //   : { [key in File[number]]: formidable.File };
      }]: {
      mid: MidsReturnsIntersection<Mids> extends never ? {} : MidsReturnsIntersection<Mids>;
      body: (InferDataParser<Body> extends never ? {} : InferDataParser<Body>) &
        (MidsParams<Mids>['body'] extends never ? {} : MidsParams<Mids>['body']);
      query: (InferDataParser<Parameters> extends never ? {} : InferDataParser<Parameters>) &
        (MidsParams<Mids>['parameters'] extends never ? {} : MidsParams<Mids>['parameters']);
      headers: (InferDataParser<Headers> extends never ? {} : InferDataParser<Headers>) &
        (MidsParams<Mids>['headers'] extends never ? {} : MidsParams<Mids>['headers']);
      //   file: File extends ['BridgeFilesDoNotExists']
      //     ? {}
      //     : File extends 'any'
      //     ? { [key: string]: formidable.File }
      //     : { [key in File[number]]: formidable.File };
    }[key];
  }) => Res,
  Res,
  Body extends DataParser<Record<any, any>> = never,
  Parameters extends DataParser<Record<string, any>> = never,
  Headers extends DataParser<Record<string, any>> = never,
  //   File extends FilesConfig = ['BridgeFilesDoNotExists'],
  Mids extends ReadonlyArray<BridgeHandler> = never,
  Meth extends Method = 'POST',
>(
  p: BridgeParams<Resolve, Mids, Meth, Body, Parameters, Headers>,
) => BridgeHandler<Resolve, Mids>;

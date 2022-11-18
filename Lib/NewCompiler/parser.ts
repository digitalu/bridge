import * as ts from 'typescript';
// import prettier from 'prettier';
import fs from 'fs';
import { createClearRoutes, BridgeRoutes, ClearRoutes, isBridgeHandler, Method, writeFile } from '../index';
import { ConstructType, cleanConstructType, createConstructType } from './constructType';

const { log } = console;

export type BridgeApi = {
  [routeName: string]:
    | BridgeApi
    | {
        method: Method;
        description?: string;
        body?: ConstructType;
        query?: ConstructType;
        headers?: ConstructType;
        files?: ConstructType;
        return?: ConstructType;
      };
};

const createBridgeApi = (
  routes: ClearRoutes,
  tsSourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  path: string[]
): BridgeApi => {
  const bridgeApi: BridgeApi = {};

  for (const [key, value] of Object.entries(routes)) {
    if (isBridgeHandler(value))
      ts.forEachChild(tsSourceFile, (node) => {
        if (ts.isTypeAliasDeclaration(node) && node.name.escapedText === [...path, key].join('_')) {
          const mainObjectType = checker.getTypeAtLocation(node.name);

          const constructType = cleanConstructType(createConstructType(checker.typeToString(mainObjectType)));

          let filesConstructType: undefined | ConstructType;

          if (!value.filesConfig) filesConstructType = undefined;
          else if (value.filesConfig === 'any')
            filesConstructType = { object: { ANYSTRING: { primitive: 'File', optional: false } } };
          else {
            filesConstructType = { object: {} };
            value.filesConfig.forEach((fileName) => {
              (filesConstructType as any)['object'][fileName] = { primitive: 'File', optional: false };
            });
          }

          bridgeApi[key] = {
            method: value.method || 'POST',
            description: value.description,
            body: value.bodySchema ? (constructType as any)['object']['body'] : undefined,
            headers: value.headersSchema ? (constructType as any)['object']['headers'] : undefined,
            query: value.querySchema ? (constructType as any)['object']['query'] : undefined,
            files: filesConstructType,
            return: (constructType as any)['object']['return'],
          };
        }
      });
    else bridgeApi[key] = createBridgeApi(value, tsSourceFile, checker, [...path, key]);
  }

  return bridgeApi;
};

export const compile = (routes: BridgeRoutes) => {
  const clearRoutes = createClearRoutes(routes);

  const files: string[] = ['./tempTypesFileJBFsdjhgJBYTF.ts'];
  const program: ts.Program = ts.createProgram(files, {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    strict: true,
    noErrorTruncation: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
  });
  const checker: ts.TypeChecker = program.getTypeChecker();

  const myComponentSourceFile = program.getSourceFile(files[0])!;

  if (myComponentSourceFile) {
    const bridgeAPI = createBridgeApi(clearRoutes, myComponentSourceFile, checker, []);
    writeFile('BRIDGE_SDK_API', JSON.stringify(bridgeAPI), 'json');
  }
};

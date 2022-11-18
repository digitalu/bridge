import { BridgeRoutes, ClearRoutes, writeFile, removeFile, isBridgeHandler, createClearRoutes } from '../index';
import { compile } from './parser';
import fs from 'fs';

let pathToSourceFile = '';
let tempTypesFile = '';

const createTempFileWithTypes = (routes: ClearRoutes, path: string[]) => {
  Object.entries(routes).forEach(([key, value]) => {
    if (isBridgeHandler(value))
      tempTypesFile += `export type ${[...path, key].join('_')} = SDKTypes['${path[0]}']['${key}']\n`;
    else createTempFileWithTypes(value, [...path, key]);
  });
};

export const complieBridgeJSONSDK = (routes: BridgeRoutes) => {
  if (!fs.existsSync('bridge.config.json')) throw new Error('Try to compile with the create create-bridge-sdk instead.');

  const cfg = JSON.parse(fs.readFileSync('bridge.config.json', 'utf-8'));

  pathToSourceFile = cfg.pathToSourceFile;
  tempTypesFile += `import { SDKTypes } from "${pathToSourceFile.replace('.ts', '')}"\n\n`;

  console.log('AHH');

  const clearRoutes = createClearRoutes(routes);

  createTempFileWithTypes(clearRoutes, []);

  writeFile('./tempTypesFileJBFsdjhgJBYTF', tempTypesFile, 'ts');

  compile(routes);

  removeFile('./tempTypesFileJBFsdjhgJBYTF.ts');

  process.exit(0);
};

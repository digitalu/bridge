import { createClearRoutes, BridgeRoutes, ClearRoutes } from '../Routes';
import { writeFile, isController, isBridgeHandler } from '../Utilities';
import fs from 'fs';

let pathToSourceFile = '';
let tempTypesFile = '';

const createTempFileWithTypes = (routes: ClearRoutes, path: string[]) => {
  Object.entries(routes).forEach(([key, value]) => {
    if (isBridgeHandler(value)) {
      tempTypesFile += `export type ${path.join('_')} = SDKTypes[${path[0]}][${key}]\n`;
    }
  });
};

export const neoCompile = (routes: BridgeRoutes) => {
  if (!fs.existsSync('bridge.config.json')) throw new Error('Try to compile with the create create-bridge-sdk instead.');

  const cfg = JSON.parse(fs.readFileSync('bridge.config.json', 'utf-8'));

  pathToSourceFile = cfg.pathToSourceFile;
  tempTypesFile += `import { SDKTypes } from "${pathToSourceFile}"\n\n`;

  const clearRoutes = createClearRoutes(routes);

  createTempFileWithTypes(clearRoutes, []);

  writeFile('./tempTypesFile', tempTypesFile, 'ts');

  process.exit(0);
};

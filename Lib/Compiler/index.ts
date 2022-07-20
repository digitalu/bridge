import { compileSDK } from './compileSDK';
import { BridgeRoutes } from '../Routes';
import { writeFile } from './fs';
import fs from 'fs';
import { fetchFile } from './fetchFile';

export const compile = (routes: BridgeRoutes) => {
  if (!fs.existsSync('bridge.config.json')) throw new Error('Try to compile with the create create-bridge-sdk instead.');

  const cfg = JSON.parse(fs.readFileSync('bridge.config.json', 'utf-8'));

  writeFile(`${cfg.sdkLocation}/fetchBridge`, fetchFile);

  compileSDK(routes, cfg.sdkLocation, cfg.pathToSourceFile, 'SDKTypes');

  process.exit(0);
};

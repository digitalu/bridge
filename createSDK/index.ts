import fs from 'fs';
import { execSync } from 'child_process';
import { copyTypesAndMinify } from './copyModuleTypes';
import { createOrUpdateBridgeConfigFile } from './createConfigFile';

const createDtsFolderCommand = (tsConfigLocation: string, sdkLocation: string) =>
  `npx tsc -p ${tsConfigLocation} --declaration --emitDeclarationOnly --rootDir ./ --outDir ${sdkLocation}`;

const runCommand = (command: string) => {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    return false;
  }
  return true;
};

if (!fs.existsSync('bridge.config.json')) {
  throw new Error('CLI not ready, create yourself the bridge.config.json file.');
  createOrUpdateBridgeConfigFile();
  throw new Error('No Config');
}

// READ THE CONFIG BRIDGE FILE
const cfg = JSON.parse(fs.readFileSync('bridge.config.json', 'utf-8'));

// DELETE SDK BEFORE RECREATING IT IF EXISTS
if (fs.existsSync(cfg.sdkLocation)) fs.rmSync(cfg.sdkLocation, { recursive: true });

console.log('Compiling...');

// CREATE DTS FROM PROJECT CODE IN THE SDK
runCommand(createDtsFolderCommand(cfg.tsConfigLocation, `${cfg.sdkLocation}/dts`));

// COPYING TYPES FROM NODE_MODULES AND MINFYING THEM
copyTypesAndMinify(cfg.sdkLocation);

// RUN THE PROJECT TO COMPILE THE BRIDGE SDK
runCommand(`npx ts-node ${cfg.pathToSourceFile} -compileBridgeSDK`);

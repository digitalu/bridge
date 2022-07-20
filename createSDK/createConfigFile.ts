import readlineSync from 'readline-sync';
import fs from 'fs';
/*
 *  If ! bridge.config.json
 *
 *  1. Ask for tsConfig location (enter for default: "./tsconfig.json")
 *
 *  SI crash après, faut déjà avoir créer le bridge.config.json
 *
    2. Where do u want to output your SDK code folder (default: "./sdk")
    --> If folder already exists, ask for confirmation (because it will overwrite current folder)

    3. Give the location where you have exported your SDKTypes type (see more infos on the documentation (hyperlink))
    --> Tu check si tu retrouves \export type SDKTypes\ dans ce file
    --> Si pas, tu dis "SDKTypes not find in {{location}}", see how to export your SDKTypes --> documentation

*/

type BridgeConfig = {
  tsConfigLocation?: string;
  sdkLocation?: string;
  typeLocation?: string;
};

export const createOrUpdateBridgeConfigFile = (initialCfg: BridgeConfig = {}) => {
  const cfg = { tsConfigLocation: './tsconfig.json', sdkLocation: './sdk', typeLocation: './index.ts', ...initialCfg };

  const messages = {
    noBridgeFileDetected: '> ❌ No Bridge config file detected \n',
    noTSConfigFileDetected: '> ❌ No TS Config file detected \n',
    noSDKTypeFileDetected:
      '> ❌ The file containing your SDKType was not found, please create your SDKType. \n To know more about SDKType, check the documentation at https://bridgets.co/docs \n',
    noSDKTypeDetectedInFile:
      '> ❌ No SDKType found in the file provided \n To know more about SDKType, check the documentation at https://bridgets.co/docs \n',
    askForBridgeFileCreation: '> Do you want to create a Bridge config file ? (y) ',
    askForTSConfigLocation: `\n> Please provide the path to your tsconfig.json: (${cfg?.tsConfigLocation})`,
    askForTypeLocation: `\n> Please provide the path to the file containing your SDKFile: (${cfg?.typeLocation}) `,
    askForSdkLocation: `\n> Please provide the path to the desired output sdk location: (${cfg?.sdkLocation}) `,
    filesExistsAtLocation: `\n> The folder of the output sdk already exists. `,
    askForOverwriting: `\n> Do you want to overwrite the folder? (y) `,
    folderAlreadyExists: `\n> The folder of the sdk location already exists `,
    bridgeConfigFileCreated:
      '\n> ✅ The Bridge Config has successfully been created. \n>    You can change the config anytime in the bridge.config.json file. \n\n',
  };

  console.log(messages.bridgeConfigFileCreated);

  console.log(messages.noBridgeFileDetected);
  const create = readlineSync.question(messages.askForBridgeFileCreation);
  if (!create.includes('y') && create) throw new Error(messages.noBridgeFileDetected);

  const tsConfigLocation = readlineSync.question(messages.askForTSConfigLocation) || cfg.tsConfigLocation;
  if (!fs.existsSync(tsConfigLocation)) throw new Error(messages.noTSConfigFileDetected);
  cfg.tsConfigLocation = tsConfigLocation;
  fs.writeFileSync('./bridge.config.json', JSON.stringify({ tsConfigLocation: cfg.tsConfigLocation }));

  const SdkLocation = readlineSync.question(messages.askForSdkLocation) || cfg.sdkLocation;
  if (fs.existsSync(SdkLocation)) {
    console.log(messages.filesExistsAtLocation);
    const overwrite = readlineSync.question(messages.askForOverwriting);
    if (!overwrite.includes('y') && overwrite) throw new Error(messages.folderAlreadyExists);
  }

  cfg.sdkLocation = SdkLocation;
  fs.writeFileSync('./bridge.config.json', JSON.stringify({ ...cfg, typeLocation: undefined }));

  const typeLocation = readlineSync.question(messages.askForTypeLocation) || cfg.typeLocation;
  if (!fs.existsSync(typeLocation)) throw new Error(messages.noSDKTypeFileDetected);
  if (!fs.readFileSync(typeLocation).includes('export type SDKType')) throw new Error(messages.noSDKTypeDetectedInFile);
  cfg.typeLocation = typeLocation;
  fs.writeFileSync('./bridge.config.json', JSON.stringify({ typeLocation: cfg.typeLocation }));

  console.log(messages.bridgeConfigFileCreated);
  process.exit(1);
};

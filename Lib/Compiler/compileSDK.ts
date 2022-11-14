import { BridgeRoutes } from '../Routes';
import { isController, pathArrayToPath, upperCaseFirstLetterOnly } from '../Utilities';
import { removeFolder, createFolder, writeFile } from '../Utilities/fs';
import { writeController } from './writeControllers';

let API: any;
let APIImports = '';
let controllers: Record<string, number> = {};

export const compileSDK = (routes: BridgeRoutes, sdkLocation: string, typeLocation: string, sdkTypeName: string) => {
  API = { ...routes };
  visiteRoutes(routes, [], sdkLocation, typeLocation, sdkTypeName);

  // WRITE A CODE TO PRETTIER THAT OBJECT
  let APIFile =
    "import { Fetch } from './fetchBridge'\n\n" +
    APIImports +
    '\n' +
    `export const API = ${JSON.stringify(API).replaceAll(`)"`, `)`).replaceAll(`:"newBridgeControllerClient`, `:new`)}`;

  writeFile(`${sdkLocation}/index`, APIFile);
};

const visiteRoutes = (
  routes: BridgeRoutes,
  pathArray: string[],
  sdkLocation: string,
  typeLocation: string,
  sdkTypeName: string
) => {
  Object.entries(routes).forEach(([name, subRouteOrController]) => {
    if (isController(subRouteOrController)) {
      console.log(subRouteOrController.constructor.name);
      writeController(subRouteOrController, [...pathArray, name], sdkLocation, typeLocation, sdkTypeName);

      let ctrlName: string;
      if (controllers[subRouteOrController.constructor.name]) {
        controllers[subRouteOrController.constructor.name];
        ctrlName =
          subRouteOrController.constructor.name + (controllers[subRouteOrController.constructor.name] + 1).toString();
        controllers[subRouteOrController.constructor.name] += 1;
        APIImports += `import { ${subRouteOrController.constructor.name} as ${ctrlName} } from '${pathArrayToPath(
          [...pathArray, name],
          '.'
        )}';\n`;
      } else {
        ctrlName = subRouteOrController.constructor.name;
        APIImports += `import { ${ctrlName} } from '${pathArrayToPath([...pathArray, name], '.')}';\n`;
        controllers[subRouteOrController.constructor.name] = 1;
      }

      const APIchild = getElemFromObjectWithPathArray(API, pathArray);
      APIchild[name] = `newBridgeControllerClient ${ctrlName}(Fetch)`;
    } else {
      createFolder(pathArrayToPath([...pathArray, name], sdkLocation));
      visiteRoutes(subRouteOrController, [...pathArray, name], sdkLocation, typeLocation, sdkTypeName);
    }
  });
};

const getElemFromObjectWithPathArray = (object: any, path: string[]): any => {
  if (path.length === 0) return object;
  else return getElemFromObjectWithPathArray(object[path[0]], path.slice(1));
};

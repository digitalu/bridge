import { ControllerI } from '../Controller';
import { BridgeHandler } from '../Handler';
import { isController, isBridgeHandler, getParamsObjectString, pathArrayToPath } from '../Utilities';
import { createFolder, writeFile } from './fs';
import zodToJsonSchema from 'zod-to-json-schema';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import { isZodParser } from '../Handler/Validators/dataValidator';

const hasHeaders = (handler: BridgeHandler) => {
  if (handler.headersSchema) return true;
  if (handler.middlewares) for (const mid of handler.middlewares) if (hasHeaders(mid)) return true;
  return false;
};

const hasBody = (handler: BridgeHandler) => {
  if (handler.bodySchema) return true;
  if (handler.middlewares) for (const mid of handler.middlewares) if (hasBody(mid)) return true;
  return false;
};

const hasQuery = (handler: BridgeHandler) => {
  if (handler.querySchema) return true;
  if (handler.middlewares) for (const mid of handler.middlewares) if (hasQuery(mid)) return true;
  return false;
};

export const writeController = (
  controller: ControllerI,
  pathArray: string[],
  sdkLocation: string,
  typeLocation: string,
  sdkTypeName: string
): void => {
  const controllersInside: Array<[string, ControllerI]> = [];

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // IMPORTS & CLASS TYPE
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  Object.entries(controller).forEach(([name, controller]) => {
    if (!isController(controller)) return;
    controllersInside.push([name, controller]);
  });

  // writing the import of type from dts file
  // It handles index files and first stage file

  let file = `import { ${sdkTypeName} } from '${
    controllersInside.length === 0 && pathArray.length === 1
      ? './'
      : '../'.repeat(controllersInside.length !== 0 ? pathArray.length : pathArray.length - 1)
  }dts/${typeLocation.replace('.ts', '').replace(/^.\//, '')}';\n`;

  // HAVE TO CHECK IF ZOD NEEDED
  file += `import { z } from 'zod';\n`;

  file += '\n';

  if (controllersInside.length !== 0) {
    createFolder(pathArrayToPath(pathArray, sdkLocation));
    controllersInside.forEach(([ctrlName, ctrl]) => {
      file += `import { ${ctrl.constructor.name} } from './${ctrlName.toLocaleLowerCase()}';\n`;
      writeController(ctrl, [...pathArray, ctrlName], sdkLocation, typeLocation, sdkTypeName);
    });
    file += '\n';
  }

  const className = (controller as any).constructor.name;
  const typeVar = className + 'T';

  file += `type ${typeVar} = ${sdkTypeName}${pathArray.map((p) => `['${p}']`).reduce((a, b) => a + b)};\n\n`;

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // EXPORT CLASS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  file += `export class ${className} {\n`;
  controllersInside.forEach(([ctrlName, ctrl]) => {
    file += `  public ${ctrlName.toLocaleLowerCase()}: ${ctrl.constructor.name};\n`;
  });
  file += `  constructor(private Fetch: any) {`;

  if (controllersInside.length === 0) file += '}\n';
  else {
    file += '\n';
    controllersInside.forEach(([ctrlName, ctrl]) => {
      file += `    this.${ctrlName.toLocaleLowerCase()} = new ${ctrl.constructor.name}(this.Fetch);\n`;
    });
    file += '  }\n';
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ZOD OBBJECTS IF ANY
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const zodObjects: Record<string, Record<string, string>> = {};

  Object.entries(controller).forEach(([name, handler]) => {
    if (!isBridgeHandler(handler)) return;

    if (isZodParser(handler.bodySchema) || isZodParser(handler.querySchema) || isZodParser(handler.headersSchema))
      zodObjects[name] = {};
    else return;

    try {
      if (isZodParser(handler.bodySchema))
        zodObjects[name].body = jsonSchemaToZod(zodToJsonSchema(handler.bodySchema as any) as any, 'zodObject', false)
          .replace('const zodObject = ', '')
          .slice(0, -2);

      if (isZodParser(handler.querySchema))
        zodObjects[name].query = jsonSchemaToZod(zodToJsonSchema(handler.querySchema as any) as any, 'zodObject', false)
          .replace('const zodObject = ', '')
          .slice(0, -2);

      if (isZodParser(handler.headersSchema))
        zodObjects[name].query = jsonSchemaToZod(zodToJsonSchema(handler.headersSchema as any) as any, 'zodObject', false)
          .replace('const zodObject = ', '')
          .slice(0, -2);
    } catch (err) {
      console.log('Error in zod compilation');
    }
  });

  if (Object.keys(zodObjects).length > 0) {
    file += '\n  public zodSchemas = {\n';

    Object.entries(zodObjects).forEach(([name, z]) => {
      file += `    ${name}: {\n`;

      Object.entries(z).forEach(([type, zodString]) => {
        file += `      ${type}: ${zodString},\n`;
      });
      file += '    },\n';
    });
    file += '  };\n';
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  Object.entries(controller).forEach(([name, handler]) => {
    if (!isBridgeHandler(handler)) return;

    if (handler.description) file += `\n  /** ${handler.description}*/`;

    const paramsString = [];
    if (hasBody(handler)) paramsString.push(`body: ${typeVar}['${name}']['body']`);
    if (hasQuery(handler)) paramsString.push(`query: ${typeVar}['${name}']['query']`);
    if (hasHeaders(handler)) paramsString.push(`headers: ${typeVar}['${name}']['headers']`);
    if (handler.filesConfig) {
      if (handler.filesConfig === 'any') paramsString.push('files: Record<string, File>');
      else
        paramsString.push(
          `files: {${handler.filesConfig
            .map((f) => ` ${f}: File;`)
            .reduce((a, b) => a + b)
            .slice(0, -1)} }`,
          ''
        );
    }
    const hasParams = paramsString.length > 0;

    file += `\n  public ${name} = (${
      hasParams ? `p: ${getParamsObjectString(paramsString)}` : ''
    }): Promise<${typeVar}['${name}']['return']> => {\n    return this.Fetch({ path: '${[...pathArray, name]
      .map((p) => `/${p}`)
      .reduce((a, b) => a + b)}', method: '${handler.method || 'POST'}'${hasParams ? ', ...p ' : ''}});\n  };\n`;
  });

  file += `}\n`;
  writeFile(
    controllersInside.length !== 0
      ? pathArrayToPath([...pathArray, 'index'], sdkLocation)
      : pathArrayToPath(pathArray, sdkLocation),
    file
  );
};

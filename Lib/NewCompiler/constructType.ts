export type ConstructType =
  | PrimitiveType
  | { union: ConstructType[] }
  | { intersection: ConstructType[] }
  | { array: ConstructType }
  | { arrayWithPos: ConstructType[] }
  | { object: ConstructTypeObject };

export type ConstructTypeObject = {
  [key: string]: ConstructType & { optional: boolean };
};

const primitives = ['string', 'boolean', 'number', 'Date', 'File', 'any', 'undefined', 'null', 'unknown'] as const;

export type PrimitiveType = {
  primitive: typeof primitives[number];
  value?: string | number | boolean;
};

const getUnionElementList = (stringType: string): string[] => {
  const elements: string[] = [''];
  let elementNbr = 0;

  let braceStage = 0;
  let parentheseStage = 0;

  for (let index = 0; index < stringType.length; index++) {
    const char = stringType[index];
    elements[elementNbr] += char;

    if (char === '{') braceStage++;
    else if (char === '}') braceStage--;
    else if (char === '(') parentheseStage++;
    else if (char === ')') parentheseStage--;

    if (braceStage === 0 && parentheseStage === 0) {
      const threeFollowingChars = stringType.substring(index + 1, index + 4);

      if (threeFollowingChars == ' | ') {
        if (elements[elementNbr].slice(-2) === '})')
          elements[elementNbr] = elements[elementNbr].substring(1, elements[elementNbr].length - 1);

        elements.push('');
        elementNbr++;
        index += 3;
      }
    }
  }

  return elements;
};

// Only for arrays like this: [string, number]
const getArrayElementList = (stringType: string): string[] => {
  const elements: string[] = [''];
  let elementNbr = 0;

  let braceStage = 0;
  let parentheseStage = 0;

  for (let index = 0; index < stringType.length; index++) {
    const char = stringType[index];
    elements[elementNbr] += char;

    if (char === '{') braceStage++;
    else if (char === '}') braceStage--;
    else if (char === '(') parentheseStage++;
    else if (char === ')') parentheseStage--;

    if (braceStage === 0 && parentheseStage === 0) {
      const twoFollowingChars = stringType.substring(index + 1, index + 3);

      if (twoFollowingChars == ', ') {
        elements.push('');
        elementNbr++;
        index += 2;
      }
    }
  }

  return elements;
};

const mergeErrorUnionObjects = (constructType: ConstructType): ConstructType => {
  if ('object' in constructType) {
    const newConstructType: ConstructType = { object: {} };
    Object.entries(constructType.object).forEach(([key, value]) => {
      newConstructType.object[key] = { ...mergeErrorUnionObjects(value), optional: value.optional };
    });

    return newConstructType;
  }
  if (!('union' in constructType)) return constructType;

  const newConstructType: ConstructType = { union: [] };
  let hasErrors: boolean = false;
  const errorUnion: ConstructType = { union: [] };

  for (const unionElem of constructType.union)
    if ('object' in unionElem && 'error' in unionElem.object && 'object' in unionElem.object.error) {
      errorUnion.union.push({ object: unionElem.object.error.object });
      hasErrors = true;
    } else newConstructType.union.push(unionElem);

  if (!hasErrors) return constructType;

  newConstructType.union.push({ object: { error: { optional: false, ...errorUnion } } });

  return newConstructType;
};

const transformUndefinedUnionToOptional = (constructType: ConstructType): ConstructType => {
  if ('union' in constructType)
    return { union: constructType.union.map((unionElem) => transformUndefinedUnionToOptional(unionElem)) };
  else if ('intersection' in constructType)
    return {
      intersection: constructType.intersection.map((intersectionElem) =>
        transformUndefinedUnionToOptional(intersectionElem)
      ),
    };
  else if ('array' in constructType) return { array: transformUndefinedUnionToOptional(constructType) };
  else if ('arrayWithPos' in constructType)
    return { arrayWithPos: constructType.arrayWithPos.map((arrElem) => transformUndefinedUnionToOptional(arrElem)) };
  else if ('primitive' in constructType) return constructType;

  const newConstructTypeObject: ConstructTypeObject = {};
  for (const [key, value] of Object.entries(constructType.object)) {
    let optional: boolean = value.optional;
    if ('union' in value) {
      const newUnion: ConstructType = { union: [] };

      for (const unionElem of value.union) {
        if ('primitive' in unionElem && unionElem.primitive === 'undefined') optional = true;
        else newUnion.union.push(unionElem);
      }

      if (newUnion.union.length === 1) newConstructTypeObject[key] = { optional, ...newUnion.union[0] };
      else newConstructTypeObject[key] = { optional, ...newUnion };
    } else newConstructTypeObject[key] = value;
  }

  return { object: newConstructTypeObject };
};

export const cleanConstructType = (constructType: ConstructType): ConstructType =>
  transformUndefinedUnionToOptional(mergeErrorUnionObjects(constructType));

// Only applicable to Bridge generated types
export const createConstructType = (stringType: string): ConstructType => {
  // log(stringType);

  let constructType: ConstructType = { object: {} };

  const unionElements = getUnionElementList(stringType);

  if (unionElements.length > 1) return { union: unionElements.map((stringType) => createConstructType(stringType)) };

  if (stringType[0] === '[' && stringType[stringType.length - 1] === ']')
    return {
      arrayWithPos: getArrayElementList(stringType.substring(1, stringType.length - 1)).map((arrElem) =>
        createConstructType(arrElem)
      ),
    };
  else if (stringType.slice(-3) === '[];')
    return { array: createConstructType(stringType.substring(0, stringType.length - 3)) };
  else if (stringType.slice(-3) === ')[]' && stringType.substring(0, 1) === '(')
    return { array: createConstructType(stringType.substring(1, stringType.length - 3)) };
  else if (stringType.slice(-2) === '[]')
    return { array: createConstructType(stringType.substring(0, stringType.length - 2)) };
  else if (primitives.includes(stringType as any)) return { primitive: stringType as any };
  else if (stringType === 'true') return { primitive: 'boolean', value: true };
  else if (stringType === 'false') return { primitive: 'boolean', value: false };
  if (
    stringType[0] === `"` &&
    stringType[stringType.length - 1] === `"` &&
    !stringType.substring(1, stringType.length - 1).includes(`"`)
  )
    return { primitive: 'string', value: stringType.substring(1, stringType.length - 1) };
  else if (!isNaN(parseFloat(stringType))) return { primitive: 'number', value: parseFloat(stringType) };
  else if (stringType[0] === '{') {
    constructType['object'] = {};

    let key = '';
    let optional: boolean = false;
    for (let index = 2; index < stringType.length; index++) {
      // Intersected object, we can merge them
      if (stringType.substring(index, index + 5) === '} & {') {
        index += 5;
        continue;
      }

      const char = stringType[index];
      if (char === '?') optional = true;
      else if (char === ':') {
        let stringValue = '';
        let braceStage = 0;
        let parentheseStage = 0;

        for (let id = index + 2; id < stringType.length; id++) {
          if (stringType[id] === '{') braceStage++;
          else if (stringType[id] === '}') braceStage--;
          else if (stringType[id] === '(') parentheseStage++;
          else if (stringType[id] === ')') parentheseStage--;

          if (stringType[id] === ';' && braceStage === 0 && parentheseStage === 0) {
            index = id + 1;

            constructType.object[key] = { ...createConstructType(stringValue), optional };
            key = '';
            break;
          }

          stringValue += stringType[id];
        }
        optional = false;
      } else if (char === '"') {
      } else key += char;
    }
  }

  return constructType;
};

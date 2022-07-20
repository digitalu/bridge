import { errorStatus, ErrorStatus } from './status';

export const httpError = <Type extends keyof ErrorStatus, Name extends string, Data>(
  type: Type,
  name: Name,
  data?: Data
): { error: { name: Name; data?: Data; status: ErrorStatus[Type] } } => {
  return { error: { status: errorStatus[type], name, data } };
};

export * from './listener';
export * from './types';

import { errorStatus, ErrorStatus } from './status';

interface Error {
  name: string;
  status: number;
  data?: any;
}

export const isError = (error: any): error is Error =>
  typeof error === 'object' && typeof error.name === 'string' && typeof error.status === 'number';

export const httpError = <Type extends keyof ErrorStatus, Name extends string, Data>(
  type: Type,
  name: Name,
  data?: Data,
): { error: { name: Name; data?: any; status: ErrorStatus[Type] } } => {
  return { error: { status: errorStatus[type], name, data } };
};

export * from './listener';

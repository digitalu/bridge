import { BridgeHandler } from '../Handler';

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type KeysWithValNotNever<T> = keyof { [P in keyof T as T[P] extends never ? never : P]: P };

export type ExcludeNeverKeys<T> = { [key in KeysWithValNotNever<T> & keyof T]: T[key] };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MidsReturnsIntersection
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type Values<T> = T[keyof T];

type Unfoo<T> = T extends { foo: any } ? T['foo'] : never;

type RemoveError<T> = T extends { error: any } ? never : T;

type NFooWithoutError<T extends Readonly<BridgeHandler[]>> = {
  [K in keyof T]: T[K] extends BridgeHandler<(arg: any) => infer Output, any> ? { foo: RemoveError<Output> } : never;
};

type NFooWithoutErrorParams<T extends Readonly<BridgeHandler[]>> = {
  [K in keyof T]: T[K] extends BridgeHandler<(arg: infer Input) => any, any> ? { foo: RemoveError<Input> } : never;
};

export type MidsReturnsIntersection<T extends Readonly<any[]>> = Unfoo<UnionToIntersection<Values<NFooWithoutError<T>>>>;

export type MidsParams<T extends Readonly<any[]>> = Unfoo<UnionToIntersection<Values<NFooWithoutErrorParams<T>>>>;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APPLY --> Take an array and make it as const
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type UnionToOvlds<U> = UnionToIntersection<U extends any ? (f: U) => void : never>;

type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export type UnionToArray<T, A extends unknown[] = []> = IsUnion<T> extends true
  ? UnionToArray<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
  : [T, ...A];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BLA BLA
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// This utility lets T be indexed by any key
type Indexify<T> = T & { [str: string]: undefined };

// To make a type where all values are undefined, so that in AllUnionKeys<T>
// TS doesn't remove the keys whose values are incompatible, e.g. string & number
type UndefinedVals<T> = { [K in keyof T]: undefined };

// This returns a union of all keys present across all members of the union T
type AllUnionKeys<T> = keyof UnionToIntersection<UndefinedVals<T>>;

// Where the (rest of the) magic happens ✨
export type AllFields<T> = { [K in AllUnionKeys<T> & string]: Indexify<T>[K] };

// The source types
type A = { a: 'foo'; b: string; c: number };
type B = { a: 'bar'; b: boolean };

type Union = A | B;

type Result = AllFields<Union>;
/**
 * 🥳
 * type Result = {
 *   a: "foo" | "bar";
 *   b: string | boolean;
 *   c: number | undefined;
 * }
 */

type Test =
  | {
      error: { t: 8 };
    }
  | { t: 3 };

type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
let v: NoUndefinedField<Omit<AllFields<Test>, 't'>>;

// Magic as far as I'm concerned.
// Taken from https://stackoverflow.com/a/50375286/3229534
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// This utility lets T be indexed by any key
type Indexify<T> = T & { [str: string]: undefined };

// To make a type where all values are undefined, so that in AllUnionKeys<T>
// TS doesn't remove the keys whose values are incompatible, e.g. string & number
type UndefinedVals<T> = { [K in keyof T]: undefined };

// This returns a union of all keys present across all members of the union T
type AllUnionKeys<T> = keyof UnionToIntersection<UndefinedVals<T>>;

// Where the (rest of the) magic happens ✨
type AllFields<T> = { [K in AllUnionKeys<T> & string]: Indexify<T>[K] };

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

// v.error.t

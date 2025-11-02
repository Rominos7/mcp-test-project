# TypeScript Expert Skill

You are now equipped with comprehensive knowledge of **TypeScript 5.x advanced features**, type system mastery, generics, utility types, decorators, type guards, strict mode configuration, and production-ready TypeScript development patterns.

Use this expertise when working with TypeScript codebases, designing type-safe APIs, implementing advanced type patterns, optimizing compiler configuration, and ensuring code quality through the type system.

---

## 📋 Table of Contents

1. [TypeScript Fundamentals](#typescript-fundamentals)
2. [tsconfig.json Configuration](#tsconfigjson-configuration)
3. [Type System Deep Dive](#type-system-deep-dive)
4. [Advanced Generics](#advanced-generics)
5. [Utility Types & Type Manipulation](#utility-types--type-manipulation)
6. [Type Guards & Narrowing](#type-guards--narrowing)
7. [Discriminated Unions](#discriminated-unions)
8. [Conditional Types](#conditional-types)
9. [Mapped Types](#mapped-types)
10. [Template Literal Types](#template-literal-types)
11. [Decorators & Metadata](#decorators--metadata)
12. [Type Inference & Type Assertions](#type-inference--type-assertions)
13. [Error Handling Patterns](#error-handling-patterns)
14. [Performance Optimization](#performance-optimization)
15. [Common Patterns & Anti-Patterns](#common-patterns--anti-patterns)

---

## TypeScript Fundamentals

### Why TypeScript in 2025?

**Key Benefits:**
- **Static Type Safety**: Catch errors at compile-time, not runtime
- **Enhanced IDE Support**: Autocomplete, refactoring, navigation
- **Self-Documenting Code**: Types serve as inline documentation
- **Safer Refactoring**: Compiler catches breaking changes
- **Better Tooling**: Integration with modern build tools and frameworks

**2025 Trends:**
- Full ESM (ECMAScript Modules) adoption
- Stage 3 decorators (standard, not experimental)
- Advanced type inference improvements
- Better performance with incremental compilation

### Basic Type Annotations

```typescript
// Primitive types
let name: string = "Alice";
let age: number = 30;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Arrays
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Tuples
let pair: [string, number] = ["Alice", 30];
let tuple: [string, number, boolean] = ["Bob", 25, true];

// Objects
let user: { name: string; age: number } = {
  name: "Alice",
  age: 30
};

// Functions
function add(a: number, b: number): number {
  return a + b;
}

const multiply = (a: number, b: number): number => a * b;

// Optional and default parameters
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

function fetch(url: string, options?: RequestInit): Promise<Response> {
  return window.fetch(url, options);
}
```

### Interfaces vs Types

```typescript
// Interface - extensible, for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Interface extension
interface Admin extends User {
  role: "admin";
  permissions: string[];
}

// Type alias - more flexible
type Point = {
  x: number;
  y: number;
};

// Type unions
type Status = "pending" | "approved" | "rejected";

// Type intersection
type AdminUser = User & {
  role: "admin";
  permissions: string[];
};

// ✅ Best Practice: Use interface for object shapes, type for unions/intersections
interface ApiResponse {
  data: unknown;
  status: number;
}

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

---

## tsconfig.json Configuration

### Strict Mode Configuration (2025 Recommended)

```json
{
  "compilerOptions": {
    // Language & Environment
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    // Strict Type-Checking Options (Enable All!)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,

    // Module Resolution
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,

    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "importHelpers": true,

    // Advanced
    "skipLibCheck": true,
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Understanding Strict Flags

```typescript
// ✅ noImplicitAny - No implicit 'any' types
// ❌ Bad
function process(data) { // Error: Parameter 'data' implicitly has an 'any' type
  return data;
}

// ✅ Good
function process(data: unknown) {
  return data;
}

// ✅ strictNullChecks - null/undefined must be explicitly handled
// ❌ Bad
let name: string = null; // Error with strictNullChecks

// ✅ Good
let name: string | null = null;

// ✅ strictFunctionTypes - Stricter function parameter checking
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// ❌ Bad (without strictFunctionTypes, this would be allowed)
let fn1: (animal: Animal) => void;
let fn2: (dog: Dog) => void;
fn1 = fn2; // Error with strictFunctionTypes - correct!

// ✅ noUncheckedIndexedAccess - Index signatures include undefined
interface StringArray {
  [key: string]: string;
}

const arr: StringArray = {};
const value = arr["key"]; // Type: string | undefined (with flag)

// ✅ exactOptionalPropertyTypes - Distinguish undefined from missing
interface User {
  name: string;
  age?: number;
}

const user: User = {
  name: "Alice",
  age: undefined // Error with exactOptionalPropertyTypes
};
```

### Performance Configuration

```json
{
  "compilerOptions": {
    // Incremental compilation
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo",

    // Skip type checking of declaration files
    "skipLibCheck": true,

    // Assume each file is a separate module
    "isolatedModules": true,

    // Use project references for monorepos
    "composite": true,
    "declaration": true
  }
}
```

---

## Type System Deep Dive

### Literal Types

```typescript
// String literals
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function request(url: string, method: HttpMethod) {
  // method can only be one of the four strings
}

// Numeric literals
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// as const for literal inference
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const;

// Type: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }

// ✅ Best Practice: Use as const for constant objects
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact"
} as const;

type RouteKeys = keyof typeof ROUTES; // "HOME" | "ABOUT" | "CONTACT"
type RouteValues = typeof ROUTES[RouteKeys]; // "/" | "/about" | "/contact"
```

### Union and Intersection Types

```typescript
// Union types (OR)
type StringOrNumber = string | number;

function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// Intersection types (AND)
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  name: string;
}

type TimestampedUser = User & Timestamped;

const user: TimestampedUser = {
  id: "1",
  name: "Alice",
  createdAt: new Date(),
  updatedAt: new Date()
};

// ✅ Complex unions with discriminants
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

### Index Signatures & Mapped Types

```typescript
// Index signature
interface StringMap {
  [key: string]: string;
}

const map: StringMap = {
  name: "Alice",
  role: "admin"
};

// Record utility type (preferred)
type UserRoles = Record<string, string>;

// Mapped type from keys
type Flags = {
  [K in "read" | "write" | "execute"]: boolean;
};

// Equivalent to:
// type Flags = {
//   read: boolean;
//   write: boolean;
//   execute: boolean;
// };
```

### Type Operators

```typescript
// typeof - Get type from value
const user = {
  id: "1",
  name: "Alice",
  age: 30
};

type User = typeof user; // { id: string; name: string; age: number }

// keyof - Get union of keys
type UserKeys = keyof User; // "id" | "name" | "age"

// in - Iterate over union
type Optional<T> = {
  [K in keyof T]?: T[K];
};

// extends - Conditional constraint
type NonNullable<T> = T extends null | undefined ? never : T;

// infer - Extract type from conditional
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Awaited - Extract Promise type
type AwaitedString = Awaited<Promise<string>>; // string
type AwaitedNested = Awaited<Promise<Promise<number>>>; // number
```

---

## Advanced Generics

### Generic Functions

```typescript
// Basic generic function
function identity<T>(value: T): T {
  return value;
}

const num = identity(42); // Type: number
const str = identity("hello"); // Type: string

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const result = pair("Alice", 30); // Type: [string, number]

// Generic constraints
interface HasLength {
  length: number;
}

function longest<T extends HasLength>(a: T, b: T): T {
  return a.length > b.length ? a : b;
}

longest("foo", "foobar"); // ✅
longest([1, 2], [1, 2, 3]); // ✅
longest(10, 20); // ❌ Error: number doesn't have length
```

### Generic Classes

```typescript
class GenericQueue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }
}

const numberQueue = new GenericQueue<number>();
numberQueue.enqueue(1);
numberQueue.enqueue(2);

const stringQueue = new GenericQueue<string>();
stringQueue.enqueue("hello");
```

### Advanced Generic Patterns

```typescript
// Default type parameters
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

createArray(3, 0); // number[]
createArray(3, "x"); // string[]
createArray<boolean>(3, true); // boolean[]

// Generic constraints with keyof
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Alice" };
getProperty(user, "name"); // ✅ Type: string
getProperty(user, "invalid"); // ❌ Error

// Variadic tuple types (TypeScript 4.0+)
type Cons<H, T extends readonly any[]> = [H, ...T];

type Strings = Cons<string, [string, string]>; // [string, string, string]

// Generic factory pattern
interface Constructor<T = {}> {
  new (...args: any[]): T;
}

function createInstance<T>(Ctor: Constructor<T>, ...args: any[]): T {
  return new Ctor(...args);
}

class User {
  constructor(public name: string) {}
}

const user = createInstance(User, "Alice"); // Type: User
```

### Inferred Generics

```typescript
// ✅ Good: Let TypeScript infer types
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

const numbers = [1, 2, 3];
const strings = map(numbers, (n) => n.toString()); // Inferred as string[]

// Generic inference from return type
function fromJSON<T>(json: string): T {
  return JSON.parse(json);
}

interface User {
  name: string;
  age: number;
}

const user = fromJSON<User>('{"name":"Alice","age":30}');

// Contextual typing
type EventHandler<T> = (event: T) => void;

const handleClick: EventHandler<MouseEvent> = (event) => {
  console.log(event.clientX); // event is inferred as MouseEvent
};
```

---

## Utility Types & Type Manipulation

### Built-in Utility Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: "admin" | "user";
}

// Partial<T> - Make all properties optional
type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string; age?: number; role?: "admin" | "user" }

// Required<T> - Make all properties required
type RequiredUser = Required<PartialUser>;

// Readonly<T> - Make all properties readonly
type ReadonlyUser = Readonly<User>;

// Pick<T, K> - Select subset of properties
type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit<T, K> - Remove properties
type UserWithoutEmail = Omit<User, "email">;
// { id: string; name: string; age: number; role: "admin" | "user" }

// Record<K, T> - Create object type with keys K and values T
type UserMap = Record<string, User>;
// { [key: string]: User }

// Exclude<T, U> - Remove types from union
type Role = "admin" | "user" | "guest";
type NonGuestRole = Exclude<Role, "guest">; // "admin" | "user"

// Extract<T, U> - Extract types from union
type AdminRole = Extract<Role, "admin">; // "admin"

// NonNullable<T> - Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// ReturnType<T> - Extract return type
function getUser(): User {
  return {} as User;
}
type UserReturn = ReturnType<typeof getUser>; // User

// Parameters<T> - Extract parameter types
type GetUserParams = Parameters<typeof getUser>; // []

// Awaited<T> - Unwrap Promise type
type UserPromise = Promise<User>;
type UnwrappedUser = Awaited<UserPromise>; // User
```

### Custom Utility Types

```typescript
// DeepPartial - Recursively make all properties optional
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Config {
  server: {
    host: string;
    port: number;
  };
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
    };
  };
}

const partialConfig: DeepPartial<Config> = {
  server: {
    port: 3000 // host is optional
  }
};

// DeepReadonly - Recursively make all properties readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Mutable - Remove readonly modifiers
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// NonEmptyArray - Array with at least one element
type NonEmptyArray<T> = [T, ...T[]];

function getFirst<T>(arr: NonEmptyArray<T>): T {
  return arr[0]; // Safe, guaranteed to exist
}

// ValueOf - Get union of all property values
type ValueOf<T> = T[keyof T];

type UserValues = ValueOf<User>; // string | number | "admin" | "user"

// Promisify - Convert function to return Promise
type Promisify<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

function syncAdd(a: number, b: number): number {
  return a + b;
}

type AsyncAdd = Promisify<typeof syncAdd>;
// (a: number, b: number) => Promise<number>

// UnionToIntersection - Convert union to intersection
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>;
// { a: string } & { b: number }
```

---

## Type Guards & Narrowing

### typeof Type Guards

```typescript
function padLeft(value: string, padding: string | number): string {
  if (typeof padding === "number") {
    // padding is narrowed to number
    return " ".repeat(padding) + value;
  }
  // padding is narrowed to string
  return padding + value;
}
```

### instanceof Type Guards

```typescript
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(error: Error | ApiError): void {
  if (error instanceof ApiError) {
    // error is narrowed to ApiError
    console.error(`API Error ${error.statusCode}: ${error.message}`);
  } else {
    // error is narrowed to Error
    console.error(`Error: ${error.message}`);
  }
}
```

### Custom Type Predicates

```typescript
// Type predicate function
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function processValue(value: unknown): void {
  if (isString(value)) {
    console.log(value.toUpperCase()); // value is string
  } else if (isNumber(value)) {
    console.log(value.toFixed(2)); // value is number
  }
}

// Complex type predicate
interface User {
  type: "user";
  name: string;
}

interface Admin {
  type: "admin";
  name: string;
  permissions: string[];
}

function isAdmin(user: User | Admin): user is Admin {
  return user.type === "admin";
}

function greet(user: User | Admin): void {
  if (isAdmin(user)) {
    console.log(`Admin ${user.name} has ${user.permissions.length} permissions`);
  } else {
    console.log(`User ${user.name}`);
  }
}
```

### Assertion Functions

```typescript
// Assertion function
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function processUser(user: unknown): void {
  assert(typeof user === "object" && user !== null);
  assert("name" in user && typeof user.name === "string");

  // TypeScript now knows user is { name: string } & object
  console.log(user.name.toUpperCase());
}

// Assertion with type predicate
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Value is not a string");
  }
}

function format(value: unknown): string {
  assertIsString(value);
  // value is now narrowed to string
  return value.toUpperCase();
}
```

### in Operator Narrowing

```typescript
interface Bird {
  type: "bird";
  fly(): void;
}

interface Fish {
  type: "fish";
  swim(): void;
}

function move(animal: Bird | Fish): void {
  if ("fly" in animal) {
    // animal is narrowed to Bird
    animal.fly();
  } else {
    // animal is narrowed to Fish
    animal.swim();
  }
}
```

---

## Discriminated Unions

### Basic Discriminated Unions

```typescript
// Common pattern: type + data
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>): T {
  if (result.success) {
    // result.data is accessible
    return result.data;
  } else {
    // result.error is accessible
    throw new Error(result.error);
  }
}

// API Response pattern
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function renderUserProfile(response: ApiResponse<User>) {
  switch (response.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `User: ${response.data.name}`;
    case "error":
      return `Error: ${response.error}`;
  }
}
```

### Advanced Discriminated Unions

```typescript
// Multiple discriminants
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default:
      // Exhaustiveness check
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${JSON.stringify(shape)}`);
  }
}

// Event system with discriminated unions
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string }
  | { type: "focus"; element: HTMLElement }
  | { type: "scroll"; scrollY: number };

function handleEvent(event: Event): void {
  switch (event.type) {
    case "click":
      console.log(`Clicked at (${event.x}, ${event.y})`);
      break;
    case "keypress":
      console.log(`Key pressed: ${event.key}`);
      break;
    case "focus":
      console.log(`Focused element: ${event.element.tagName}`);
      break;
    case "scroll":
      console.log(`Scrolled to ${event.scrollY}px`);
      break;
  }
}
```

### Exhaustiveness Checking

```typescript
type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status): string {
  switch (status) {
    case "pending":
      return "Awaiting approval";
    case "approved":
      return "Request approved";
    case "rejected":
      return "Request rejected";
    default:
      // If we add a new status and forget to handle it,
      // TypeScript will error here
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

// Helper function for exhaustiveness
function assertUnreachable(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

function process(value: "a" | "b"): void {
  switch (value) {
    case "a":
      console.log("A");
      break;
    case "b":
      console.log("B");
      break;
    default:
      assertUnreachable(value);
  }
}
```

---

## Conditional Types

### Basic Conditional Types

```typescript
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// NonNullable implementation
type NonNullable<T> = T extends null | undefined ? never : T;

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// Extract implementation
type Extract<T, U> = T extends U ? T : never;

type Nums = Extract<string | number | boolean, number | boolean>; // number | boolean
```

### Conditional Type Inference

```typescript
// infer keyword
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser(): User {
  return {} as User;
}

type UserType = ReturnType<typeof getUser>; // User

// Array element type
type ElementType<T> = T extends (infer U)[] ? U : never;

type StringArray = string[];
type Element = ElementType<StringArray>; // string

// Promise unwrapping
type Awaited<T> = T extends Promise<infer U> ? U : T;

type AsyncUser = Awaited<Promise<User>>; // User
type SyncUser = Awaited<User>; // User

// Nested Promise unwrapping (recursive)
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;

type NestedPromise = Promise<Promise<Promise<number>>>;
type Unwrapped = DeepAwaited<NestedPromise>; // number
```

### Distributive Conditional Types

```typescript
// Conditional types distribute over unions
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>;
// Equivalent to: string[] | number[] (distributed)

// Non-distributive version (wrap in tuple)
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type Combined = ToArrayNonDist<string | number>;
// Equivalent to: (string | number)[]

// Practical example: Filter null/undefined
type NonNullableKeys<T> = {
  [K in keyof T]: T[K] extends null | undefined ? never : K;
}[keyof T];

interface User {
  name: string;
  age: number;
  email: string | null;
  phone: string | undefined;
}

type RequiredKeys = NonNullableKeys<User>; // "name" | "age"
```

---

## Mapped Types

### Basic Mapped Types

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P]; // Remove optional modifier
};

// Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Remove readonly modifier
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
```

### Advanced Mapped Types

```typescript
// Mapped type with conditional
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  name: string;
  age: number;
}

type NullableUser = Nullable<User>;
// { name: string | null; age: number | null }

// Getters
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// Exclude specific keys
type OmitByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? never : K]: T[K];
};

interface Mixed {
  id: number;
  name: string;
  age: number;
  active: boolean;
}

type OnlyStrings = OmitByType<Mixed, number | boolean>;
// { name: string }
```

### Key Remapping (TypeScript 4.1+)

```typescript
// Rename keys
type Rename<T, From extends keyof T, To extends string> = {
  [K in keyof T as K extends From ? To : K]: T[K];
};

type Original = { firstName: string; lastName: string };
type Renamed = Rename<Original, "firstName", "givenName">;
// { givenName: string; lastName: string }

// Prefix all keys
type Prefix<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K];
};

type Data = { x: number; y: number };
type PrefixedData = Prefix<Data, "point_">;
// { point_x: number; point_y: number }

// Filter keys by pattern
type FilterKeys<T, Pattern extends string> = {
  [K in keyof T as K extends `${Pattern}${string}` ? K : never]: T[K];
};

interface ApiResponse {
  user_name: string;
  user_email: string;
  meta_timestamp: number;
  meta_version: string;
}

type UserFields = FilterKeys<ApiResponse, "user_">;
// { user_name: string; user_email: string }
```

---

## Template Literal Types

### Basic Template Literals

```typescript
// String literal concatenation
type Greeting = "Hello" | "Hi";
type Name = "Alice" | "Bob";

type GreetingWithName = `${Greeting}, ${Name}!`;
// "Hello, Alice!" | "Hello, Bob!" | "Hi, Alice!" | "Hi, Bob!"

// HTTP methods with paths
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiPath = "/users" | "/posts" | "/comments";

type ApiEndpoint = `${HttpMethod} ${ApiPath}`;
// "GET /users" | "POST /users" | ... (16 combinations)
```

### Template Literal Utilities

```typescript
// Built-in utilities
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

type Loud = Uppercase<"hello">; // "HELLO"
type Quiet = Lowercase<"HELLO">; // "hello"
type Capital = Capitalize<"hello">; // "Hello"
type Lower = Uncapitalize<"Hello">; // "hello"

// Event handler types
type PropEventSource<Type> = {
  on<Key extends string & keyof Type>(
    eventName: `${Key}Changed`,
    callback: (newValue: Type[Key]) => void
  ): void;
};

interface Person {
  name: string;
  age: number;
}

const person: PropEventSource<Person> = {
  on(eventName, callback) {
    // Implementation
  }
};

person.on("nameChanged", (newName) => {
  console.log(newName.toUpperCase()); // newName is string
});

person.on("ageChanged", (newAge) => {
  console.log(newAge.toFixed(2)); // newAge is number
});
```

### CSS-in-JS Type Safety

```typescript
// Type-safe CSS properties
type CSSUnits = "px" | "em" | "rem" | "%";
type Size = `${number}${CSSUnits}`;

interface StyleProps {
  width: Size;
  height: Size;
  margin: Size;
  padding: Size;
}

const styles: StyleProps = {
  width: "100px",
  height: "50%",
  margin: "1rem",
  padding: "2em"
};

// Type-safe color values
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

const color1: Color = "rgb(255, 0, 0)";
const color2: Color = "rgba(0, 255, 0, 0.5)";
const color3: Color = "#0000FF";
```

### Route Parameter Extraction

```typescript
// Extract path parameters
type ExtractParams<Path extends string> =
  Path extends `${infer Start}/:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : Path extends `${infer Start}/:${infer Param}`
    ? { [K in Param]: string }
    : {};

type Params1 = ExtractParams<"/users/:id">;
// { id: string }

type Params2 = ExtractParams<"/users/:userId/posts/:postId">;
// { userId: string; postId: string }

// Type-safe routing
function route<Path extends string>(
  path: Path,
  handler: (params: ExtractParams<Path>) => void
): void {
  // Implementation
}

route("/users/:id", (params) => {
  console.log(params.id); // Type-safe!
});

route("/users/:userId/posts/:postId", (params) => {
  console.log(params.userId, params.postId); // Both type-safe!
});
```

---

## Decorators & Metadata

### Stage 3 Decorators (2025 Standard)

```typescript
// Class decorator
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}

// Method decorator
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

// Property decorator
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false
  });
}

class Person {
  @readonly
  name: string = "Alice";
}

// Parameter decorator
function required(target: any, propertyKey: string, parameterIndex: number) {
  const existingRequiredParameters: number[] =
    Reflect.getOwnMetadata("required", target, propertyKey) || [];

  existingRequiredParameters.push(parameterIndex);

  Reflect.defineMetadata(
    "required",
    existingRequiredParameters,
    target,
    propertyKey
  );
}

class Greeter {
  greet(@required name: string) {
    return `Hello, ${name}`;
  }
}
```

### Metadata Reflection (with reflect-metadata)

```typescript
import "reflect-metadata";

// Design-time type metadata
function logType(target: any, key: string) {
  const type = Reflect.getMetadata("design:type", target, key);
  console.log(`${key} type: ${type.name}`);
}

class Demo {
  @logType
  public attr: string = "value";
}

// Parameter type metadata
function logParameter(target: any, propertyKey: string, parameterIndex: number) {
  const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
  console.log(`Parameter ${parameterIndex} type:`, paramTypes[parameterIndex].name);
}

class Test {
  method(
    @logParameter arg1: string,
    @logParameter arg2: number
  ) {}
}

// Custom metadata
const formatMetadataKey = Symbol("format");

function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}

class Formatter {
  @format("YYYY-MM-DD")
  date: Date;
}
```

### Decorator Factories

```typescript
// Decorator factory for validation
function validate(validator: (value: any) => boolean) {
  return function (target: any, propertyKey: string) {
    let value: any;

    const getter = function () {
      return value;
    };

    const setter = function (newVal: any) {
      if (!validator(newVal)) {
        throw new Error(`Validation failed for ${propertyKey}`);
      }
      value = newVal;
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class User {
  @validate((value) => value.length >= 3)
  username: string;

  @validate((value) => value >= 18)
  age: number;
}
```

---

## Type Inference & Type Assertions

### Type Inference

```typescript
// ✅ Good: Let TypeScript infer
let x = 3; // inferred as number
let y = [1, 2, 3]; // inferred as number[]
let z = { name: "Alice", age: 30 }; // inferred as { name: string; age: number }

// Function return type inference
function add(a: number, b: number) {
  return a + b; // inferred as number
}

// Generic inference
function identity<T>(value: T): T {
  return value;
}

const num = identity(42); // T inferred as number
const str = identity("hello"); // T inferred as string

// Best common type
let arr = [1, "hello", true]; // inferred as (string | number | boolean)[]

// Contextual typing
window.addEventListener("click", (event) => {
  console.log(event.clientX); // event inferred as MouseEvent
});
```

### Type Assertions

```typescript
// as syntax (preferred)
const input = document.getElementById("input") as HTMLInputElement;
input.value = "Hello";

// Angle-bracket syntax (doesn't work in .tsx files)
const input2 = <HTMLInputElement>document.getElementById("input");

// Double assertion (rarely needed)
const value = (document.getElementById("input") as any) as HTMLInputElement;

// Non-null assertion (!)
const element = document.getElementById("app")!; // Assert it's not null
element.innerHTML = "Hello";

// Const assertion
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const;

// Type: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }

const colors = ["red", "green", "blue"] as const;
// Type: readonly ["red", "green", "blue"]

// Satisfies operator (TypeScript 4.9+)
type RGB = { r: number; g: number; b: number };
type Palette = Record<string, RGB | string>;

const palette = {
  red: { r: 255, g: 0, b: 0 },
  green: "#00ff00",
  blue: { r: 0, g: 0, b: 255 }
} satisfies Palette;

// Now palette has specific type, not widened to Palette
palette.red.r; // ✅ Works because red is known to be RGB
```

---

## Error Handling Patterns

### Result Type Pattern

```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, value: a / b };
}

function processResult() {
  const result = divide(10, 2);

  if (result.success) {
    console.log(`Result: ${result.value}`);
  } else {
    console.error(`Error: ${result.error}`);
  }
}
```

### Option/Maybe Type Pattern

```typescript
type Option<T> = T | null | undefined;

function find<T>(arr: T[], predicate: (item: T) => boolean): Option<T> {
  return arr.find(predicate) ?? null;
}

// Usage
const users = [{ name: "Alice" }, { name: "Bob" }];
const user = find(users, (u) => u.name === "Alice");

if (user) {
  console.log(user.name); // Type-safe access
}
```

### Custom Error Classes

```typescript
// Base error class
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

// Type guard for error handling
function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Usage
try {
  throw new NotFoundError("User");
} catch (error) {
  if (isAppError(error)) {
    console.log(`[${error.code}] ${error.message}`);
  } else {
    console.log("Unknown error");
  }
}
```

---

## Performance Optimization

### Compiler Performance Tips

```json
{
  "compilerOptions": {
    // Use project references for monorepos
    "composite": true,
    "incremental": true,

    // Skip type checking of declaration files
    "skipLibCheck": true,

    // Assume each file is a separate module (faster)
    "isolatedModules": true,

    // Don't emit on errors (fail fast)
    "noEmitOnError": true
  }
}
```

### Type Complexity Reduction

```typescript
// ❌ Bad: Complex nested conditionals (slow to compile)
type ComplexType<T> = T extends string
  ? T extends `${infer A}${infer B}`
    ? A extends string
      ? B extends string
        ? /* ... deeply nested ... */
        : never
      : never
    : never
  : never;

// ✅ Good: Break into smaller types
type ExtractFirst<T extends string> = T extends `${infer First}${string}` ? First : never;
type ExtractRest<T extends string> = T extends `${string}${infer Rest}` ? Rest : never;

type SimplerType<T extends string> = {
  first: ExtractFirst<T>;
  rest: ExtractRest<T>;
};

// ❌ Bad: Union with many members (slow)
type ManyStrings = "a" | "b" | "c" | /* ...100 more... */ | "z";

// ✅ Good: Use string or branded types
type BrandedString = string & { __brand: "ValidString" };
```

### Avoid Type Widening Issues

```typescript
// ❌ Bad: Type widening
const config = {
  apiUrl: "https://api.example.com", // Type: string (widened)
  timeout: 5000 // Type: number (widened)
};

// ✅ Good: Use as const
const config = {
  apiUrl: "https://api.example.com", // Type: "https://api.example.com"
  timeout: 5000 // Type: 5000
} as const;

// ✅ Good: Explicit typing
const config: { apiUrl: string; timeout: number } = {
  apiUrl: "https://api.example.com",
  timeout: 5000
};
```

---

## Common Patterns & Anti-Patterns

### ✅ Best Practices

**1. Prefer Types Over Interfaces for Unions/Intersections**

```typescript
// ✅ Good
type Status = "pending" | "approved" | "rejected";
type AdminUser = User & { role: "admin" };

// ❌ Bad (can't do with interfaces)
// interface Status = "pending" | "approved" | "rejected"; // Error!
```

**2. Use Discriminated Unions**

```typescript
// ✅ Good
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ❌ Bad
type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

**3. Leverage Type Inference**

```typescript
// ✅ Good: Let TypeScript infer
const numbers = [1, 2, 3];
const double = numbers.map(n => n * 2);

// ❌ Bad: Unnecessary annotations
const numbers: number[] = [1, 2, 3];
const double: number[] = numbers.map((n: number): number => n * 2);
```

**4. Use unknown Instead of any**

```typescript
// ✅ Good
function processValue(value: unknown) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  }
}

// ❌ Bad
function processValue(value: any) {
  console.log(value.toUpperCase()); // No type safety!
}
```

### ❌ Anti-Patterns

**1. Type Assertions Instead of Type Guards**

```typescript
// ❌ Bad
function process(value: unknown) {
  const str = value as string;
  console.log(str.toUpperCase()); // Unsafe!
}

// ✅ Good
function process(value: unknown) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  }
}
```

**2. Overuse of any**

```typescript
// ❌ Bad
function getData(): any {
  return fetch("/api/data");
}

// ✅ Good
async function getData<T>(): Promise<T> {
  const response = await fetch("/api/data");
  return response.json();
}
```

**3. Ignoring Strict Mode**

```typescript
// ❌ Bad: Disabled strict mode allows:
let name: string = null; // Should error!
function process(data) { } // Implicit any

// ✅ Good: Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**4. Not Using Utility Types**

```typescript
// ❌ Bad: Manual property duplication
interface User {
  id: string;
  name: string;
  email: string;
}

interface PartialUser {
  id?: string;
  name?: string;
  email?: string;
}

// ✅ Good: Use Partial utility
type PartialUser = Partial<User>;
```

---

## Quick Reference Checklist

When working with TypeScript, verify:

- [ ] `strict: true` enabled in tsconfig.json
- [ ] No `any` types (use `unknown` instead)
- [ ] Type inference used where possible
- [ ] Discriminated unions for complex types
- [ ] Type guards for runtime safety
- [ ] Custom utility types for reusability
- [ ] `as const` for literal types
- [ ] `satisfies` for better type narrowing (TS 4.9+)
- [ ] Exhaustiveness checking in switch statements
- [ ] Generic constraints when needed
- [ ] Proper error handling with Result/Option types
- [ ] Template literal types for string patterns
- [ ] Branded types for primitives that need distinction
- [ ] No type assertions without validation
- [ ] Project references for monorepos

---

## Usage Instructions

When this skill is invoked, use it to:

1. **Design type-safe APIs** - Use discriminated unions, generics, and utility types
2. **Refactor code** - Apply advanced patterns like conditional and mapped types
3. **Configure TypeScript** - Set up strict mode and optimize tsconfig.json
4. **Debug type errors** - Understand type narrowing, inference, and constraints
5. **Optimize performance** - Reduce type complexity and leverage incremental compilation
6. **Implement patterns** - Use Result types, branded types, and type guards
7. **Review code** - Ensure strict mode compliance and proper type usage

**Remember**: TypeScript's type system is about catching errors early and providing great developer experience. Use strict mode, leverage inference, and prefer type safety over convenience!

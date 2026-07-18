# promise-utils

Lightweight, dependency-free TypeScript utilities for working with promises: delay execution, enforce timeouts, retry failing tasks, and run tasks sequentially with a pause between them.

## Tech Stack

- **TypeScript**
- **Vitest**

## Features

- **`delay`** pause execution for a given number of milliseconds.
- **`timeout`** reject a task if it takes too long to complete.
- **`retry`** automatically retry a failing task up to a max number of attempts.
- **`sequence`** run an array of tasks one after another with a delay between them.

## Usage

```ts
import { delay, timeout, retry, sequence } from "promise-utils";
```

### `delay`

Pauses execution for a specified number of milliseconds.

```ts
await delay(1000);
```

**Signature**

```ts
function delay(delayMs: number): Promise<void>
```

| Parameter | Type     | Description                       |
| --------- | -------- | ---------------------------------- |
| `delayMs` | `number` | Duration to wait, in milliseconds |

---

### `timeout`

Executes a task and rejects if it fails to complete within the specified timeout.

```ts
const result = await timeout(() => fetchData(), 500);
```

**Signature**

```ts
function timeout<T>(
  task: () => Promise<T> | T,
  timeoutMs: number
): Promise<T>
```

| Parameter   | Type                        | Description                              |
| ----------- | --------------------------- | ----------------------------------------- |
| `task`      | `() => Promise<T> \| T`     | The function to execute                   |
| `timeoutMs` | `number`                    | Maximum allowed execution time, in ms      |

**Throws:** `Error("Timeout exceeded")` if the time limit is reached.

---

### `retry`

Repeatedly attempts to execute a task until it succeeds or hits the retry limit.

```ts
const result = await retry(() => unstableRequest(), 3, 500);
```

**Signature**

```ts
function retry<T>(
  task: () => Promise<T> | T,
  maxRetries: number,
  delayMs: number
): Promise<T>
```

| Parameter    | Type                     | Description                                   |
| ------------ | ------------------------ | ---------------------------------------------- |
| `task`       | `() => Promise<T> \| T`  | The function to execute                        |
| `maxRetries` | `number`                 | Maximum number of attempts before throwing      |
| `delayMs`    | `number`                 | Time to wait between attempts, in milliseconds |

**Throws:** rethrows the last encountered error if the maximum number of retries is reached.

---

### `sequence`

Executes an array of tasks sequentially, pausing for a specific duration between each.

```ts
const results = await sequence(
  [() => step1(), () => step2(), () => step3()],
  1000
);
```

**Signature**

```ts
function sequence<T>(
  tasks: (() => Promise<T> | T)[],
  delayMs: number
): Promise<T[]>
```

| Parameter | Type                       | Description                                       |
| --------- | -------------------------- | --------------------------------------------------- |
| `tasks`   | `(() => Promise<T> \| T)[]` | Array of functions to execute in order              |
| `delayMs` | `number`                   | Wait time between the end of one task and the next |
/**
 * Pauses execution for a specified number of milliseconds.
 *
 * @param delayMs - The duration to wait, in milliseconds.
 * @returns A promise that resolves when the delay has elapsed.
 */

export function delay(delayMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/**
 * Executes a task and rejects if it fails to complete within the specified timeout.
 *
 * @template T - The expected return type of the task.
 * @param task - The function to execute, returning a value or a promise.
 * @param timeoutMs - The maximum allowed execution time, in milliseconds.
 * @returns A promise that resolves with the task's result.
 * @throws {Error} Rejects with a "Timeout exceeded" error if the time limit is reached.
 */

export function timeout<T>(
  task: () => Promise<T> | T,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    task(),
    new Promise<never>((resolve, reject) =>
      setTimeout(() => reject(new Error("Timeout exceeded")), timeoutMs),
    ),
  ]);
}

/**
 * Repeatedly attempts to execute a task until it succeeds or hits the retry limit.
 *
 * @template T - The expected return type of the task.
 * @param task - The function to execute, returning a value or a promise.
 * @param maxRetries - The maximum number of attempts before throwing an error.
 * @param delayMs - The time to wait between consecutive attempts, in milliseconds.
 * @returns A promise that resolves with the task's result upon successful execution.
 * @throws {Error} Rethrows the last encountered error if the maximum number of retries is reached.
 */

export async function retry<T>(
  task: () => Promise<T> | T,
  maxRetries: number,
  delayMs: number,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await task();
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        throw error;
      }

      await delay(delayMs);
    }
  }
}

/**
 * Executes an array of tasks sequentially, pausing for a specific duration between each.
 *
 * @template T - The expected return type of the tasks.
 * @param tasks - An array of functions to execute in order.
 * @param delayMs - The wait time between the completion of one task and the start of the next, in milliseconds.
 * @returns A promise that resolves with an array of the tasks' results in their execution order.
 */

export async function sequence<T>(
  tasks: (() => Promise<T> | T)[],
  delayMs: number,
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < tasks.length; i++) {
    results.push(await tasks[i]());

    if (i < tasks.length - 1) {
      await delay(delayMs);
    }
  }

  return results;
}

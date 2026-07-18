import { describe, expect, it } from "vitest";
import { delay, timeout, retry, sequence } from "../src/promise-utils";

describe("delay", () => {
  it("should pause execution for the specified duration", async () => {
    const delayMs = 1000;
    const start = Date.now();

    await delay(delayMs);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThan(delayMs * 0.95);
    expect(elapsed).toBeLessThan(delayMs * 1.05);
  });
});

describe("timeout", () => {
  it("should resolve with the task result if completed before timeout", async () => {
    const task = async () => "Task succeed";
    const timeoutMs = 500;

    const result = timeout(task, timeoutMs);

    await expect(result).resolves.toBe("Task succeed");
  });

  it("should reject with the task error if task fails before timeout", async () => {
    const task = async () => {
      throw new Error("Task failed");
    };
    const timeoutMs = 500;

    const result = timeout(task, timeoutMs);

    await expect(result).rejects.toThrow("Task failed");
  });

  it("should reject with a timeout error if the task takes too long", async () => {
    const task = () => delay(1000).then(() => "Task succeed");
    const timeoutMs = 500;

    const result = timeout(task, timeoutMs);

    await expect(result).rejects.toThrow("Timeout exceeded");
  });
});

describe("retry", () => {
  it("should resolve immediately if the task succeeds on the first attempt", async () => {
    let attempts = 0;
    const task = async () => {
      attempts++;
      return "Task succeed";
    };
    const maxRetries = 3;
    const delayMs = 500;

    const result = await retry(task, maxRetries, delayMs);

    expect(result).toBe("Task succeed");
    expect(attempts).toBe(1);
  });

  it("should resolve if the task succeeds before reaching max retries", async () => {
    let attempts = 0;
    const task = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("Task failed");
      }
      return "Task succeed";
    };
    const maxRetries = 3;
    const delayMs = 500;

    const result = await retry(task, maxRetries, delayMs);

    expect(result).toBe("Task succeed");
    expect(attempts).toBe(3);
  });

  it("should reject with the last error if max retries are exceeded", async () => {
    let attempts = 0;
    const task = async () => {
      attempts++;
      throw new Error("Task failed");
    };
    const maxRetries = 3;
    const delayMs = 500;

    const result = retry(task, maxRetries, delayMs);

    await expect(result).rejects.toThrow("Task failed");
    expect(attempts).toBe(3);
  });

  it("should pause execution for the specified delay between attempts", async () => {
    const task = async () => {
      throw new Error("Fail");
    };
    const delayMs = 500;
    const maxRetries = 3;
    const start = Date.now();

    await expect(retry(task, maxRetries, delayMs)).rejects.toThrow();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThan(delayMs * 2 * 0.95);
    expect(elapsed).toBeLessThan(delayMs * 2 * 1.05);
  });
});

describe("sequence", () => {
  it("should execute tasks sequentially and return an array of results", async () => {
    const tasks = [
      () => "first",
      async () => "second",
      () => Promise.resolve("third"),
    ];
    const delayMs = 500;

    const result = await sequence(tasks, delayMs);

    expect(result).toEqual(["first", "second", "third"]);
  });

  it("should pause execution for the specified delay between tasks", async () => {
    const tasks = [async () => 1, async () => 2, async () => 3];
    const delayMs = 500;

    const start = Date.now();
    await sequence(tasks, delayMs);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThan(delayMs * 2 * 0.95);
    expect(elapsed).toBeLessThan(delayMs * 2 * 1.05);
  });

  it("should reject immediately if a synchronous task throws an error", async () => {
    const tasks = [
      async () => 1,
      () => {
        throw new Error("Sync error");
      },
      async () => 3,
    ];
    const delayMs = 500;

    const result = sequence(tasks, delayMs);

    await expect(result).rejects.toThrow("Sync error");
  });

  it("should reject immediately if an asynchronous task rejects", async () => {
    const tasks = [
      async () => 1,
      async () => Promise.reject(new Error("Async error")),
      async () => 3,
    ];
    const delayMs = 500;

    const result = sequence(tasks, delayMs);

    await expect(result).rejects.toThrow("Async error");
  });
});

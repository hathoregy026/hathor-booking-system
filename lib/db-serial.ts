/** Serialize DB work so we never stampede the Supabase pooler. */
let chain: Promise<unknown> = Promise.resolve();

export function runSerialDb<T>(task: () => Promise<T>): Promise<T> {
  const next = chain.then(task, task);
  chain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

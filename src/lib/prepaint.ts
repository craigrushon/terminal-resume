export interface PrepaintEnv {
  search: string;
  storage: Pick<Storage, 'getItem'> | null;
  width: number;
  root: HTMLElement;
}

/**
 * Inlined into <head> via Function.prototype.toString: must be SELF-CONTAINED
 * (no imports, no module-scope identifiers). Sets root.dataset.view/detail/theme
 * exactly as resolvePrefs would.
 */
export function prepaint(env: PrepaintEnv): void {
  const keys = ['view', 'detail', 'theme'];
  const allowed: Record<string, string[]> = {
    view: ['terminal', 'resume'],
    detail: ['concise', 'verbose'],
    theme: ['classic', 'modern'],
  };
  const fallback: Record<string, string> = {
    view: env.width < 640 ? 'resume' : 'terminal',
    detail: 'concise',
    theme: 'modern',
  };
  let query: URLSearchParams | null = null;
  try {
    query = new URLSearchParams(env.search);
  } catch (e) {
    query = null;
  }
  for (const key of keys) {
    const options = allowed[key] ?? [];
    let value: string | null = query ? query.get(key) : null;
    if (value === null || options.indexOf(value) === -1) {
      value = null;
      try {
        value = env.storage ? env.storage.getItem('pref:' + key) : null;
      } catch (e) {
        value = null;
      }
    }
    env.root.dataset[key] = value !== null && options.indexOf(value) !== -1 ? value : (fallback[key] ?? '');
  }
}

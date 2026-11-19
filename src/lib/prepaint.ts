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
export function prepaint(_env: PrepaintEnv): void {
  throw new Error('not implemented');
}

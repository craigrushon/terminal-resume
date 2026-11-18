/** Read-only virtual filesystem. Sections are data; commands render each one. */
export const SECTION_NAMES = ['contact', 'education', 'experience', 'projects', 'skills'] as const;
export type SectionName = (typeof SECTION_NAMES)[number];

type Node = { kind: 'file' } | { kind: 'dir'; children: Readonly<Record<string, Node>> };

const file: Node = { kind: 'file' };

const TREE: Node = {
  kind: 'dir',
  children: {
    README: file,
    resume: { kind: 'dir', children: Object.fromEntries(SECTION_NAMES.map((name) => [name, file])) },
  },
};

const HOME = '~';

function lookup(path: string): Node | null {
  const [root, ...segments] = path.split('/');
  if (root !== HOME) return null;
  let node: Node = TREE;
  for (const segment of segments) {
    if (node.kind !== 'dir') return null;
    const child: Node | undefined = Object.hasOwn(node.children, segment) ? node.children[segment] : undefined;
    if (child === undefined) return null;
    node = child;
  }
  return node;
}

/** Resolve `path` against `cwd` (`~`, `.`, `..`, trailing slashes). Null when it does not exist. */
export function resolvePath(cwd: string, path: string): string | null {
  if (path.startsWith('/')) return null;
  const isHomePath = path === HOME || path.startsWith(`${HOME}/`);
  const segments = (isHomePath ? [] : cwd.split('/').slice(1)).slice();
  const parts = isHomePath ? path.split('/').slice(1) : path.split('/');
  const resolved = parts.reduce<string[]>((acc, part) => {
    if (part === '' || part === '.') return acc;
    return part === '..' ? acc.slice(0, -1) : [...acc, part];
  }, segments);
  const result = [HOME, ...resolved].join('/');
  return lookup(result) === null ? null : result;
}

export function isDir(path: string): boolean {
  return lookup(path)?.kind === 'dir';
}

export function isFile(path: string): boolean {
  return lookup(path)?.kind === 'file';
}

/** Sorted entries; directories carry a trailing slash. Empty for files and unknown paths. */
export function listDir(path: string): string[] {
  const node = lookup(path);
  if (node?.kind !== 'dir') return [];
  return Object.entries(node.children)
    .map(([name, child]) => (child.kind === 'dir' ? `${name}/` : name))
    .sort();
}

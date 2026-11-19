import type { Block } from '../lib/terminal/types';

export function TerminalBlock({ block }: { block: Block }): React.JSX.Element {
  switch (block.type) {
    case 'text':
      return <p>{block.text}</p>;
    case 'heading':
      return <h3>{block.text}</h3>;
    case 'list':
      return (
        <ul>
          {block.items.map((item, index) => (
            // Items are static for a given block and never reordered.
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      );
    case 'link':
      return (
        <p>
          {block.label === block.href ? null : `${block.label} `}
          <a href={block.href} target="_blank" rel="noopener noreferrer">
            {block.href}
          </a>
        </p>
      );
    case 'error':
      return <p className="error">{block.text}</p>;
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

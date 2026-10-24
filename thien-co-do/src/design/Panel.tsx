import type { HTMLAttributes } from 'react';

export function Panel({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`hud-panel pointer-events-auto ${className}`} {...rest} />;
}

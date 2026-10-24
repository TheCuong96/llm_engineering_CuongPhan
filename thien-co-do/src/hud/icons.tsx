import { CircleDot, Flower2, Gem, Mountain, Package, Pill, Scroll, Sprout, Sword, Wheat, type LucideIcon } from 'lucide-react';

const byName: Record<string, LucideIcon> = {
  gem: Gem,
  sprout: Sprout,
  flower: Flower2,
  pill: Pill,
  mountain: Mountain,
  wheat: Wheat,
  scroll: Scroll,
  'circle-dot': CircleDot,
  sword: Sword,
};

export function InventoryIcon({ name }: { name: string }) {
  const Icon = byName[name] ?? Package;
  return <Icon className="size-4" aria-hidden="true" />;
}

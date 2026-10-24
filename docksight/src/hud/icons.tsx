import { Armchair, Container, Droplets, Hand, HardHat, Lightbulb, Package, Scroll, Snowflake, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  package: Package,
  container: Container,
  'hard-hat': HardHat,
  scroll: Scroll,
  lightbulb: Lightbulb,
  hand: Hand,
  snowflake: Snowflake,
  droplets: Droplets,
  armchair: Armchair,
};

/** Inventory line icon (catalog `icon` field → lucide). */
export function InventoryIcon({ name }: { name: string }) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className="size-4" aria-hidden="true" />;
}

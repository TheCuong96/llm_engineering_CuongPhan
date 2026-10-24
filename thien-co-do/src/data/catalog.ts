import type { SkuDef } from '../sim/config';
import type { Guild } from '../sim/types';
import { vi } from '../i18n/vi';

const items = vi.names.items;
const guildNames = vi.names.guilds;

export const catalog: SkuDef[] = [
  { sku: 'spirit_stone_low', name: items.spirit_stone_low, category: 'ore', grade: 1, qtyPerChest: 100, weightKg: 40, icon: 'gem' },
  { sku: 'blood_lingzhi', name: items.blood_lingzhi, category: 'herb', grade: 3, qtyPerChest: 24, weightKg: 12, icon: 'sprout' },
  { sku: 'snow_lotus', name: items.snow_lotus, category: 'herb', grade: 5, qtyPerChest: 6, weightKg: 8, icon: 'flower', cold: { maxMinutesOutside: 45 } },
  { sku: 'foundation_pill', name: items.foundation_pill, category: 'pill', grade: 4, qtyPerChest: 50, weightKg: 6, icon: 'pill' },
  { sku: 'cold_iron_ore', name: items.cold_iron_ore, category: 'ore', grade: 2, qtyPerChest: 20, weightKg: 60, icon: 'mountain' },
  { sku: 'spirit_rice', name: items.spirit_rice, category: 'herb', grade: 1, qtyPerChest: 60, weightKg: 30, icon: 'wheat' },
  { sku: 'blank_talisman', name: items.blank_talisman, category: 'talisman', grade: 1, qtyPerChest: 500, weightKg: 5, icon: 'scroll' },
  { sku: 'beast_core_2', name: items.beast_core_2, category: 'pill', grade: 2, qtyPerChest: 12, weightKg: 4, icon: 'circle-dot' },
  { sku: 'green_steel_blank', name: items.green_steel_blank, category: 'ore', grade: 3, qtyPerChest: 10, weightKg: 45, icon: 'sword' },
];

// Sail colours per guild (spec §7.1); 3D-only colours, never used in the HUD.
export const guilds: Guild[] = [
  { id: 'wanbao', name: guildNames.wanbao, livery: { hull: '#7A5233', sail: '#D8B24A', flag: '#B8902F' } },
  { id: 'liuyun', name: guildNames.liuyun, livery: { hull: '#6E5A44', sail: '#E8EEF5', flag: '#5C86B8' } },
  { id: 'chiyan', name: guildNames.chiyan, livery: { hull: '#6B3F2A', sail: '#E0703A', flag: '#C2502A' } },
  { id: 'xuangui', name: guildNames.xuangui, livery: { hull: '#4A4034', sail: '#24343A', flag: '#4E6B4A' } },
];

import overridesRaw from '../countries.json';
import countryTags from './tags';
// Load via require to use CJS path and avoid ESM import-assert issue.
// In dev, bundlers may wrap CJS as { default: [...] } – handle both.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wcMod: any = require('world-countries');
const wc: any[] = Array.isArray(wcMod) ? wcMod : (Array.isArray(wcMod?.default) ? wcMod.default : []);

export type Country = {
  id: string;
  name: string;
  quadrant: string;
  provision: number;
  freedom: number;
  summary: string;
  details?: string;
  tags?: string[];
};

type Override = Country;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

// Manual alias mapping for name mismatches
const aliasToBase: Record<string, string> = {
  'usa': 'united-states',
  'dr-congo': 'congo-democratic-republic-of-the',
  'uae': 'united-arab-emirates',
};

const overrides: Override[] = overridesRaw as any;

// Build a lookup for overrides by multiple keys
const overrideByKey = new Map<string, Override>();
for (const o of overrides) {
  const nameKey = normalize(o.name);
  const idKey = normalize(o.id);
  overrideByKey.set(nameKey, o);
  overrideByKey.set(idKey, o);
  const alias = aliasToBase[idKey];
  if (alias) overrideByKey.set(alias, o);
}

// Take all UN member states, exclude Palestine explicitly
let baseCountries: Country[] = wc
  .filter((c: any) => c.unMember)
  .filter((c: any) => normalize(c.name.common) !== 'palestine' && normalize(c.name.official) !== 'state-of-palestine')
  .map((c: any) => {
    const baseId = normalize(c.name.common);
    const key = baseId;
    const o = overrideByKey.get(key);
    const regionTags: string[] = [];
    const reg = (c.region || '').toString();
    const sub = (c.subregion || '').toString();
    if (reg) {
      if (/europe/i.test(reg)) regionTags.push('Europe');
      if (/asia/i.test(reg)) regionTags.push('Asia');
      if (/africa/i.test(reg)) regionTags.push('Africa');
      if (/americas/i.test(reg)) {
        // Split Americas into North/South by subregion when available
        if (/north/i.test(sub) || /caribbean/i.test(sub) || /central/i.test(sub)) regionTags.push('NorthAmerica');
        if (/south/i.test(sub)) regionTags.push('SouthAmerica');
      }
      if (/oceania/i.test(reg)) regionTags.push('Oceania');
    }
    if (/eastern europe/i.test(sub)) regionTags.push('EasternEurope');
    if (/western europe/i.test(sub)) regionTags.push('WesternEurope');
    if (/northern europe/i.test(sub)) regionTags.push('NorthernEurope');
    if (/southern europe/i.test(sub)) regionTags.push('SouthernEurope');
    if (o) {
      return {
        id: baseId,
        name: c.name.common,
        quadrant: o.quadrant,
        provision: o.provision,
        freedom: o.freedom,
        summary: o.summary,
        details: o.details,
        tags: Array.from(new Set([...(o as any).tags || countryTags[baseId] || [], ...regionTags])),
      } as Country;
    }
    return {
      id: baseId,
      name: c.name.common,
      quadrant: 'TBD',
      provision: 5,
      freedom: 5,
      summary: 'Not yet profiled.',
      tags: Array.from(new Set([...(countryTags[baseId] || []), ...regionTags])),
    } as Country;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Fallback: if dataset failed to load in dev, provide at least the overrides
if (!Array.isArray(baseCountries) || baseCountries.length === 0) {
  baseCountries = overrides
    .filter((o) => normalize(o.name) !== 'palestine' && normalize(o.id) !== 'palestine')
    .map((o) => ({
      id: normalize(o.id || o.name),
      name: o.name,
      quadrant: o.quadrant,
      provision: o.provision,
      freedom: o.freedom,
      summary: o.summary,
      details: o.details,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const countries: Country[] = baseCountries;
// Featured set: show curated countries (those present in overrides)
const overrideIds = new Set(
  (overrides as Override[]).map((o) => normalize((o as any).id || (o as any).name))
);
export const featuredCountries: Country[] = baseCountries.filter((c) =>
  overrideIds.has(normalize(c.id))
);
export default countries;

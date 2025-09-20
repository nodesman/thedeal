import React, { useMemo, useState } from 'react';
import type { Country } from '../data/countries';

type Props = {
  countries: Country[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectMany: (ids: string[]) => void;
  onClear: () => void;
};

const SelectionList: React.FC<Props> = ({ countries, selectedIds, onToggle, onSelectMany, onClear }) => {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(s) || c.id.includes(s));
  }, [countries, q]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto 1rem', padding: '0 8px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${countries.length} countries…`}
          style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #333', background: '#1e1e1e', color: '#ddd' }}
        />
        <button onClick={() => onSelectMany(filtered.map((c) => c.id))} style={{ padding: '6px 10px' }}>Check all shown</button>
        <button onClick={onClear} style={{ padding: '6px 10px' }}>Clear checked</button>
      </div>
      <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid #333', borderRadius: 6, padding: 8, background: '#161616' }}>
        {filtered.map((c) => (
          <label key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', width: '50%' }}>
            <input
              type="checkbox"
              checked={selectedIds.has(c.id)}
              onChange={() => onToggle(c.id)}
            />
            <span>{c.name}</span>
          </label>
        ))}
        {filtered.length === 0 && <div style={{ color: '#888' }}>No matches.</div>}
      </div>
    </div>
  );
};

export default SelectionList;


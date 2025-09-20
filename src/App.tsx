import React, { useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import countriesData, { featuredCountries } from './data/countries';
import type { Country } from './data/countries';
import CountryGraph from './components/CountryGraph';
import CountryDetail from './routes/CountryDetail';
import FilterBar from './components/FilterBar';
import SelectionList from './components/SelectionList';
import PresetBar from './components/PresetBar';

// Define the type for a single country object

function App() {
  const baseCountries: Country[] = featuredCountries.length ? featuredCountries : countriesData;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedQuadrants, setSelectedQuadrants] = useState<string[]>([]);
  const [provRange, setProvRange] = useState<[number, number]>([0, 10]);
  const [freeRange, setFreeRange] = useState<[number, number]>([0, 10]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allTags = useMemo(() => {
    const s = new Set<string>();
    baseCountries.forEach((c) => (c.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [baseCountries]);
  const allQuadrants = useMemo(() => {
    const s = new Set<string>();
    baseCountries.forEach((c) => s.add(c.quadrant));
    return Array.from(s).sort();
  }, [baseCountries]);
  const countriesByTags: Country[] = useMemo(() => {
    if (selectedTags.length === 0) return baseCountries;
    const need = selectedTags;
    return baseCountries.filter((c) => {
      const tags = c.tags || [];
      return need.every((t) => tags.includes(t));
    });
  }, [baseCountries, selectedTags]);
  const countriesByFacets: Country[] = useMemo(() => {
    return countriesByTags.filter((c) => {
      const qOk = selectedQuadrants.length === 0 || selectedQuadrants.includes(c.quadrant);
      const pOk = c.provision >= provRange[0] && c.provision <= provRange[1];
      const fOk = c.freedom >= freeRange[0] && c.freedom <= freeRange[1];
      return qOk && pOk && fOk;
    });
  }, [countriesByTags, selectedQuadrants, provRange, freeRange]);
  const finalCountries: Country[] = useMemo(() => {
    if (selectedIds.size === 0) return countriesByFacets;
    return countriesByFacets.filter((c) => selectedIds.has(c.id));
  }, [countriesByFacets, selectedIds]);
  const navigate = useNavigate();

  return (
    <div className="App">
      <header className="App-header">
        <h1><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>The Global Deal</Link></h1>
        <p>A Sovereign Architect's Guide to the World's Social Contracts</p>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <main>
              <PresetBar onSelectTags={(tags) => setSelectedTags(tags)} onClear={() => { setSelectedTags([]); setSelectedQuadrants([]); setProvRange([0,10]); setFreeRange([0,10]); setSelectedIds(new Set()); }} />
              <FilterBar allTags={allTags} selected={selectedTags} onChange={setSelectedTags} />
              <div style={{ maxWidth: 1200, margin: '0 auto 0.5rem', padding: '0 8px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {allQuadrants.map((q) => {
                  const active = selectedQuadrants.includes(q);
                  return (
                    <button key={q} onClick={() => setSelectedQuadrants(active ? selectedQuadrants.filter((x) => x !== q) : [...selectedQuadrants, q])}
                      style={{ border: '1px solid ' + (active ? '#61dafb' : '#333'), background: active ? '#103444' : '#1e1e1e', color: active ? '#cdefff' : '#bbb', borderRadius: 16, padding: '4px 10px', fontSize: 12 }}>
                      {q}
                    </button>
                  );
                })}
                <span style={{ marginLeft: 'auto', color: '#888', fontSize: 12 }}>Provision</span>
                <input type="number" min={0} max={10} value={provRange[0]} onChange={(e) => setProvRange([Math.max(0, Math.min(10, Number(e.target.value))), provRange[1]])} style={{ width: 60, padding: 4, background: '#1e1e1e', border: '1px solid #333', color: '#ddd', borderRadius: 4 }} />
                <span style={{ color: '#666' }}>to</span>
                <input type="number" min={0} max={10} value={provRange[1]} onChange={(e) => setProvRange([provRange[0], Math.max(0, Math.min(10, Number(e.target.value)))])} style={{ width: 60, padding: 4, background: '#1e1e1e', border: '1px solid #333', color: '#ddd', borderRadius: 4 }} />
                <span style={{ marginLeft: 12, color: '#888', fontSize: 12 }}>Freedom</span>
                <input type="number" min={0} max={10} value={freeRange[0]} onChange={(e) => setFreeRange([Math.max(0, Math.min(10, Number(e.target.value))), freeRange[1]])} style={{ width: 60, padding: 4, background: '#1e1e1e', border: '1px solid #333', color: '#ddd', borderRadius: 4 }} />
                <span style={{ color: '#666' }}>to</span>
                <input type="number" min={0} max={10} value={freeRange[1]} onChange={(e) => setFreeRange([freeRange[0], Math.max(0, Math.min(10, Number(e.target.value)))])} style={{ width: 60, padding: 4, background: '#1e1e1e', border: '1px solid #333', color: '#ddd', borderRadius: 4 }} />
              </div>

              <SelectionList
                countries={countriesByFacets}
                selectedIds={selectedIds}
                onToggle={(id) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                onSelectMany={(ids) => setSelectedIds((prev) => { const n = new Set(prev); ids.forEach((id) => n.add(id)); return n; })}
                onClear={() => setSelectedIds(new Set())}
              />

              <div className="map-container">
                {finalCountries.length > 0 ? (
                  <CountryGraph
                    countries={finalCountries}
                    onSelect={(c) => navigate(`/country/${c.id}`)}
                  />
                ) : (
                  <div style={{ color: '#888' }}>Loading countries… If this persists, refresh the page.</div>
                )}
              </div>
              <ul className="country-list">
                {finalCountries.length === 0 && (
                  <li className="country-card" style={{ maxWidth: 900 }}>
                    <h2>Data unavailable</h2>
                    <p>Couldn’t load the country dataset. Try refreshing or restarting the dev server.</p>
                  </li>
                )}
                {finalCountries.map((country) => (
                  <li key={country.id} className="country-card">
                    <Link to={`/country/${country.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <h2>{country.name}</h2>
                      <h3>{country.quadrant}</h3>
                      <p>{country.summary}</p>
                      <div>
                        <span>Provision: {country.provision}/10</span>
                        <br />
                        <span>Freedom: {country.freedom}/10</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </main>
          }
        />
        <Route path="/country/:id" element={<CountryDetail />} />
      </Routes>
    </div>
  );
}

export default App;

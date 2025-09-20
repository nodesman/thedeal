import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import countriesData from '../data/countries';

import type { Country } from '../data/countries';

const CountryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const country = (countriesData as Country[]).find((c) => c.id === id);
  const [md, setMd] = useState<string | null>(null);
  const [mdTried, setMdTried] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMd(null);
    setMdTried(false);
    if (!id) return;
    fetch(`${process.env.PUBLIC_URL || ''}/details/${id}.md`)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => { if (!cancelled) { setMd(text); setMdTried(true); } })
      .catch(() => { if (!cancelled) setMdTried(true); });
    return () => { cancelled = true; };
  }, [id]);

  if (!country) {
    return (
      <main style={{ padding: '2rem' }}>
        <p>Country not found.</p>
        <p><Link to="/">Back to overview</Link></p>
      </main>
    );
  }

  return (
    <main style={{ padding: '0 1rem 2rem' }}>
      <div className="country-card" style={{ maxWidth: 960, margin: '0 auto' }}>
        <h2>{country.name}</h2>
        <h3>{country.quadrant}</h3>
        <p style={{ marginBottom: '0.75rem' }}>{country.summary}</p>
        <div style={{ marginBottom: '1rem' }}>
          <span>Provision: {country.provision}/10</span>
          <br />
          <span>Freedom: {country.freedom}/10</span>
        </div>
        {/* Markdown from public/details if present */}
        {md && (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{md}</div>
        )}
        {!md && mdTried && country.details && (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{country.details}</div>
        )}
        <div style={{ marginTop: '1rem' }}>
          <Link to="/">← Back to overview</Link>
        </div>
      </div>
    </main>
  );
};

export default CountryDetail;

import React from 'react';

type Props = {
  onSelectTags: (tags: string[]) => void;
  onClear: () => void;
};

const PresetBar: React.FC<Props> = ({ onSelectTags, onClear }) => {
  const btn = (label: string, action: () => void) => (
    <button
      key={label}
      onClick={action}
      style={{ border: '1px solid #333', background: '#1e1e1e', color: '#bbb', borderRadius: 16, padding: '4px 10px', fontSize: 12 }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto 0.5rem', padding: '0 8px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {btn('Europe', () => onSelectTags(['Europe']))}
      {btn('Clear filters', () => onClear())}
    </div>
  );
};

export default PresetBar;


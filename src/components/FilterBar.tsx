import React from 'react';

type Props = {
  allTags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
};

const FilterBar: React.FC<Props> = ({ allTags, selected, onChange }) => {
  const toggle = (tag: string) => {
    const set = new Set(selected);
    if (set.has(tag)) set.delete(tag); else set.add(tag);
    onChange(Array.from(set));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto 1rem', padding: '0 8px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          style={{
            border: '1px solid ' + (selected.includes(tag) ? '#61dafb' : '#333'),
            background: selected.includes(tag) ? '#103444' : '#1e1e1e',
            color: selected.includes(tag) ? '#cdefff' : '#bbb',
            borderRadius: 16,
            padding: '4px 10px',
            fontSize: 12,
            cursor: 'pointer'
          }}
          aria-pressed={selected.includes(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;


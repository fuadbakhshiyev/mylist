import React from 'react';
import { Search, X } from 'lucide-react';

export const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Movie', label: 'Movies' },
  { value: 'TV', label: 'Series' },
  { value: 'Special', label: 'Specials' },
];

export const matchesTitleFilter = (movie, query, type) =>
  (type === 'all' || movie.type === type) &&
  movie.title.toLowerCase().includes(query.trim().toLowerCase());

export const TitleEmptyState = ({ onReset }) => (
  <div className="title-empty-state">
    <p>No titles match your search.</p>
    <button type="button" className="filter-pill" onClick={onReset}>
      Clear filters
    </button>
  </div>
);

const TitleSearchBar = ({ query, setQuery, type, setType, placeholder = 'Search titles...' }) => (
  <div className="title-search-bar">
    <div className="segmented-control" role="tablist">
      {TYPE_FILTERS.map(filter => (
        <button
          key={filter.value}
          type="button"
          role="tab"
          aria-selected={type === filter.value}
          className={`segmented-control-item ${type === filter.value ? 'active' : ''}`}
          onClick={() => setType(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>

    <div className="search-input-wrap title-search-input">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  </div>
);

export default TitleSearchBar;

import React, { useMemo, useState } from 'react';
import { mcuTimeline } from '../data/mcuData';
import { sagas } from '../data/phasesData';
import MovieCard from '../components/MovieCard';
import TitleSearchBar, { TitleEmptyState, matchesTitleFilter } from '../components/TitleSearchBar';

const titlesById = Object.fromEntries(mcuTimeline.map(movie => [movie.id, movie]));

const Phases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const isFiltering = searchQuery.trim() !== '' || activeType !== 'all';

  const filteredSagas = useMemo(() => {
    return sagas.map(saga => ({
      ...saga,
      phases: saga.phases.map(phase => {
        // Fall back to the phase list's release year for titles without a releaseDate
        const titles = phase.items
          .filter(([id]) => titlesById[id])
          .map(([id, year]) => ({ ...titlesById[id], releaseDate: titlesById[id].releaseDate || String(year) }));

        return {
          ...phase,
          total: titles.length,
          movieCount: titles.filter(movie => movie.type === 'Movie').length,
          titles: titles.filter(movie => matchesTitleFilter(movie, searchQuery, activeType)),
        };
      }).filter(phase => phase.titles.length > 0),
    })).filter(saga => saga.phases.length > 0);
  }, [searchQuery, activeType]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveType('all');
  };

  return (
    <div className="phases-page animate-fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="section-title" style={{ fontSize: '2.5rem', margin: 0 }}>The Infinity & Multiverse Sagas</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '1.1rem' }}>
          Explore the Marvel Cinematic Universe through its official phases, in release order.
        </p>
      </div>

      <TitleSearchBar
        query={searchQuery}
        setQuery={setSearchQuery}
        type={activeType}
        setType={setActiveType}
        placeholder="Search phases..."
      />

      {filteredSagas.length === 0 && <TitleEmptyState onReset={resetFilters} />}

      {filteredSagas.map(saga => (
        <section key={saga.name} className="saga-section">
          <div className="saga-header">
            <h2 className="saga-title">{saga.name}</h2>
            <span className="saga-years">{saga.years}</span>
          </div>

          {saga.phases.map(phase => (
            <div key={phase.number} className="phase-section">
              <div className="phase-header">
                <h3 className="phase-title">Phase {phase.number}</h3>
                <span className="phase-meta">
                  {phase.years} · {isFiltering
                    ? `${phase.titles.length} of ${phase.total} titles`
                    : `${phase.total} titles · ${phase.movieCount} movies`}
                </span>
              </div>

              <div className="characters-scroll phase-scroll">
                {phase.titles.map(movie => (
                  <div key={movie.id} className="phase-card">
                    <MovieCard movie={movie} showYear={true} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default Phases;

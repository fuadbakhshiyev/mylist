import React, { useMemo, useState } from 'react';
import { mcuTimeline } from '../data/mcuData';
import { libraryOrder } from '../data/libraryOrder';
import MovieCard from '../components/MovieCard';
import TitleSearchBar, { TitleEmptyState, matchesTitleFilter } from '../components/TitleSearchBar';

const Library = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');

  // Sort all movies by the explicit libraryOrder array
  const sortedLibrary = useMemo(() => {
    const matchedItems = libraryOrder.map(title => {
      // Find exact match first
      let match = mcuTimeline.find(m => m.title === title);
      // If not found, try a more flexible match (some titles in data might have extra spaces or slight differences)
      if (!match) {
        match = mcuTimeline.find(m => m.title.toLowerCase().includes(title.toLowerCase()));
      }
      return match;
    }).filter(Boolean); // Remove any nulls if a title from the list isn't in data

    return matchedItems;
  }, []);

  const filteredLibrary = useMemo(() => {
    return sortedLibrary.filter(item => matchesTitleFilter(item, searchQuery, activeType));
  }, [sortedLibrary, searchQuery, activeType]);

  // Calculate stats
  const stats = useMemo(() => {
    let movies = 0;
    let series = 0;
    let specials = 0;

    sortedLibrary.forEach(item => {
      const type = item.type.toLowerCase();
      if (type === 'movie' || type === 'film') movies++;
      else if (type === 'series' || type === 'tv') series++;
      else if (type === 'special' || type === 'one-shot') specials++;
    });

    return { movies, series, specials };
  }, [sortedLibrary]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveType('all');
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '30px', padding: '0 20px' }}>

      {/* Hero Section */}
      <div
        className="library-hero"
        style={{ backgroundImage: `url('https://image.tmdb.org/t/p/original/mzzHr6g1yvl05ATCGhGL4vBhoEq.jpg')` }}
      >
        <div className="library-hero-content">
          <div className="library-overline">MCU COMPLETE LIBRARY</div>
          <h1 className="library-title">EVERY MCU MOVIE & TV SHOW</h1>
          <p className="library-desc">
            Browse all titles in release order. Each page includes cast, trailer, watch guide, and streaming info.
          </p>

          <div className="library-stats">
            <div className="stat-item">
              <span className="stat-count">{stats.movies}</span> Movies
            </div>
            <span className="stat-divider">·</span>
            <div className="stat-item">
              <span className="stat-count">{stats.series}</span> TV Series
            </div>
            <span className="stat-divider">·</span>
            <div className="stat-item">
              <span className="stat-count">{stats.specials}</span> Shorts & Specials
            </div>
          </div>
        </div>
      </div>

      <TitleSearchBar
        query={searchQuery}
        setQuery={setSearchQuery}
        type={activeType}
        setType={setActiveType}
        placeholder="Search the library..."
      />

      {/* Grid Section */}
      {filteredLibrary.length > 0 ? (
        <div className="library-grid">
          {filteredLibrary.map(item => (
            <MovieCard
              key={item.id}
              movie={item}
              showYear={true}
              compact={true}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <TitleEmptyState onReset={resetFilters} />
      )}

    </div>
  );
};

export default Library;

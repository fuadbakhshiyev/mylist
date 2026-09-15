import React, { useState, useMemo } from 'react';
import { getGroupedTimeline } from '../data/mcuData';
import { doomsdayFilters, rewatchFilters } from '../data/filters';
import MovieCard from '../components/MovieCard';
import SidebarFilter from '../components/SidebarFilter';
import UpcomingMovies from '../components/UpcomingMovies';
import JustReleased from '../components/JustReleased';
import { useLibrary } from '../context/LibraryContext';
import { titleMinutes } from '../utils/titleStats';
import { Search } from 'lucide-react';

const Timeline = () => {
  const [activeType, setActiveType] = useState('All'); // 'All', 'Unwatched', 'Movies', 'Series'
  const [searchQuery, setSearchQuery] = useState('');
  const { watchedIds: watchedMovies } = useLibrary();
  const [filterMode, setFilterMode] = useState('newbie'); // 'newbie', 'doomsday', 'rewatch'
  const [showNonMarvel, setShowNonMarvel] = useState(true);
  const [showSpoilers, setShowSpoilers] = useState(false);

  
  const allGroups = getGroupedTimeline();

  const filteredGroups = useMemo(() => {
    return allGroups.map(group => {
      return {
        ...group,
        items: group.items.map(item => {
          let finalItem = { ...item };
          if (filterMode === 'doomsday' && doomsdayFilters[item.title]) {
            finalItem = { ...finalItem, ...doomsdayFilters[item.title] };
          } else if (filterMode === 'rewatch' && rewatchFilters[item.title]) {
            finalItem = { ...finalItem, ...rewatchFilters[item.title] };
          }
          return finalItem;
        }).filter(item => {
          // Filter by mode
          if (filterMode === 'doomsday' && !doomsdayFilters[item.title]) return false;
          if (filterMode === 'rewatch' && !rewatchFilters[item.title]) return false;

          // Filter by search query
          if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }

          // Filter by Non-Marvel Studios
          if (!showNonMarvel && item.nonMarvelStudios) {
            return false;
          }

          // Filter by Type (All, Unwatched, Movies, Series, Special)
          if (activeType === 'Unwatched') {
            if (watchedMovies.has(item.id)) return false;
          } else if (activeType === 'Movies') {
            if (item.type.toLowerCase() !== 'movie' && item.type.toLowerCase() !== 'film') return false;
          } else if (activeType === 'Series') {
            if (item.type.toLowerCase() !== 'series' && item.type.toLowerCase() !== 'tv') return false;
          } else if (activeType === 'Special') {
            if (item.type.toLowerCase() !== 'special' && item.type.toLowerCase() !== 'one-shot') return false;
          }

          return true;
        })
      };
    }).filter(group => group.items.length > 0);
  }, [allGroups, activeType, searchQuery, watchedMovies, filterMode, showNonMarvel]);

  // Progress numbers for the active mode, from the titles that mode actually contains
  const modeStats = useMemo(() => {
    const modeFilters = filterMode === 'doomsday' ? doomsdayFilters : filterMode === 'rewatch' ? rewatchFilters : null;
    const items = allGroups
      .flatMap(group => group.items)
      .filter(item => !modeFilters || modeFilters[item.title])
      .map(item => (modeFilters ? { ...item, ...modeFilters[item.title] } : item));
    const remaining = items.filter(item => !watchedMovies.has(item.id));
    return {
      total: items.length,
      watched: items.length - remaining.length,
      remaining: remaining.length,
      // Modes relabel titles ("Essential for Doomsday", "★ MCU Essential"), so match the word, not the exact label
      essentialRemaining: remaining.filter(item => /essential/i.test(item.label || '')).length,
      remainingHours: Math.round(remaining.reduce((sum, item) => sum + titleMinutes(item.id), 0) / 60),
    };
  }, [allGroups, filterMode, watchedMovies]);

  return (
    <div className="timeline-container">
      {/* Main Content */}
      <div className="timeline-content">
        <div className="section-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>MCU Timeline</h1>
          <div className="search-section" style={{ margin: 0, width: '300px' }}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <SidebarFilter 
            activeType={activeType} 
            setActiveType={setActiveType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            showNonMarvel={showNonMarvel}
            setShowNonMarvel={setShowNonMarvel}
            showSpoilers={showSpoilers}
            setShowSpoilers={setShowSpoilers}
          />
        </div>

        <div className="stats-row animate-fade-in">
          <div className="stat-card">
            <div className="stat-value">{modeStats.total}</div>
            <div className="stat-label">TOTAL</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{modeStats.watched}</div>
            <div className="stat-label">WATCHED</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{modeStats.remaining}</div>
            <div className="stat-label">REMAINING</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{modeStats.essentialRemaining}</div>
            <div className="stat-label">ESSENTIAL REMAINING</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">~{modeStats.remainingHours}H</div>
            <div className="stat-label">REMAINING HOURS</div>
          </div>
        </div>

        <div>
          {filteredGroups.length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>No titles found matching the filters.</p>
          )}
          
          {filteredGroups.map((group, gIndex) => (
            <div key={group.name} className="animate-fade-in" style={{ animationDelay: `${gIndex * 0.1}s`, marginBottom: '60px' }}>
              <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>{group.name}</h2>
              <div className="grid-cards">
                {group.items.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    showSpoilers={showSpoilers}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Just Released Section */}
        <JustReleased />

        {/* Upcoming Movies Section */}
        <UpcomingMovies />
      </div>
    </div>
  );
};

export default Timeline;

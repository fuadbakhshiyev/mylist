import React, { useState, useMemo } from 'react';
import { getGroupedTimeline } from '../data/mcuData';
import { doomsdayFilters, rewatchFilters } from '../data/filters';
import MovieCard from '../components/MovieCard';
import SidebarFilter from '../components/SidebarFilter';
import UpcomingMovies from '../components/UpcomingMovies';
import JustReleased from '../components/JustReleased';
import { Check } from 'lucide-react';

const Timeline = () => {
  const [activeType, setActiveType] = useState('Tümü'); // 'Tümü', 'İzlenmeyenler', 'Filmler', 'Diziler'
  const [searchQuery, setSearchQuery] = useState('');
  const [watchedMovies, setWatchedMovies] = useState(new Set());
  const [filterMode, setFilterMode] = useState('newbie'); // 'newbie', 'doomsday', 'rewatch'

  
  const allGroups = getGroupedTimeline();

  const toggleWatch = (id) => {
    setWatchedMovies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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

          // Filter by Type (Tümü, İzlenmeyenler, Filmler, Diziler)
          if (activeType === 'İzlenmeyenler') {
            if (watchedMovies.has(item.id)) return false;
          } else if (activeType === 'Filmler') {
            if (item.type !== 'FİLM') return false;
          } else if (activeType === 'Diziler') {
            if (item.type !== 'DİZİ') return false;
          }

          return true;
        })
      };
    }).filter(group => group.items.length > 0);
  }, [allGroups, activeType, searchQuery, watchedMovies, filterMode]);

  return (
    <div className="timeline-layout">
      {/* Left Sidebar */}
      <SidebarFilter 
        activeType={activeType} 
        setActiveType={setActiveType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterMode={filterMode}
      />

      {/* Main Content */}
      <div className="timeline-content">
        <div className="section-header animate-fade-in">
          <h1>MCU Timeline</h1>
        </div>

        <div className="filter-options animate-fade-in" style={{ marginTop: '30px' }}>
          <div 
            className={`filter-card ${filterMode === 'newbie' ? 'active' : ''}`}
            onClick={() => setFilterMode('newbie')}
          >
            {filterMode === 'newbie' && <div className="filter-check"><Check size={16} /></div>}
            <div className="filter-icon bg-red">M</div>
            <div className="filter-title">Marvel'da Yeniyim</div>
            <div className="filter-subtitle">Her şey, sırasıyla, ilk izleyiş için</div>
          </div>

          <div 
            className={`filter-card doomsday-card ${filterMode === 'doomsday' ? 'active' : ''}`}
            onClick={() => setFilterMode('doomsday')}
          >
            {filterMode === 'doomsday' && <div className="filter-check"><Check size={16} /></div>}
            <div className="filter-icon bg-green">☢</div>
            <div className="filter-title">Doomsday'e Hazırlan</div>
            <div className="filter-subtitle">Sadece o filme götürenler</div>
          </div>

          <div 
            className={`filter-card doomsday-card ${filterMode === 'rewatch' ? 'active' : ''}`}
            onClick={() => setFilterMode('rewatch')}
          >
            {filterMode === 'rewatch' && <div className="filter-check"><Check size={16} /></div>}
            <div className="filter-icon" style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '2rem' }}>A</div>
            <div className="filter-title">Temelleri Yeniden İzle</div>
            <div className="filter-subtitle">Hepsini izledin mi? Tekrar izlemeye değerler</div>
          </div>
        </div>

        <div className="stats-row animate-fade-in">
          <div className="stat-card">
            <div className="stat-value">{filterMode === 'rewatch' ? 60 : filterMode === 'doomsday' ? 71 : 165}</div>
            <div className="stat-label">TOPLAM</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{watchedMovies.size}</div>
            <div className="stat-label">İZLENDİ</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(filterMode === 'rewatch' ? 60 : filterMode === 'doomsday' ? 71 : 165) - watchedMovies.size}</div>
            <div className="stat-label">KALAN</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{filterMode === 'rewatch' ? 51 : filterMode === 'doomsday' ? 54 : 52}</div>
            <div className="stat-label">TEMEL KALANLAR</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{filterMode === 'rewatch' ? '168SA' : filterMode === 'doomsday' ? '157SA' : '658SA'}</div>
            <div className="stat-label">KALAN SAATLER</div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
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
                    isWatched={watchedMovies.has(movie.id)}
                    onToggleWatch={() => toggleWatch(movie.id)}
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

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react';

const TYPES = ['All', 'Unwatched', 'Movies', 'Series', 'Special'];

const FilterDropdown = ({ label, align = 'left', children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        type="button"
        className={`filter-pill filter-dropdown-trigger ${open ? 'open' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {label}
        <ChevronDown size={16} className="filter-dropdown-chevron" />
      </button>
      {open && (
        <div className={`filter-dropdown-menu align-${align}`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

const SidebarFilter = ({ activeType, setActiveType, searchQuery, setSearchQuery, filterMode, setFilterMode, showNonMarvel, setShowNonMarvel, showSpoilers, setShowSpoilers }) => {
  const isDoomsday = filterMode === 'doomsday';
  const isRewatch = filterMode === 'rewatch';
  const showNonMarvelToggle = !isDoomsday && !isRewatch;
  const activeOptionsCount = (showNonMarvelToggle && showNonMarvel ? 1 : 0) + (showSpoilers ? 1 : 0);

  return (
    <aside className="sidebar-filter glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '16px 24px' }}>

      {/* Left Side: Modes & Types */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="sidebar-modes" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
          <div
            className={`sidebar-mode-pill ${filterMode === 'newbie' ? 'active' : ''}`}
            onClick={() => setFilterMode('newbie')}
          >
            <img src="https://image.tmdb.org/t/p/w500/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg" alt="Newbie" className="mode-pill-img" /> New to Marvel
          </div>
          <div
            className={`sidebar-mode-pill ${filterMode === 'doomsday' ? 'active' : ''}`}
            onClick={() => setFilterMode('doomsday')}
          >
            <img src="https://image.tmdb.org/t/p/w500/s4v0UX1anfXm0UvloLsTTJ4v222.jpg" alt="Doomsday" className="mode-pill-img" /> Doomsday
          </div>
          <div
            className={`sidebar-mode-pill ${filterMode === 'rewatch' ? 'active' : ''}`}
            onClick={() => setFilterMode('rewatch')}
          >
            <img src="https://image.tmdb.org/t/p/w500/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg" alt="Rewatch" className="mode-pill-img" /> Rewatch
          </div>
        </div>
      </div>

      {/* Right Side: Type & Options Dropdowns */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <FilterDropdown
          label={
            <>
              {activeType !== 'All' && <span className={`pill-dot dot-${activeType.toLowerCase()}`}></span>}
              {activeType === 'All' ? 'All types' : activeType}
            </>
          }
        >
          {(close) => TYPES.map(type => (
            <button
              key={type}
              type="button"
              className={`filter-dropdown-item ${activeType === type ? 'active' : ''}`}
              onClick={() => { setActiveType(type); close(); }}
            >
              <span className={`pill-dot dot-${type.toLowerCase()}`}></span>
              {type}
              {activeType === type && <Check size={16} className="filter-dropdown-check" />}
            </button>
          ))}
        </FilterDropdown>

        <FilterDropdown
          align="right"
          label={
            <>
              <SlidersHorizontal size={16} />
              Options
              {activeOptionsCount > 0 && <span className="filter-dropdown-count">{activeOptionsCount}</span>}
            </>
          }
        >
          {() => (
            <div className="filter-dropdown-toggles">
              {showNonMarvelToggle && (
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showNonMarvel}
                    onChange={(e) => setShowNonMarvel(e.target.checked)}
                  />
                  <span className="slider"></span>
                  <span className="toggle-label text-uppercase" style={{ fontSize: '0.85rem' }}>Non-Marvel</span>
                </label>
              )}

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showSpoilers}
                  onChange={(e) => setShowSpoilers(e.target.checked)}
                />
                <span className="slider"></span>
                <span className="toggle-label" style={{ fontSize: '0.85rem' }}>Spoilers</span>
              </label>
            </div>
          )}
        </FilterDropdown>
      </div>

    </aside>
  );
};

export default SidebarFilter;

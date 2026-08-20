import React from 'react';
import { Search } from 'lucide-react';

const SidebarFilter = ({ activeType, setActiveType, searchQuery, setSearchQuery, filterMode }) => {
  const isDoomsday = filterMode === 'doomsday';
  const isRewatch = filterMode === 'rewatch';

  return (
    <aside className="sidebar-filter glass">
      <div className="sidebar-header">
        {isDoomsday ? (
          <div className="m-logo" style={{ background: '#10b981', color: '#000', border: '2px solid #065f46' }}>☢</div>
        ) : isRewatch ? (
          <div className="m-logo" style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '2rem' }}>A</div>
        ) : (
          <div className="m-logo">M</div>
        )}
        <h2 style={{ color: isDoomsday ? '#10b981' : isRewatch ? 'white' : 'var(--accent-color)' }}>
          {isDoomsday ? "DOOMSDAY HAZIRLIK LİSTENİZ" : isRewatch ? "TEMELLERİ YENİDEN İZLEME LİSTEN" : "TÜM MCU HİKAYESİ"}
        </h2>
      </div>

      <div className="filter-section">
        <label className="filter-label">TÜR</label>
        <div className="filter-pills">
          {['Tümü', 'İzlenmeyenler', 'Filmler', 'Diziler'].map(type => (
            <button
              key={type}
              className={`filter-pill ${activeType === type ? 'active' : ''}`}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {(!isDoomsday && !isRewatch) && (
        <div className="filter-section">
          <label className="filter-label">EVRENLER</label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>MARVEL STUDIOS DIŞI</span>
          </label>
          <p className="checkbox-desc">
            Fox, Sony, Blade ve Marvel Studios dışındaki diğer yapımlar ayrı sürekliliklerdir. 
            Karakterleri paylaştıkları ve birçoğu çoklu evrene bağlandığı için buradalar — izlemek ya da filtrelemek size kalmış.
          </p>
        </div>
      )}

      <div className="search-section">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Ara..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="legend-section">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#facc15' }}></span> Film
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#38bdf8' }}></span> Dizi
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#c084fc' }}></span> Özel
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ef4444' }}></span> Dönüm Noktası
          </div>
          {isDoomsday ? (
            <>
              <div className="legend-item">
                <span className="legend-circle" style={{ color: '#10b981' }}>☢</span> Temel
              </div>
              <div className="legend-item">
                <span className="legend-circle">?</span> Doğrulanmadı
              </div>
            </>
          ) : (
            <>
              <div className="legend-item">
                <span className="legend-star">★</span> Temel
              </div>
              <div className="legend-item">
                <span className="legend-circle">○</span> Opsiyonel
              </div>
            </>
          )}
        </div>
        <p className="legend-desc">
          {isDoomsday 
            ? "Temel, hikayenin oradan geçtiği anlamına gelir. İsteğe bağlı, bir karakterin oradan geldiği anlamına gelir."
            : "Temel, ana hikayenin oradan geçtiği anlamına gelir. Opsiyonel, atlasanız da takip edebileceğiniz anlamına gelir."}
        </p>
      </div>
    </aside>
  );
};

export default SidebarFilter;

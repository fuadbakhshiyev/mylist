import React, { useState, useMemo } from 'react';
import { ExternalLink, Heart, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { allCharacters } from '../data/charactersData';
import { heroesData } from '../data/heroesData';
import { mcuTimeline } from '../data/mcuData';
import MovieCard from '../components/MovieCard';
import Modal from '../components/Modal';
import { useLibrary } from '../context/LibraryContext';
import { useLibraryActions } from '../hooks/useLibraryActions';

const FavoriteButton = ({ active, onClick }) => (
  <button type="button" className={`md-action md-action-favorite modal-favorite ${active ? 'active' : ''}`} onClick={onClick}>
    <Heart size={18} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
    <span>{active ? 'Favorited' : 'Favorite'}</span>
  </button>
);

const titlesById = Object.fromEntries(mcuTimeline.map(movie => [movie.id, movie]));

// Let clickable cards work from the keyboard too
const activateOnKey = (callback) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    callback();
  }
};

export const HeroModal = ({ hero, details, onClose }) => {
  const { has, toggleFavorite } = useLibraryActions();
  const info = details?.[hero.heroName];
  const titles = (info?.mcu.titleIds || []).map(id => titlesById[id]).filter(Boolean);

  return (
    <Modal onClose={onClose} labelledBy="hero-modal-title" maxWidth={860}>
      <div className="hero-modal-header">
        <img src={hero.image} alt={hero.heroName} className="hero-modal-image" referrerPolicy="no-referrer" />
        <div className="hero-modal-intro">
          <h2 id="hero-modal-title">{hero.heroName}</h2>
          <FavoriteButton
            active={has('likedHeroes', hero.heroName)}
            onClick={() => toggleFavorite('likedHeroes', hero.heroName)}
          />
          {!details && <p className="hero-modal-muted">Loading…</p>}
          {details && info?.wiki && (
            <>
              {info.wiki.description && <span className="hero-modal-description">{info.wiki.description}</span>}
              <p className="hero-modal-extract">{info.wiki.extract}</p>
              <a href={info.wiki.url} target="_blank" rel="noreferrer" className="hero-modal-link">
                Read more on Wikipedia <ExternalLink size={14} />
              </a>
            </>
          )}
          {details && !info?.wiki && <p className="hero-modal-muted">No summary available for this character yet.</p>}
        </div>
      </div>

      {details && (
        <section className="hero-modal-section">
          <h3>In the MCU</h3>
          {info?.mcu.actors.length > 0 ? (
            <>
              <div className="hero-modal-actors">
                {info.mcu.actors.map(actor => (
                  <div key={actor.name} className="hero-modal-actor">
                    {actor.image ? (
                      <img src={actor.image} alt="" />
                    ) : (
                      <span className="hero-modal-actor-placeholder">{actor.name.charAt(0)}</span>
                    )}
                    <div>
                      <strong>{actor.name}</strong>
                      <span>{actor.character} · {actor.count} {actor.count === 1 ? 'title' : 'titles'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hero-modal-titles">
                {titles.map(movie => (
                  <div key={movie.id} className="hero-modal-title-card">
                    <MovieCard movie={movie} compact={true} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="hero-modal-muted">This character hasn't appeared in any title on the timeline yet.</p>
          )}
        </section>
      )}

      {info?.wiki && (
        <p className="hero-modal-attribution">Summary from Wikipedia, available under CC BY-SA 4.0.</p>
      )}
    </Modal>
  );
};

export const ActorModal = ({ actor, onClose }) => {
  const { has, toggleFavorite } = useLibraryActions();
  const titles = (actor.movies || []).map(id => titlesById[id]).filter(Boolean);

  return (
    <Modal onClose={onClose} labelledBy="actor-modal-title">
      <div className="actor-modal-header">
        {actor.image ? (
          <img src={actor.image} alt={actor.actorName} className="actor-modal-image" />
        ) : (
          <span className="actor-modal-image actor-modal-placeholder">{actor.actorName.charAt(0)}</span>
        )}
        <div>
          <h2 id="actor-modal-title">{actor.actorName}</h2>
          <p className="hero-modal-muted">as {actor.characterName}</p>
        </div>
        <FavoriteButton
          active={has('likedActors', actor.actorName)}
          onClick={() => toggleFavorite('likedActors', actor.actorName)}
        />
      </div>

      <section className="hero-modal-section">
        <h3>Appears In ({titles.length})</h3>
        <div className="hero-modal-titles">
          {titles.map(movie => (
            <div key={movie.id} className="hero-modal-title-card">
              <MovieCard movie={movie} compact={true} showYear={true} />
            </div>
          ))}
        </div>
      </section>
    </Modal>
  );
};

const Characters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Tab lives in the URL (?tab=actors) so other pages can link straight to it
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'actors' ? 'actors' : 'heroes';
  const setActiveTab = (tab) => setSearchParams(tab === 'actors' ? { tab } : {}, { replace: true });
  const { has } = useLibrary();
  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedHero, setSelectedHero] = useState(null);
  const [heroDetails, setHeroDetails] = useState(null);

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter(char =>
      char.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.characterName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredHeroes = useMemo(() => {
    return heroesData.filter(hero =>
      hero.heroName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Hero info is loaded on first open to keep the page bundle small
  const openHero = (hero) => {
    setSelectedHero(hero);
    if (!heroDetails) {
      import('../data/heroDetails')
        .then(module => setHeroDetails(module.heroDetails))
        .catch(() => setHeroDetails({}));
    }
  };

  return (
    <div className="characters-page animate-fade-in" style={{ padding: '40px 0' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h1 className="section-title" style={{ fontSize: '2.5rem', margin: 0 }}>Marvel Universe</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '30px' }}>
        <div className="segmented-control" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'heroes'}
            className={`segmented-control-item ${activeTab === 'heroes' ? 'active' : ''}`}
            onClick={() => setActiveTab('heroes')}
          >
            Heroes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'actors'}
            className={`segmented-control-item ${activeTab === 'actors' ? 'active' : ''}`}
            onClick={() => setActiveTab('actors')}
          >
            Actors & Cast
          </button>
        </div>

        <div className="search-section" style={{ margin: 0, width: '300px', maxWidth: '100%' }}>
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder={activeTab === 'heroes' ? "Search heroes..." : "Search characters or actors..."}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="characters-grid">
        {activeTab === 'actors' ? (
          filteredCharacters.map((char, idx) => (
            <div
              key={idx}
              className="character-card"
              role="button"
              tabIndex={0}
              aria-label={`${char.actorName} as ${char.characterName}${has('likedActors', char.actorName) ? ', favorited' : ''}`}
              onClick={() => setSelectedActor(char)}
              onKeyDown={activateOnKey(() => setSelectedActor(char))}
              style={{ cursor: 'pointer' }}
            >
              {has('likedActors', char.actorName) && (
                <span className="favorite-badge" aria-hidden="true"><Heart size={14} fill="currentColor" /></span>
              )}
              <div className="character-card-img-wrap">
                {char.image ? (
                  <img src={char.image} alt={char.characterName} />
                ) : (
                  <div className="placeholder-img">{char.characterName.charAt(0)}</div>
                )}
              </div>
              <div className="character-card-info">
                <h3>{char.characterName}</h3>
                <p>{char.actorName}</p>
                <span className="appearance-badge">{char.count} Appearances</span>
              </div>
            </div>
          ))
        ) : (
          filteredHeroes.map((hero, idx) => (
            <div
              key={idx}
              className="character-card hero-card"
              role="button"
              tabIndex={0}
              aria-label={`${hero.heroName}${has('likedHeroes', hero.heroName) ? ', favorited' : ''}`}
              onClick={() => openHero(hero)}
              onKeyDown={activateOnKey(() => openHero(hero))}
              style={{ cursor: 'pointer' }}
            >
              {has('likedHeroes', hero.heroName) && (
                <span className="favorite-badge" aria-hidden="true"><Heart size={14} fill="currentColor" /></span>
              )}
              <div className="character-card-img-wrap" style={{ borderRadius: '12px', width: '100%', height: '220px', border: 'none', padding: 0 }}>
                {hero.image ? (
                  <img src={hero.image} alt={hero.heroName} style={{ borderRadius: '12px' }} />
                ) : (
                  <div className="placeholder-img">{hero.heroName.charAt(0)}</div>
                )}
              </div>
              <div className="character-card-info" style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '18px' }}>{hero.heroName}</h3>
              </div>
            </div>
          ))
        )}
      </div>

      {activeTab === 'actors' && filteredCharacters.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          No actors found for "{searchQuery}".
        </div>
      )}
      {activeTab === 'heroes' && filteredHeroes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          No heroes found for "{searchQuery}".
        </div>
      )}

      {selectedHero && (
        <HeroModal hero={selectedHero} details={heroDetails} onClose={() => setSelectedHero(null)} />
      )}

      {selectedActor && (
        <ActorModal actor={selectedActor} onClose={() => setSelectedActor(null)} />
      )}
    </div>
  );
};

export default Characters;

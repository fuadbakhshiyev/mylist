import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Check, Heart, UserRound } from 'lucide-react';
import { mcuTimeline } from '../data/mcuData';
import { titleDetails } from '../data/titleDetails';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { titlesById } from '../utils/titleStats';
import { SORT_LABELS, sectionByKey } from '../utils/profileSections';
import MovieCard from '../components/MovieCard';
import { TYPE_FILTERS } from '../components/TitleSearchBar';
import {
  ActorTile, HeroTile, ProfileSignIn, ProfileTabs,
  actorsByName, heroesByName, useHeroDetails,
} from '../components/ProfileItems';
import { ActorModal, HeroModal } from './Characters';

const SECTION_ICONS = { watchlist: Bookmark, watched: Check, favorites: Heart, actors: UserRound, heroes: Heart };
const timelineIndex = Object.fromEntries(mcuTimeline.map((movie, index) => [movie.id, index]));
const sortStorageKey = (key) => `mcu-tracker:sort:${key}`;

const readSort = (key) => {
  const section = sectionByKey[key];
  if (!section) return null;
  try {
    const saved = localStorage.getItem(sortStorageKey(key));
    return section.sorts.includes(saved) ? saved : section.defaultSort;
  } catch {
    return section.defaultSort;
  }
};

const releaseTime = (id) => {
  const date = titleDetails[id]?.releaseDate;
  return date ? new Date(date).getTime() : Infinity;
};

const ProfileList = () => {
  const { section: sectionKey } = useParams();
  const section = sectionByKey[sectionKey];
  const { user } = useAuth();
  const { items, addedAt } = useLibrary();
  const [type, setType] = useState('all');
  const [sort, setSort] = useState(() => readSort(sectionKey));
  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedHero, setSelectedHero] = useState(null);
  const [heroDetails, loadHeroDetails] = useHeroDetails();

  // Each section keeps its own remembered sort; the type filter resets when switching sections
  useEffect(() => {
    setType('all');
    setSort(readSort(sectionKey));
  }, [sectionKey]);

  const ids = useMemo(() => (section ? items(section.list) : []), [section, items]);

  const entries = useMemo(() => {
    if (!section) return [];
    const byAdded = (a, b) => (addedAt(section.list, b) || 0) - (addedAt(section.list, a) || 0);

    if (section.kind === 'actor') {
      const actors = ids.map(name => actorsByName[name]).filter(Boolean);
      if (sort === 'name') return actors.sort((a, b) => a.actorName.localeCompare(b.actorName));
      if (sort === 'appearances') return actors.sort((a, b) => b.count - a.count);
      return actors.sort((a, b) => byAdded(a.actorName, b.actorName));
    }

    if (section.kind === 'hero') {
      const heroes = ids.map(name => heroesByName[name]).filter(Boolean);
      if (sort === 'name') return heroes.sort((a, b) => a.heroName.localeCompare(b.heroName));
      return heroes.sort((a, b) => byAdded(a.heroName, b.heroName));
    }

    const titles = ids.map(id => titlesById[id]).filter(Boolean).filter(movie => type === 'all' || movie.type === type);
    const sorters = {
      order: (a, b) => timelineIndex[a.id] - timelineIndex[b.id],
      added: (a, b) => byAdded(a.id, b.id),
      release: (a, b) => releaseTime(a.id) - releaseTime(b.id),
      title: (a, b) => a.title.localeCompare(b.title),
      rating: (a, b) => (Number(titleDetails[b.id]?.rating) || 0) - (Number(titleDetails[a.id]?.rating) || 0),
    };
    return titles.sort(sorters[sort] || sorters.order);
  }, [section, ids, sort, type, addedAt]);

  if (!section) return <Navigate to="/profile" replace />;
  if (!user) return <ProfileSignIn next={`/profile/${sectionKey}`} />;

  const Icon = SECTION_ICONS[section.key];
  const total = ids.length;
  const isTitleList = section.kind === 'title';
  const typeLabel = TYPE_FILTERS.find(filter => filter.value === type)?.label || '';

  const changeSort = (value) => {
    setSort(value);
    try {
      localStorage.setItem(sortStorageKey(sectionKey), value);
    } catch {
      // Sort choice just won't be remembered
    }
  };

  const openHero = (hero) => {
    setSelectedHero(hero);
    loadHeroDetails();
  };

  return (
    <div className="profile-page animate-fade-in">
      <Link to="/profile" className="profile-back">
        <ArrowLeft size={16} aria-hidden="true" /> Profile
      </Link>

      <ProfileTabs />

      <h1 className="profile-list-title">
        {section.title}{' '}
        <span>· {isTitleList && type !== 'all' ? `${entries.length} of ${total}` : total}</span>
      </h1>

      {total === 0 ? (
        <div className="profile-empty">
          <span className="profile-empty-icon" aria-hidden="true"><Icon size={32} /></span>
          <h2>{section.empty.headline}</h2>
          <p>{section.empty.body}</p>
          <Link to={section.empty.ctaTo} className="btn btn-primary">{section.empty.cta}</Link>
        </div>
      ) : (
        <>
          <div className="profile-list-toolbar">
            {isTitleList ? (
              <div className="segmented-control" role="tablist" aria-label="Filter by type">
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
            ) : <span />}

            <label className="profile-sort">
              Sort
              <select value={sort} onChange={(e) => changeSort(e.target.value)}>
                {section.sorts.map(option => (
                  <option key={option} value={option}>
                    {option === 'added' && section.key === 'watched' ? 'Recently watched' : SORT_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {entries.length === 0 ? (
            <div className="title-empty-state">
              <p>No {typeLabel.toLowerCase()} in your {section.title.toLowerCase()}.</p>
              <button type="button" className="filter-pill" onClick={() => setType('all')}>Show all</button>
            </div>
          ) : section.kind === 'actor' ? (
            <div className="profile-people-grid">
              {entries.map(actor => <ActorTile key={actor.actorName} actor={actor} onOpen={setSelectedActor} />)}
            </div>
          ) : section.kind === 'hero' ? (
            <div className="profile-hero-grid">
              {entries.map(hero => <HeroTile key={hero.heroName} hero={hero} onOpen={openHero} />)}
            </div>
          ) : (
            <div className="library-grid profile-grid">
              {entries.map(movie => (
                <MovieCard key={movie.id} movie={movie} compact={true} showActions={true} showYear={sort !== 'order'} />
              ))}
            </div>
          )}
        </>
      )}

      {selectedHero && <HeroModal hero={selectedHero} details={heroDetails} onClose={() => setSelectedHero(null)} />}
      {selectedActor && <ActorModal actor={selectedActor} onClose={() => setSelectedActor(null)} />}
    </div>
  );
};

export default ProfileList;

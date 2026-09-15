import React, { useCallback, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Check } from 'lucide-react';
import { allCharacters } from '../data/charactersData';
import { heroesData } from '../data/heroesData';
import { useLibrary } from '../context/LibraryContext';
import { PROFILE_SECTIONS } from '../utils/profileSections';

export const actorsByName = Object.fromEntries(allCharacters.map(actor => [actor.actorName, actor]));
export const heroesByName = Object.fromEntries(heroesData.map(hero => [hero.heroName, hero]));

export const initials = (name = '') => name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();

// Hero info is loaded on first use to keep page bundles small
export const useHeroDetails = () => {
  const [details, setDetails] = useState(null);
  const load = useCallback(() => {
    if (details) return;
    import('../data/heroDetails')
      .then(module => setDetails(module.heroDetails))
      .catch(() => setDetails({}));
  }, [details]);
  return [details, load];
};

export const TitlePoster = ({ movie, watched = false }) => (
  <Link to={`/movie/${movie.id}`} className="profile-poster" aria-label={`${movie.title}${watched ? ', watched' : ''}`}>
    <img src={movie.poster} alt="" referrerPolicy="no-referrer" loading="lazy" />
    {watched && (
      <span className="card-watched-badge" aria-hidden="true">
        <Check size={12} strokeWidth={3} />
      </span>
    )}
  </Link>
);

export const ActorTile = ({ actor, onOpen }) => (
  <button type="button" className="profile-actor" onClick={() => onOpen(actor)}>
    {actor.image ? (
      <img src={actor.image} alt="" loading="lazy" />
    ) : (
      <span className="profile-actor-placeholder" aria-hidden="true">{initials(actor.actorName)}</span>
    )}
    <span className="profile-tile-name">{actor.actorName}</span>
    <span className="profile-tile-meta">{actor.count} MCU {actor.count === 1 ? 'title' : 'titles'}</span>
  </button>
);

export const HeroTile = ({ hero, onOpen }) => (
  <button type="button" className="profile-hero" onClick={() => onOpen(hero)}>
    <img src={hero.image} alt="" referrerPolicy="no-referrer" loading="lazy" />
    <span className="profile-tile-name">{hero.heroName}</span>
  </button>
);

export const ProfileSignIn = ({ next }) => (
  <div className="profile-signin animate-fade-in">
    <h1>Log in to see your profile</h1>
    <p>Your watched titles, watchlist and favorites are saved in your account on this browser.</p>
    <div className="profile-signin-actions">
      <Link to={`/login?next=${encodeURIComponent(next)}`} className="btn btn-primary">Log in</Link>
      <Link to={`/signup?next=${encodeURIComponent(next)}`} className="btn profile-secondary-btn">Create account</Link>
    </div>
  </div>
);

export const ProfileTabs = () => {
  const { counts } = useLibrary();
  return (
    <nav className="profile-tabs" aria-label="Profile sections">
      <NavLink to="/profile" end className={({ isActive }) => `profile-tab ${isActive ? 'active' : ''}`}>
        Overview
      </NavLink>
      {PROFILE_SECTIONS.map(section => (
        <NavLink
          key={section.key}
          to={`/profile/${section.key}`}
          className={({ isActive }) => `profile-tab ${isActive ? 'active' : ''}`}
        >
          {section.key === 'favorites' ? 'Favorites' : section.key === 'actors' ? 'Actors' : section.key === 'heroes' ? 'Heroes' : section.title}
          <span>{counts[section.list]}</span>
        </NavLink>
      ))}
    </nav>
  );
};

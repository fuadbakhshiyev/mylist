import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mcuTimeline } from '../data/mcuData';
import { decodeProfile } from '../utils/shareProfile';
import { formatHours, titleMinutes, titlesById } from '../utils/titleStats';
import {
  ActorTile, HeroTile, TitlePoster,
  actorsByName, heroesByName, initials, useHeroDetails,
} from '../components/ProfileItems';
import { ActorModal, HeroModal } from './Characters';

const RING = 2 * Math.PI * 52;

// Read-only view of a profile that came in through a share link
const SharedProfile = () => {
  const location = useLocation();
  const payload = (location.hash || '').replace(/^#/, '');
  const profile = useMemo(() => decodeProfile(payload), [payload]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedHero, setSelectedHero] = useState(null);
  const [heroDetails, loadHeroDetails] = useHeroDetails();

  const progress = useMemo(() => {
    if (!profile) return null;
    const watchedSet = new Set(profile.watched);
    const watched = mcuTimeline.filter(movie => watchedSet.has(movie.id));
    const byType = (type) => ({
      watched: watched.filter(movie => movie.type === type).length,
      total: mcuTimeline.filter(movie => movie.type === type).length,
    });
    return {
      watched: watched.length,
      total: mcuTimeline.length,
      minutes: watched.reduce((sum, movie) => sum + titleMinutes(movie.id), 0),
      films: byType('Movie'),
      series: byType('TV'),
      specials: byType('Special'),
    };
  }, [profile]);

  if (!profile) {
    return (
      <div className="profile-signin animate-fade-in">
        <h1>This share link doesn't work</h1>
        <p>The link is incomplete or was copied only in part. Ask for the full link, or start your own progress here.</p>
        <div className="profile-signin-actions">
          <Link to="/timeline" className="btn btn-primary">Open the timeline</Link>
        </div>
      </div>
    );
  }

  const percent = Math.round((progress.watched / progress.total) * 100);
  const joined = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const openHero = (hero) => {
    setSelectedHero(hero);
    loadHeroDetails();
  };

  const sections = [
    { key: 'watchlist', title: 'Watchlist', kind: 'title', ids: profile.watchlist },
    { key: 'watched', title: 'Watched', kind: 'title', ids: profile.watched },
    { key: 'favorites', title: 'Favorite titles', kind: 'title', ids: profile.favorites },
    { key: 'actors', title: 'Favorite actors', kind: 'actor', ids: profile.actors },
    { key: 'heroes', title: 'Favorite heroes', kind: 'hero', ids: profile.heroes },
  ].filter(section => section.ids.length > 0);

  const renderItems = (section) => section.ids.map(id => {
    if (section.kind === 'actor') {
      const actor = actorsByName[id];
      return actor ? <ActorTile key={id} actor={actor} onOpen={setSelectedActor} /> : null;
    }
    if (section.kind === 'hero') {
      const hero = heroesByName[id];
      return hero ? <HeroTile key={id} hero={hero} onOpen={openHero} /> : null;
    }
    const movie = titlesById[id];
    return movie ? <TitlePoster key={id} movie={movie} /> : null;
  });

  return (
    <div className="profile-page animate-fade-in">
      <div className="shared-banner">
        <span>Shared profile · a snapshot, it does not update on its own</span>
        <Link to="/signup" className="btn btn-primary">Create your own</Link>
      </div>

      {profile.stale && (
        <p className="shared-stale" role="status">
          This link was made with an older version of the catalogue, so a few titles may be listed incorrectly.
        </p>
      )}

      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">{initials(profile.name)}</div>
        <div className="profile-identity">
          <h1>{profile.name}</h1>
          <p className="profile-joined">Joined {joined}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        </div>
      </header>

      <section className="profile-card profile-progress-card" aria-labelledby="shared-progress-label">
        <div className="profile-progress-main">
          <div
            className="profile-ring"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.watched}
            aria-valuetext={`${progress.watched} of ${progress.total} titles watched`}
          >
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="profile-ring-track" cx="60" cy="60" r="52" />
              <circle
                className="profile-ring-fill"
                cx="60"
                cy="60"
                r="52"
                style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - percent / 100) }}
              />
            </svg>
            <div className="profile-ring-value">
              <strong>{percent}%</strong>
              <span>watched</span>
            </div>
          </div>

          <div className="profile-progress-text">
            <p id="shared-progress-label" className="profile-card-label">MCU progress</p>
            <p className="profile-progress-count">
              <strong>{progress.watched}</strong> of {progress.total} titles
            </p>
            <p className="profile-caption">{formatHours(progress.minutes)} watched</p>
          </div>
        </div>

        <dl className="profile-stats">
          <div className="profile-stat">
            <dt>Films</dt>
            <dd>{progress.films.watched}<span> / {progress.films.total}</span></dd>
          </div>
          <div className="profile-stat">
            <dt>Series</dt>
            <dd>{progress.series.watched}<span> / {progress.series.total}</span></dd>
          </div>
          <div className="profile-stat">
            <dt>Specials</dt>
            <dd>{progress.specials.watched}<span> / {progress.specials.total}</span></dd>
          </div>
          <div className="profile-stat">
            <dt>Watched</dt>
            <dd>{formatHours(progress.minutes)}</dd>
          </div>
        </dl>
      </section>

      <div className="shared-sections">
        {sections.map(section => (
          <section key={section.key} className="profile-row" aria-labelledby={`shared-row-${section.key}`}>
            <div className="profile-row-header">
              <h2 id={`shared-row-${section.key}`}>
                {section.title} <span>· {section.ids.length}</span>
              </h2>
            </div>
            <div className="profile-row-items">{renderItems(section)}</div>
          </section>
        ))}
      </div>

      {selectedHero && <HeroModal hero={selectedHero} details={heroDetails} onClose={() => setSelectedHero(null)} />}
      {selectedActor && <ActorModal actor={selectedActor} onClose={() => setSelectedActor(null)} />}
    </div>
  );
};

export default SharedProfile;

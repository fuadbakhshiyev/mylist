import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, LogOut, Pencil } from 'lucide-react';
import { mcuTimeline } from '../data/mcuData';
import { titleDetails } from '../data/titleDetails';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { useLibraryActions } from '../hooks/useLibraryActions';
import { formatHours, isUpcoming, titleMinutes, titlesById } from '../utils/titleStats';
import { PROFILE_SECTIONS } from '../utils/profileSections';
import Modal from '../components/Modal';
import {
  ActorTile, HeroTile, ProfileSignIn, ProfileTabs, TitlePoster,
  actorsByName, heroesByName, initials, useHeroDetails,
} from '../components/ProfileItems';
import { ActorModal, HeroModal } from './Characters';

const ROW_LIMIT = 7;
const RING = 2 * Math.PI * 52; // circumference of the progress ring

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [error, setError] = useState('');
  const changed = name !== user.name || bio !== (user.bio || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a name to show on your profile.');
      return;
    }
    onSave({ name: name.trim(), bio: bio.trim() });
  };

  return (
    <Modal onClose={onClose} labelledBy="edit-profile-title" maxWidth={480}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h2 id="edit-profile-title" className="auth-title">Edit profile</h2>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="edit-profile-name">Name</label>
            {name.length >= 30 && <span className="auth-counter">{name.length}/40</span>}
          </div>
          <input
            id="edit-profile-name"
            className="auth-input"
            value={name}
            maxLength={40}
            autoComplete="name"
            onChange={(e) => { setName(e.target.value); setError(''); }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'edit-profile-name-error' : 'edit-profile-name-help'}
          />
          {error ? (
            <p id="edit-profile-name-error" className="auth-error">{error}</p>
          ) : (
            <p id="edit-profile-name-help" className="auth-counter">Shown on your profile.</p>
          )}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="edit-profile-bio">Bio</label>
            <span className="auth-counter">{bio.length}/160</span>
          </div>
          <textarea
            id="edit-profile-bio"
            className="auth-input"
            value={bio}
            maxLength={160}
            placeholder="Favorite phase, favorite hero, how far you are…"
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="edit-profile-actions">
          <button type="button" className="btn profile-secondary-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!changed}>Save changes</button>
        </div>
      </form>
    </Modal>
  );
};

const Profile = () => {
  const { user, logOut, updateProfile } = useAuth();
  const { items, watchedIds, counts } = useLibrary();
  const { toggleWatched } = useLibraryActions();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedHero, setSelectedHero] = useState(null);
  const [heroDetails, loadHeroDetails] = useHeroDetails();

  const progress = useMemo(() => {
    const watched = mcuTimeline.filter(movie => watchedIds.has(movie.id));
    const byType = (type) => ({
      watched: watched.filter(movie => movie.type === type).length,
      total: mcuTimeline.filter(movie => movie.type === type).length,
    });
    return {
      watched: watched.length,
      total: mcuTimeline.length,
      minutes: watched.reduce((sum, movie) => sum + titleMinutes(movie.id), 0),
      // Time left counts released titles only, so an unreleased film can't inflate it
      remainingMinutes: mcuTimeline
        .filter(movie => !watchedIds.has(movie.id) && !isUpcoming(movie.id))
        .reduce((sum, movie) => sum + titleMinutes(movie.id), 0),
      films: byType('Movie'),
      series: byType('TV'),
      specials: byType('Special'),
    };
  }, [watchedIds]);

  // First released title in watch order that isn't watched yet
  const upNext = useMemo(() => mcuTimeline.find(movie => !watchedIds.has(movie.id) && !isUpcoming(movie.id)), [watchedIds]);

  if (!user) return <ProfileSignIn next="/profile" />;

  const percent = Math.round((progress.watched / progress.total) * 100);
  const joined = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isBrandNew = Object.values(counts).every(count => count === 0);

  const openHero = (hero) => {
    setSelectedHero(hero);
    loadHeroDetails();
  };

  const renderRowItems = (section, ids) => ids.slice(0, ROW_LIMIT).map(id => {
    if (section.kind === 'actor') {
      const actor = actorsByName[id];
      return actor ? <ActorTile key={id} actor={actor} onOpen={setSelectedActor} /> : null;
    }
    if (section.kind === 'hero') {
      const hero = heroesByName[id];
      return hero ? <HeroTile key={id} hero={hero} onOpen={openHero} /> : null;
    }
    const movie = titlesById[id];
    if (!movie) return null;
    return <TitlePoster key={id} movie={movie} watched={section.key !== 'watched' && watchedIds.has(id)} />;
  });

  return (
    <div className="profile-page animate-fade-in">
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">{initials(user.name)}</div>
        <div className="profile-identity">
          <h1>{user.name}</h1>
          <p className="profile-joined">Joined {joined}</p>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
        </div>
        <div className="profile-header-actions">
          <button type="button" className="btn profile-secondary-btn" onClick={() => setEditing(true)}>
            <Pencil size={16} aria-hidden="true" /> Edit profile
          </button>
          <button
            type="button"
            className="btn profile-secondary-btn"
            onClick={() => {
              logOut();
              navigate('/');
            }}
          >
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      </header>

      <div className="profile-summary">
        <section className="profile-card profile-progress-card" aria-labelledby="profile-progress-label">
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
              <p id="profile-progress-label" className="profile-card-label">MCU progress</p>
              <p className="profile-progress-count">
                <strong>{progress.watched}</strong> of {progress.total} titles
              </p>
              <p className="profile-caption">
                {progress.total - progress.watched} left · {formatHours(progress.remainingMinutes)} to go
              </p>
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

          <p className="profile-caption">Counts what you've marked in MCU Tracker.</p>
        </section>

        <section className="profile-card profile-upnext-card" aria-labelledby="profile-upnext-label">
          <p id="profile-upnext-label" className="profile-card-label">
            Up next{upNext ? ` · #${Number(upNext.order)}` : ''}
          </p>
          {upNext ? (
            <div className="profile-upnext">
              <Link to={`/movie/${upNext.id}`} className="profile-upnext-poster" aria-hidden="true" tabIndex={-1}>
                <img src={upNext.poster} alt="" referrerPolicy="no-referrer" />
              </Link>
              <div className="profile-upnext-body">
                <Link to={`/movie/${upNext.id}`} className="profile-upnext-title">{upNext.title}</Link>
                <p className="profile-upnext-meta">
                  {upNext.type === 'Movie' ? 'Film' : upNext.type === 'TV' ? 'Series' : 'Special'}
                  {titleDetails[upNext.id]?.duration ? ` · ${titleDetails[upNext.id].duration}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <p className="profile-caption">You're all caught up with every released title.</p>
          )}

          {/* Full card width, so both buttons fit on one row */}
          {upNext && (
            <div className="profile-upnext-actions">
              <button type="button" className="md-action md-action-watched" onClick={() => toggleWatched(upNext.id)}>
                <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                <span>Mark watched</span>
              </button>
              <Link to={`/movie/${upNext.id}`} className="md-action">Details</Link>
            </div>
          )}
        </section>
      </div>

      <ProfileTabs />

      {isBrandNew ? (
        <section className="profile-card profile-start">
          <h2>Start tracking your MCU journey</h2>
          <p>Mark what you've already watched, or start from the first title in the watch order.</p>
          <div className="profile-start-actions">
            <Link to="/timeline" className="btn btn-primary">Open the timeline</Link>
            <Link to="/library" className="btn profile-secondary-btn">Browse the library</Link>
          </div>
        </section>
      ) : (
        PROFILE_SECTIONS.map(section => {
          const ids = items(section.list);
          return (
            <section key={section.key} className="profile-row" aria-labelledby={`profile-row-${section.key}`}>
              <div className="profile-row-header">
                <h2 id={`profile-row-${section.key}`}>
                  {section.rowTitle} <span>· {ids.length}</span>
                </h2>
                {ids.length > 0 && (
                  <Link to={`/profile/${section.key}`} className="profile-see-all">
                    See all <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
              {ids.length === 0 ? (
                <div className="profile-row-empty">
                  <span>{section.empty.inline}</span>
                  <Link to={section.empty.ctaTo}>{section.empty.cta} →</Link>
                </div>
              ) : (
                <div className="profile-row-items">{renderRowItems(section, ids)}</div>
              )}
            </section>
          );
        })
      )}

      {editing && (
        <EditProfileModal
          user={user}
          onClose={() => setEditing(false)}
          onSave={(patch) => {
            updateProfile(patch);
            setEditing(false);
            showToast({ message: 'Profile updated.' });
          }}
        />
      )}

      {selectedHero && <HeroModal hero={selectedHero} details={heroDetails} onClose={() => setSelectedHero(null)} />}
      {selectedActor && <ActorModal actor={selectedActor} onClose={() => setSelectedActor(null)} />}
    </div>
  );
};

export default Profile;

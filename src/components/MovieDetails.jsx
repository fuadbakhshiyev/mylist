import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, Check, Heart, Star } from 'lucide-react';
import { mcuTimeline } from '../data/mcuData';
import { titleDetails } from '../data/titleDetails';
import { titleEditorial } from '../data/titleEditorial';
import MovieCard from './MovieCard';
import { useLibraryActions } from '../hooks/useLibraryActions';

const LABEL_MEANINGS = {
  Essential: 'a must-watch for following the main MCU story',
  Recommended: 'adds depth and context, but is not required',
  Optional: 'safe to skip if you only follow the main story',
};

const getInitials = (name) => name.split(' ').map(part => part[0]).slice(0, 2).join('');

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const index = useMemo(() => mcuTimeline.findIndex(m => m.id === id), [id]);

  // TMDB data fills in facts; hand-written text in mcuData wins, then generated editorial notes
  const movie = useMemo(() => {
    const base = mcuTimeline[index];
    if (!base) return null;
    const tmdb = titleDetails[id] || {};
    const editorial = titleEditorial[id] || {};

    return {
      ...base,
      overview: tmdb.overview || base.overview,
      quote: base.quote || tmdb.tagline,
      releaseDate: tmdb.releaseDate || base.releaseDate,
      duration: tmdb.duration || base.duration,
      rating: tmdb.rating || base.rating,
      trailerId: tmdb.trailerId || null,
      cast: tmdb.cast || [],
      genres: tmdb.genres || [],
      directors: tmdb.directors || [],
      creditLabel: tmdb.tmdb?.type === 'tv' ? 'Created by' : 'Directed by',
      backdrop: tmdb.backdrop,
      sceneOf: tmdb.sceneOf,
      imdb: tmdb.imdbUrl
        ? { url: tmdb.imdbUrl, rating: tmdb.imdbRating, votes: tmdb.imdbVotes, scope: tmdb.imdbScope }
        : null,
      howToWatch: base.howToWatch || editorial.howToWatch,
      watchNote: base.watchNote || editorial.watchNote,
      whyItMatters: base.whyItMatters || editorial.whyItMatters,
      whereItFits: base.whereItFits || `${base.title} sits at position ${Number(base.order)} of ${mcuTimeline.length} in the MCU's story-chronological order, within ${base.groupName}. It is rated ${base.label} — ${LABEL_MEANINGS[base.label] || 'part of the wider MCU'}.`,
    };
  }, [id, index]);

  // Hand-picked related titles first, then titles sharing the most cast members
  const relatedMovies = useMemo(() => {
    if (!movie) return [];
    const handPicked = (movie.related || []).map(relId => mcuTimeline.find(m => m.id === relId)).filter(Boolean);
    const castNames = new Set(movie.cast.map(person => person.name));
    const ownTmdb = titleDetails[id]?.tmdb;

    const byCast = mcuTimeline
      .map((m, i) => {
        const details = titleDetails[m.id];
        if (m.id === id || !details || details.sceneOf || handPicked.includes(m)) return null;
        if (ownTmdb && details.tmdb.type === ownTmdb.type && details.tmdb.id === ownTmdb.id && details.tmdb.season === ownTmdb.season) return null;
        const shared = details.cast.filter(person => castNames.has(person.name)).length;
        return shared > 0 ? { movie: m, shared, distance: Math.abs(i - index) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.shared - a.shared || a.distance - b.distance)
      .map(entry => entry.movie);

    return [...handPicked, ...byCast].slice(0, 4);
  }, [movie, id, index]);

  const { has, toggleWatched, toggleWatchlist, toggleFavorite } = useLibraryActions();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!movie) {
    return (
      <div className="section" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Movie not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/timeline')} style={{ marginTop: '20px' }}>
          Back to Timeline
        </button>
      </div>
    );
  }

  const previous = mcuTimeline[index - 1];
  const next = mcuTimeline[index + 1];
  const isUpcoming = movie.releaseDate && new Date(movie.releaseDate) > new Date();
  const watched = has('watched', movie.id);
  const inWatchlist = has('watchlist', movie.id);
  const favorite = has('favorites', movie.id);

  const bgStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 23, 0.4) 0%, rgba(15, 15, 23, 1) 100%), url(${movie.backdrop || movie.poster})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center 20%',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="movie-details-page animate-fade-in">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      {/* Hero Section */}
      <div className="md-hero" style={bgStyle}>
        <div className="md-hero-content">
          <div className="md-poster-wrap">
            <img src={movie.poster} alt={movie.title} className="md-poster" referrerPolicy="no-referrer" />
          </div>

          <div className="md-info">
            <div className="md-meta-top">
              <span className={`cover-badge type-${movie.type.toLowerCase()}`}>{movie.type.toUpperCase()}</span>
              <span className="md-group">{movie.groupName}</span>
            </div>

            <h1 className="md-title">{movie.title.toUpperCase()}</h1>

            {movie.quote && <p className="md-quote">"{movie.quote}"</p>}

            <div className="md-meta-bottom">
              <span className="md-release">{isUpcoming ? 'RELEASES' : 'RELEASED'} {movie.releaseDate || 'TBD'}</span>
              {movie.duration && <span className="md-duration">{movie.duration}</span>}
              {movie.imdb && (
                <a
                  href={movie.imdb.url}
                  target="_blank"
                  rel="noreferrer"
                  className="md-imdb"
                  title={
                    movie.imdb.scope === 'series' ? 'IMDb rating for the whole series'
                      : movie.imdb.scope === 'parent' ? `IMDb rating for ${movie.sceneOf}`
                      : 'Open on IMDb'
                  }
                >
                  <span className="md-imdb-logo">IMDb</span>
                  {movie.imdb.rating ? (
                    <span>{movie.imdb.rating}<small>/10</small></span>
                  ) : (
                    <span className="md-imdb-muted">Not rated yet</span>
                  )}
                  {movie.imdb.votes > 0 && (
                    <small>{new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(movie.imdb.votes)} votes</small>
                  )}
                  {movie.imdb.scope === 'series' && <small>· series</small>}
                </a>
              )}
              {movie.rating && <span className="md-rating"><Star size={14} fill="#f1c40f" color="#f1c40f"/> {movie.rating} TMDB</span>}
              {movie.label && <span className={`card-content-label ${movie.labelClass}`}>{movie.label} to the MCU</span>}
            </div>

            {/* Unreleased titles can only be saved to the watchlist */}
            <div className="md-actions">
              {!isUpcoming && (
                <button
                  type="button"
                  className={`md-action md-action-watched ${watched ? 'active' : ''}`}
                  title={watched ? 'Watched — click to undo' : 'Mark as watched'}
                  onClick={() => toggleWatched(movie.id)}
                >
                  <Check size={18} strokeWidth={watched ? 3 : 2.5} aria-hidden="true" />
                  <span>{watched ? 'Watched' : 'Mark watched'}</span>
                </button>
              )}
              <button
                type="button"
                className={`md-action md-action-watchlist ${inWatchlist ? 'active' : ''}`}
                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                onClick={() => toggleWatchlist(movie.id)}
              >
                <Bookmark size={18} fill={inWatchlist ? 'currentColor' : 'none'} aria-hidden="true" />
                <span>{inWatchlist ? 'In watchlist' : 'Watchlist'}</span>
              </button>
              {!isUpcoming && (
                <button
                  type="button"
                  className={`md-action md-action-favorite ${favorite ? 'active' : ''}`}
                  title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={() => toggleFavorite('favorites', movie.id)}
                >
                  <Heart size={18} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
                  <span>{favorite ? 'Favorited' : 'Favorite'}</span>
                </button>
              )}
            </div>

            {(movie.genres.length > 0 || movie.directors.length > 0) && (
              <div className="md-genres">
                {movie.genres.map(genre => <span key={genre} className="md-genre">{genre}</span>)}
                {movie.directors.length > 0 && (
                  <span className="md-credit">{movie.creditLabel} {movie.directors.join(', ')}</span>
                )}
              </div>
            )}

            {movie.overview && <p className="md-overview">{movie.overview}</p>}
          </div>
        </div>
      </div>

      <div className="md-main-content">
        {/* Watch Guidelines */}
        {(movie.sceneOf || movie.howToWatch || movie.watchNote) && (
          <div className="md-watch-guide">
            {movie.sceneOf && (
              <div className="md-alert md-alert-info">
                <div className="md-alert-header">
                  <span className="md-alert-title">CREDITS SCENE</span>
                </div>
                <p>This entry is only the credits scene from {movie.sceneOf}. Watch just the scene at this point in the timeline — the details on this page are for the full title.</p>
              </div>
            )}

            {movie.howToWatch && (
              <div className="md-alert md-alert-info">
                <div className="md-alert-header">
                  <span className="md-alert-title">HOW TO WATCH</span>
                </div>
                <p>{movie.howToWatch}</p>
              </div>
            )}

            {movie.watchNote && (
              <div className="md-alert md-alert-danger">
                <div className="md-alert-header">
                  <span className="md-alert-title">WATCH NOTE</span>
                </div>
                <p>{movie.watchNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Deep Dive */}
        <div className="md-deep-dive">
          {movie.whyItMatters && (
            <div className="md-card">
              <h3>WHY IT MATTERS IN THE MCU</h3>
              <p>{movie.whyItMatters}</p>
            </div>
          )}

          <div className="md-card">
            <h3>WHERE IT FITS IN THE MCU</h3>
            <p>{movie.whereItFits}</p>
            {(previous || next) && (
              <div className="md-timeline-nav">
                {previous ? (
                  <Link to={`/movie/${previous.id}`} className="md-timeline-link">
                    <ArrowLeft size={16} />
                    <span><small>Previous</small>{previous.title}</span>
                  </Link>
                ) : <span />}
                {next && (
                  <Link to={`/movie/${next.id}`} className="md-timeline-link md-timeline-link-next">
                    <span><small>Next</small>{next.title}</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trailer */}
        {movie.trailerId && (
          <div className="md-section">
            <h3>OFFICIAL TRAILER</h3>
            <div className="md-video-container">
              <iframe
                src={`https://www.youtube.com/embed/${movie.trailerId}`}
                title={`${movie.title} trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Cast */}
        {movie.cast.length > 0 && (
          <div className="md-section">
            <h3>CAST</h3>
            <div className="md-cast-grid">
              {movie.cast.map((person, idx) => (
                <div key={idx} className="md-cast-card">
                  {person.image ? (
                    <img src={person.image} alt={person.name} loading="lazy" />
                  ) : (
                    <div className="md-cast-placeholder" aria-hidden="true">{getInitials(person.name)}</div>
                  )}
                  <h4>{person.name}</h4>
                  <p>{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Titles */}
        {relatedMovies.length > 0 && (
          <div className="md-section">
            <h3>RELATED TITLES</h3>
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {relatedMovies.map(rel => (
                <MovieCard key={rel.id} movie={rel} compact={true} />
              ))}
            </div>
          </div>
        )}

        {titleDetails[id] && (
          <p className="md-attribution">
            Movie data and images from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
            {titleDetails[id].imdbUrl && ' IMDb ratings: information courtesy of IMDb (imdb.com). Used with permission.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;

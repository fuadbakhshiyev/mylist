import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Check, Heart, Plus } from 'lucide-react';
import { useLibraryActions } from '../hooks/useLibraryActions';
import { isUpcoming } from '../utils/titleStats';

const getTypeClass = (type) => {
  switch(type?.toLowerCase()) {
    case 'movie': case 'film': return 'movie';
    case 'series': case 'tv': return 'tv';
    case 'special': case 'one-shot': return 'special';
    default: return 'movie';
  }
};

const MovieCard = ({ movie, compact = false, showYear = false, showSpoilers = false, showActions = !compact }) => {
  const { has, toggleWatched, toggleWatchlist, toggleFavorite } = useLibraryActions();
  const upcoming = isUpcoming(movie.id);
  const watched = has('watched', movie.id);
  const inWatchlist = has('watchlist', movie.id);
  const favorite = has('favorites', movie.id);

  // Card buttons sit next to (not inside) the title link, so clicks must not reach it
  const act = (handler) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  };

  return (
    <div className={`movie-card animate-fade-in ${compact ? 'compact' : ''}`}>
      <div className="card-image-wrap">
        <img
          src={movie.poster}
          alt=""
          className="card-image"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x750/2a2a35/a0a0b0?text=' + encodeURIComponent(movie.title);
          }}
        />

        {/* Cover Overlay Top Left - Type */}
        <div className={`cover-badge top-left text-uppercase type-${getTypeClass(movie.type)}`}>
          {movie.type.toUpperCase() === 'MOVIE' ? 'FILM' : movie.type.toUpperCase()}
        </div>

        {/* Cover Overlay Top Right - Rating ONLY */}
        <div className="cover-badge top-right text-right">
          <span className="rating-star">⭐{movie.rating}</span>
        </div>

        {/* Cover Overlay Bottom Left - Order and Label */}
        <div className="cover-badge-wrapper bottom-left">
          {(!showYear && movie.order) && <span className="order-badge">{movie.order}</span>}
        </div>

        {/* Watched marker on compact cards without buttons */}
        {!showActions && watched && (
          <span className="card-watched-badge">
            <Check size={12} strokeWidth={3} aria-hidden="true" />
            <span className="sr-only">Watched</span>
          </span>
        )}

        {/* Actions: favorite, watchlist, watched (upcoming titles can only be saved to the watchlist) */}
        {showActions && (
          <div className="card-actions">
            {!upcoming && (
              <button
                type="button"
                className={`card-action card-action-favorite ${favorite ? 'active' : ''}`}
                aria-pressed={favorite}
                aria-label={`Favorite: ${movie.title}`}
                title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={act(() => toggleFavorite('favorites', movie.id))}
              >
                <Heart size={16} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className={`card-action card-action-watchlist ${inWatchlist ? 'active' : ''}`}
              aria-pressed={inWatchlist}
              aria-label={`Watchlist: ${movie.title}`}
              title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              onClick={act(() => toggleWatchlist(movie.id))}
            >
              {inWatchlist ? <BookmarkCheck size={16} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
            </button>
            {!upcoming && (
              <button
                type="button"
                className={`card-action card-action-watched ${watched ? 'active' : ''}`}
                aria-pressed={watched}
                aria-label={`Watched: ${movie.title}`}
                title={watched ? 'Watched — click to undo' : 'Mark as watched'}
                onClick={act(() => toggleWatched(movie.id))}
              >
                <Check size={18} strokeWidth={watched ? 3 : 2.5} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Spoiler Overlay */}
        {showSpoilers && movie.spoiler && (
          <div className="spoiler-overlay">
            <div className="spoiler-text-content">
              {movie.spoiler}
            </div>
          </div>
        )}
      </div>
      <div className="card-content">
        <div className="card-content-header">
          <div className="card-content-info">
            {(!compact && movie.label) && <div className={`card-content-label ${movie.labelClass || ''}`}>{movie.label}</div>}
            <h3 className="card-title">
              {/* Stretched link: the whole card opens the title page and is reachable by keyboard */}
              <Link to={`/movie/${movie.id}`} className="card-link">{movie.title}</Link>
            </h3>
            {showYear && movie.releaseDate && (
              <div className="card-year">
                {movie.releaseDate.split(',').pop().trim().substring(0, 4)}
              </div>
            )}
          </div>
        </div>
        {(!compact && !showYear) && (
          <p className="card-desc">
            {movie.desc}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;

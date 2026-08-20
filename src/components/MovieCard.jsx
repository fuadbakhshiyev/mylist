import React from 'react';
import { Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie, isWatched, onToggleWatch }) => {
  const navigate = useNavigate();

  const getTypeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'movie': return 'type-movie';
      case 'tv': return 'type-tv';
      case 'special': return 'type-special';
      case 'milestone': return 'type-milestone';
      default: return '';
    }
  };

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleToggleWatch = (e) => {
    e.stopPropagation();
    if (onToggleWatch) onToggleWatch(); // We just call it, Timeline handles the id
  };

  return (
    <div className="movie-card animate-fade-in" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="card-image-wrap">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="card-image"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x750/2a2a35/a0a0b0?text=' + encodeURIComponent(movie.title);
          }}
        />
        
        {/* Cover Overlay Top Left - Type */}
        <div className={`cover-badge top-left text-uppercase ${getTypeClass(movie.type)}`}>{movie.type}</div>
        
        {/* Cover Overlay Top Right - Rating ONLY */}
        <div className="cover-badge top-right text-right">
          <span className="rating-star">⭐{movie.rating}</span>
        </div>
        
        {/* Cover Overlay Bottom Left - Order and Label */}
        <div className="cover-badge-wrapper bottom-left">
          {movie.order && <span className="order-badge">{movie.order}</span>}
        </div>
        
        {/* Cover Overlay Bottom Right - Watched Button */}
        <button 
          className={`circle-btn-overlay ${isWatched ? 'watched' : ''}`}
          onClick={handleToggleWatch}
          title={isWatched ? "Remove from Watched" : "Mark as Watched"}
        >
          {isWatched ? <Check size={20} /> : <Plus size={20} />}
        </button>
      </div>
      <div className="card-content">
        <div className="card-content-header">
          <div className="card-content-info">
            {movie.label && <div className={`card-content-label ${movie.labelClass || ''}`}>{movie.label}</div>}
            <h3 className="card-title">
              {movie.title}
            </h3>
          </div>
        </div>
        <p className="card-desc">
          {movie.desc}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;

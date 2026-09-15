import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, AlertCircle, Info, Star } from 'lucide-react';
import { mcuTimeline } from '../data/mcuData';
import MovieCard from './MovieCard';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const movie = useMemo(() => mcuTimeline.find(m => m.id === id), [id]);
  
  const relatedMovies = useMemo(() => {
    if (!movie || !movie.related) return [];
    return movie.related.map(relId => mcuTimeline.find(m => m.id === relId)).filter(Boolean);
  }, [movie]);

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

  // Find background image - use poster for now but blur it if needed
  const bgStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 23, 0.4) 0%, rgba(15, 15, 23, 1) 100%), url(${movie.poster})`,
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
            <img src={movie.poster} alt={movie.title} className="md-poster" />
            <button className="md-cta-btn">
              4K / Blu-ray
            </button>
          </div>
          
          <div className="md-info">
            <div className="md-meta-top">
              <span className={`cover-badge type-${movie.type.toLowerCase()}`}>{movie.type.toUpperCase()}</span>
              <span className="md-group">{movie.groupName}</span>
            </div>
            
            <h1 className="md-title">{movie.title.toUpperCase()}</h1>
            
            {movie.quote && <p className="md-quote">"{movie.quote}"</p>}
            
            <div className="md-meta-bottom">
              <span className="md-release">RELEASED {movie.releaseDate || 'TBD'}</span>
              {movie.duration && <span className="md-duration">{movie.duration}</span>}
              <span className="md-rating"><Star size={14} fill="#f1c40f" color="#f1c40f"/> {movie.rating} TMDB</span>
              {movie.label && <span className={`card-content-label ${movie.labelClass}`}>{movie.label} to the MCU</span>}
            </div>

            {movie.overview && <p className="md-overview">{movie.overview}</p>}
          </div>
        </div>
      </div>

      <div className="md-main-content">
        {/* Watch Guidelines */}
        {(movie.howToWatch || movie.watchNote) && (
          <div className="md-watch-guide">
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
          
          {movie.whereItFits && (
            <div className="md-card">
              <h3>WHERE IT FITS IN THE MCU</h3>
              <p>{movie.whereItFits}</p>
            </div>
          )}
        </div>

        {/* Trailer */}
        {movie.trailerId && (
          <div className="md-section">
            <h3>OFFICIAL TRAILER</h3>
            <div className="md-video-container">
              <iframe 
                src={`https://www.youtube.com/embed/${movie.trailerId}`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="md-section">
            <h3>CAST</h3>
            <div className="md-cast-grid">
              {movie.cast.map((person, idx) => (
                <div key={idx} className="md-cast-card">
                  <img src={person.image} alt={person.name} />
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
      </div>
    </div>
  );
};

export default MovieDetails;

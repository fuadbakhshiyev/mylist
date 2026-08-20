import React from 'react';
import { Play } from 'lucide-react';

const justReleasedData = [
  {
    id: "spidey-brand-new-day",
    title: "SPIDER-MAN: BRAND NEW DAY",
    releaseDate: "IN THEATERS JULY 29, 2026",
    tagline: "A brand new day starts now.",
    poster: "https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg",
  },
  {
    id: "punisher-one-last-kill",
    title: "THE PUNISHER: ONE LAST KILL",
    releaseDate: "IN THEATERS MAY 12, 2026",
    tagline: "Hey Frank.",
    poster: "https://image.tmdb.org/t/p/w500/qQclTgLMDvGBuUBFGHRipxkEwWR.jpg",
  }
];

const JustReleased = () => {
  return (
    <section className="upcoming-section animate-fade-in" style={{ marginTop: '40px', marginBottom: '80px' }}>
      <div className="upcoming-header">
        <h2 className="upcoming-title">JUST RELEASED</h2>
        <a href="#" className="upcoming-view-all">View all &rarr;</a>
      </div>
      
      <div className="upcoming-grid">
        {justReleasedData.map(movie => (
          <div key={movie.id} className="upcoming-card">
            <div className="upcoming-image-wrap">
              <img src={movie.poster} alt={movie.title} className="upcoming-image" />
              <button className="upcoming-trailer-btn">
                <Play size={12} fill="#ff3b30" color="#ff3b30" /> Trailer
              </button>
            </div>
            <div className="upcoming-content">
              <h3 className="upcoming-movie-title">{movie.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</h3>
              <p className="upcoming-release" style={{ color: '#2ecc71' }}>{movie.releaseDate}</p>
              {movie.tagline && <p className="upcoming-tagline">{movie.tagline}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default JustReleased;

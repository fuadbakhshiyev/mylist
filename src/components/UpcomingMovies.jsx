import React from 'react';
import { Play } from 'lucide-react';

const upcomingData = [
  {
    id: "spidey-halloween",
    title: "SPIDEY AND THE AVENGERS:\nHALLOWEEN TEAM-UP!",
    releaseDate: "RELEASES SEPTEMBER 24, 2026",
    poster: "https://image.tmdb.org/t/p/w500/hPucpn2pmszkcqRVHmrlUYK0PtG.jpg",
  },
  {
    id: "avengers-doomsday",
    title: "AVENGERS: DOOMSDAY",
    releaseDate: "RELEASES DECEMBER 16, 2026",
    poster: "https://image.tmdb.org/t/p/w500/jzPwsojjFStf5lR5Nm07w2hH56G.jpg",
  }
];

const UpcomingMovies = () => {
  return (
    <section className="upcoming-section animate-fade-in" style={{ marginTop: '80px', marginBottom: '80px' }}>
      <div className="upcoming-header">
        <h2 className="upcoming-title">UPCOMING MARVEL MOVIES</h2>
        <a href="#" className="upcoming-view-all">View all &rarr;</a>
      </div>
      
      <div className="upcoming-grid">
        {upcomingData.map(movie => (
          <div key={movie.id} className="upcoming-card">
            <div className="upcoming-image-wrap">
              <img src={movie.poster} alt={movie.title} className="upcoming-image" />
              <button className="upcoming-trailer-btn">
                <Play size={12} fill="#ff3b30" color="#ff3b30" /> Trailer
              </button>
            </div>
            <div className="upcoming-content">
              <h3 className="upcoming-movie-title">{movie.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</h3>
              <p className="upcoming-release">{movie.releaseDate}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingMovies;

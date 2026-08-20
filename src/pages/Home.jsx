import React from 'react';
import { Link } from 'react-router-dom';
import { mcuTimeline, newsArticles } from '../data/mcuData';
import MovieCard from '../components/MovieCard';
import { ArrowRight, Play } from 'lucide-react';

const Home = () => {
  const upcomingMovies = mcuTimeline.filter(movie => movie.upcoming);

  return (
    <div>
      <section className="hero animate-fade-in">
        <h1>Prepare for Doomsday</h1>
        <p>Track your Marvel Cinematic Universe progress. All titles sorted by importance. Updated for Avengers: Doomsday 2026.</p>
        <Link to="/timeline" className="btn btn-primary">
          <Play size={18} /> Start Watching
        </Link>
      </section>

      <section className="section animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <h2 className="section-title">Upcoming Releases</h2>
          <Link to="/timeline" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid-cards">
          {upcomingMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="section animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2 className="section-title">Latest News</h2>
        </div>
        <div className="news-list">
          {newsArticles.map(article => (
            <a href="#" key={article.id} className="news-item">
              <h3 className="news-title">{article.title}</h3>
              <span className="news-date">{article.date}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

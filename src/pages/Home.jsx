import React from 'react';
import { Link } from 'react-router-dom';
import { mcuTimeline, newsArticles } from '../data/mcuData';
import MovieCard from '../components/MovieCard';
import { ArrowRight, Play } from 'lucide-react';

const Home = () => {
  const latestPhase = mcuTimeline[mcuTimeline.length - 1].groupName;
  const roadToDoomsday = mcuTimeline.filter(movie => movie.groupName === latestPhase).slice(-4);
  const essentials = mcuTimeline.filter(movie => movie.label === 'Essential');
  const doomsday = mcuTimeline.find(movie => movie.id === 'avengers-doomsday');

  const stats = [
    { value: mcuTimeline.length, label: 'Titles' },
    { value: essentials.length, label: 'Essential' },
    { value: mcuTimeline.filter(movie => movie.type === 'Movie').length, label: 'Movies' },
    { value: mcuTimeline.filter(movie => movie.type === 'TV').length, label: 'Series' },
  ];

  return (
    <div>
      <section className="home-hero animate-fade-in">
        {doomsday && <img src={doomsday.poster} alt="" className="home-hero-backdrop" referrerPolicy="no-referrer" />}
        <div className="hero">
          <span className="home-hero-eyebrow">Phase 6 · Avengers: Doomsday</span>
          <h1>Prepare for Doomsday</h1>
          <p>Track your Marvel Cinematic Universe progress. All titles sorted by importance. Updated for Avengers: Doomsday 2026.</p>
          <div className="home-hero-actions">
            <Link to="/timeline" className="btn btn-primary">
              <Play size={18} /> Start Watching
            </Link>
            <Link to="/library" className="btn home-hero-secondary">
              Browse Library
            </Link>
          </div>
          <div className="home-hero-stats">
            {stats.map(stat => (
              <div key={stat.label} className="home-hero-stat">
                <span className="home-hero-stat-value">{stat.value}</span>
                <span className="home-hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <h2 className="section-title">Road to Doomsday</h2>
          <Link to="/timeline" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid-cards">
          {roadToDoomsday.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="section animate-fade-in" style={{ animationDelay: '0.125s' }}>
        <div className="section-header">
          <h2 className="section-title">Start with the Essentials</h2>
          <Link to="/timeline" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid-cards">
          {essentials.slice(0, 4).map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="section animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <div className="section-header">
          <h2 className="section-title">Popular Characters</h2>
        </div>
        <div className="characters-scroll">
          {[
            { name: 'Iron Man', actor: 'Robert Downey Jr.', img: 'https://image.tmdb.org/t/p/w200/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg' },
            { name: 'Captain America', actor: 'Chris Evans', img: 'https://image.tmdb.org/t/p/w200/3bOGNsHlrswhyW79uvIHH1V43JI.jpg' },
            { name: 'Thor', actor: 'Chris Hemsworth', img: 'https://image.tmdb.org/t/p/w200/piQGdoIQOF3C1EI5cbYZLAW1gfj.jpg' },
            { name: 'Spider-Man', actor: 'Tom Holland', img: 'https://image.tmdb.org/t/p/w200/xKBAaPIa1c7tzZD3Y0MhBLv4hPE.jpg' },
            { name: 'Black Widow', actor: 'Scarlett Johansson', img: 'https://image.tmdb.org/t/p/w200/druW5adKddizHNSoPbI0q7Mvn0K.jpg' },
            { name: 'Wolverine', actor: 'Hugh Jackman', img: 'https://image.tmdb.org/t/p/w200/4Xujtewxqt6aU0Y81tsS9gkjizk.jpg' },
            { name: 'Deadpool', actor: 'Ryan Reynolds', img: 'https://image.tmdb.org/t/p/w200/trzgptffGvAlAT6MEu01fz47cLW.jpg' },
            { name: 'Scarlet Witch', actor: 'Elizabeth Olsen', img: 'https://image.tmdb.org/t/p/w200/wIU675y4dofIDVuhaNWPizJNtep.jpg' },
            { name: 'Doctor Strange', actor: 'Benedict Cumberbatch', img: 'https://image.tmdb.org/t/p/w200/wz3MRiMmoz6b5X3oSzMRC9nLxY1.jpg' },
            { name: 'Black Panther', actor: 'Chadwick Boseman', img: 'https://image.tmdb.org/t/p/w200/nL16SKfyP1b7Hk6LsuWiqMfbdb8.jpg' },
          ].map((char, idx) => (
            <div key={idx} className="character-bubble">
              <div className="char-img-wrap">
                <img src={char.img} alt={char.name} />
              </div>
              <h4>{char.name}</h4>
              <p>{char.actor}</p>
            </div>
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

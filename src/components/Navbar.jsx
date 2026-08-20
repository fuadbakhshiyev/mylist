import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar glass">
      <Link to="/" className="nav-brand">
        <Film size={24} color="var(--accent-color)" />
        MCU<span>Tracker</span>
      </Link>
      
      <div className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/timeline" 
          className={`nav-link ${location.pathname === '/timeline' ? 'active' : ''}`}
        >
          Timeline
        </Link>
        <a href="#" className="nav-link">Characters</a>
        <a href="#" className="nav-link">Phases</a>
      </div>
    </nav>
  );
};

export default Navbar;

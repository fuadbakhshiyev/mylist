import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bookmark, Film, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initials } from './ProfileItems';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/library', label: 'Library' },
  { to: '/characters', label: 'Characters' },
  { to: '/phases', label: 'Phases' },
];

const UserMenu = ({ user, onLogOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click or Escape (focus returns to the avatar)
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="nav-user-menu" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className="nav-avatar"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen(o => !o)}
      >
        {initials(user.name)}
      </button>
      {open && (
        <div className="filter-dropdown-menu align-right">
          <div className="nav-user-menu-header">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link to="/profile" className="filter-dropdown-item" onClick={close}>
            <UserRound size={16} aria-hidden="true" /> Profile
          </Link>
          <Link to="/profile/watchlist" className="filter-dropdown-item" onClick={close}>
            <Bookmark size={16} aria-hidden="true" /> Watchlist
          </Link>
          <button
            type="button"
            className="filter-dropdown-item"
            onClick={() => {
              close();
              onLogOut();
            }}
          >
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-icon">
            <Film size={18} />
          </span>
          <span className="nav-brand-text">
            MCU <span>Tracker</span>
          </span>
        </Link>

        <div className="nav-links">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Kept outside the scrolling links so it never scrolls away on phones */}
        <div className="nav-account">
          {user ? (
            <UserMenu
              user={user}
              onLogOut={() => {
                logOut();
                navigate('/');
              }}
            />
          ) : (
            <>
              <Link to="/login" className="nav-login">Log in</Link>
              <Link to="/signup" className="nav-signup">Sign up</Link>
              <Link to="/login" className="nav-guest-icon" aria-label="Log in">
                <UserRound size={18} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

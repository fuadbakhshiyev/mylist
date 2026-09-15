import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Library from './pages/Library';
import Characters from './pages/Characters';
import Phases from './pages/Phases';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import ProfileList from './pages/ProfileList';
import MovieDetails from './components/MovieDetails';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LibraryProvider>
          <ToastProvider>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/characters" element={<Characters />} />
                  <Route path="/phases" element={<Phases />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/login" element={<Auth mode="login" />} />
                  <Route path="/signup" element={<Auth mode="signup" />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:section" element={<ProfileList />} />
                </Routes>
              </main>
            </div>
            <AuthModal />
          </ToastProvider>
        </LibraryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

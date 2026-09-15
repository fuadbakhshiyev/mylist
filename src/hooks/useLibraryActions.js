import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';

const FAVORITE_SECTIONS = { favorites: 'favorites', likedActors: 'actors', likedHeroes: 'heroes' };

// List toggles with the confirmation toasts used everywhere in the app.
// Plain watched toggles get no toast: the button state is the feedback, and Timeline users mark many titles in a row.
export const useLibraryActions = () => {
  const { has, toggle, setInList } = useLibrary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const toggleWatched = useCallback((id) => {
    const result = toggle('watched', id);
    if (result.applied && result.removedFromWatchlist) {
      showToast({
        message: 'Marked watched · removed from watchlist',
        actionLabel: 'Undo',
        onAction: () => {
          setInList('watched', id, false);
          setInList('watchlist', id, true);
        },
      });
    }
    return result;
  }, [toggle, setInList, showToast]);

  const toggleWatchlist = useCallback((id) => {
    const result = toggle('watchlist', id);
    if (!result.applied) return result;
    if (result.added) {
      showToast({ message: 'Added to watchlist', actionLabel: 'View', onAction: () => navigate('/profile/watchlist') });
    } else {
      showToast({ message: 'Removed from watchlist', actionLabel: 'Undo', onAction: () => setInList('watchlist', id, true) });
    }
    return result;
  }, [toggle, setInList, showToast, navigate]);

  // list: 'favorites' (titles), 'likedActors' or 'likedHeroes'
  const toggleFavorite = useCallback((list, id) => {
    const result = toggle(list, id);
    if (!result.applied) return result;
    if (result.added) {
      showToast({ message: 'Added to favorites', actionLabel: 'View', onAction: () => navigate(`/profile/${FAVORITE_SECTIONS[list]}`) });
    } else {
      showToast({ message: 'Removed from favorites', actionLabel: 'Undo', onAction: () => setInList(list, id, true) });
    }
    return result;
  }, [toggle, setInList, showToast, navigate]);

  return { has, toggleWatched, toggleWatchlist, toggleFavorite };
};

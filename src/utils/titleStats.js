import { mcuTimeline } from '../data/mcuData';
import { titleDetails } from '../data/titleDetails';

export const titlesById = Object.fromEntries(mcuTimeline.map(movie => [movie.id, movie]));

// "2h 4m" -> 124, "15m" -> 15, "8 episodes · ~43m each" -> 344, "4 episodes" -> null (no runtime known)
export const parseDurationMinutes = (duration) => {
  if (!duration) return null;
  const episodes = duration.match(/(\d+)\s+episodes?/);
  if (episodes) {
    const each = duration.match(/~(\d+)m each/);
    return each ? Number(episodes[1]) * Number(each[1]) : null;
  }
  const hours = duration.match(/(\d+)h/);
  const minutes = duration.match(/(\d+)m/);
  if (!hours && !minutes) return null;
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
};

// Minutes counted toward hour stats; credits-scene entries never count, so films aren't counted twice
export const titleMinutes = (id) => {
  const details = titleDetails[id];
  if (!details || details.sceneOf) return 0;
  return parseDurationMinutes(details.duration) || 0;
};

export const isUpcoming = (id) => {
  const date = titleDetails[id]?.releaseDate;
  return Boolean(date) && new Date(date) > new Date();
};

export const formatHours = (minutes) => `~${Math.round(minutes / 60)} h`;

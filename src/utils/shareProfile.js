import { mcuTimeline } from '../data/mcuData';
import { allCharacters } from '../data/charactersData';
import { heroesData } from '../data/heroesData';

// A shared profile travels inside the link itself: no server, no database.
// Layout (bytes): version | titles,actors,heroes totals | created (epoch days)
// | name | bio | watched/watchlist/favorites bitmasks | favorite actor and hero indices.
const VERSION = 1;

const TITLE_IDS = mcuTimeline.map(movie => movie.id);
const ACTOR_NAMES = allCharacters.map(actor => actor.actorName);
const HERO_NAMES = heroesData.map(hero => hero.heroName);

const titleIndex = Object.fromEntries(TITLE_IDS.map((id, index) => [id, index]));
const actorIndex = Object.fromEntries(ACTOR_NAMES.map((name, index) => [name, index]));
const heroIndex = Object.fromEntries(HERO_NAMES.map((name, index) => [name, index]));

const MASK_BYTES = Math.ceil(TITLE_IDS.length / 8);
const DAY = 86400000;

const toBase64Url = (bytes) => {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (text) => {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
};

const maskFrom = (ids) => {
  const mask = new Uint8Array(MASK_BYTES);
  ids.forEach(id => {
    const index = titleIndex[id];
    if (index === undefined) return;
    mask[index >> 3] |= 1 << (index & 7);
  });
  return mask;
};

const idsFrom = (mask) => TITLE_IDS.filter((_, index) => (mask[index >> 3] >> (index & 7)) & 1);

export const encodeProfile = ({ name, bio, createdAt, watched, watchlist, favorites, actors, heroes }) => {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode((name || '').slice(0, 40));
  const bioBytes = encoder.encode((bio || '').slice(0, 160));
  const actorIds = (actors || []).map(actorName => actorIndex[actorName]).filter(index => index !== undefined);
  const heroIds = (heroes || []).map(heroName => heroIndex[heroName]).filter(index => index !== undefined);

  const bytes = [VERSION];
  const push16 = (value) => bytes.push((value >> 8) & 255, value & 255);

  // Totals let the reader detect a link made against a different catalogue
  push16(TITLE_IDS.length);
  push16(ACTOR_NAMES.length);
  push16(HERO_NAMES.length);
  push16(Math.floor((createdAt ? new Date(createdAt).getTime() : Date.now()) / DAY));

  bytes.push(nameBytes.length, ...nameBytes);
  push16(bioBytes.length);
  bytes.push(...bioBytes);
  bytes.push(...maskFrom(watched || []), ...maskFrom(watchlist || []), ...maskFrom(favorites || []));
  push16(actorIds.length);
  actorIds.forEach(push16);
  push16(heroIds.length);
  heroIds.forEach(push16);

  return toBase64Url(Uint8Array.from(bytes));
};

export const decodeProfile = (payload) => {
  try {
    const bytes = fromBase64Url(payload || '');
    let cursor = 0;
    const read8 = () => bytes[cursor++];
    const read16 = () => (bytes[cursor++] << 8) | bytes[cursor++];
    const readBytes = (length) => bytes.slice(cursor, (cursor += length));

    if (read8() !== VERSION) return null;
    const totals = { titles: read16(), actors: read16(), heroes: read16() };
    const createdAt = new Date(read16() * DAY).toISOString();

    const decoder = new TextDecoder();
    const name = decoder.decode(readBytes(read8()));
    const bio = decoder.decode(readBytes(read16()));

    const watched = idsFrom(readBytes(MASK_BYTES));
    const watchlist = idsFrom(readBytes(MASK_BYTES));
    const favorites = idsFrom(readBytes(MASK_BYTES));

    const readNames = (source) => {
      const count = read16();
      const names = [];
      for (let i = 0; i < count; i++) {
        const value = source[read16()];
        if (value) names.push(value);
      }
      return names;
    };
    const actors = readNames(ACTOR_NAMES);
    const heroes = readNames(HERO_NAMES);

    if (!name || cursor > bytes.length) return null;

    return {
      name,
      bio,
      createdAt,
      watched,
      watchlist,
      favorites,
      actors,
      heroes,
      // Indices are positions in the catalogue, so a changed catalogue can shift them
      stale: totals.titles !== TITLE_IDS.length || totals.actors !== ACTOR_NAMES.length || totals.heroes !== HERO_NAMES.length,
    };
  } catch {
    return null;
  }
};

export const buildShareLink = (profile) => `${window.location.origin}/shared#${encodeProfile(profile)}`;

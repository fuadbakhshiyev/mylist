import fs from 'fs';
import { heroesData } from './src/data/heroesData.js';
import { allCharacters } from './src/data/charactersData.js';
import { mcuTimeline } from './src/data/mcuData.js';

const raw = fs.readFileSync('./scratch/raw_heroes.txt', 'utf8');
const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const parsedNames = lines.map(l => {
  const match = l.match(/^\d+\.\s*(.+)$/);
  return match ? match[1] : l;
});

// deduplicate while keeping order
const uniqueNames = [...new Set(parsedNames)];

const existingHeroes = new Map();
heroesData.forEach(h => {
  existingHeroes.set(h.heroName.toLowerCase(), h.image);
});

// find some images from mcuData if they exist
const mcuHeroImages = new Map();
mcuTimeline.forEach(m => {
  if (m.cast) {
    m.cast.forEach(c => {
      // try to map hero name
      if (c.character) {
        let charLower = c.character.toLowerCase();
        // just store it if we can find a good match
        if (!mcuHeroImages.has(charLower)) {
          // ACTOR images, not hero images. User didn't like actor images for heroes.
          // Let's NOT use cast images. Let's use poster images if movie title matches hero name roughly.
        }
      }
    });
  }
});

const moviePosters = new Map();
mcuTimeline.forEach(m => {
  moviePosters.set(m.title.toLowerCase(), m.poster);
});

const finalHeroes = uniqueNames.map(name => {
  let image = null;
  const nameLower = name.toLowerCase();
  
  // 1. Check if we already manually set an image in heroesData.js
  if (existingHeroes.has(nameLower)) {
    image = existingHeroes.get(nameLower);
  } else {
    // 2. Try to find a movie poster that exactly matches the hero name
    if (moviePosters.has(nameLower)) {
      image = moviePosters.get(nameLower);
    } 
    // 3. Try to find a movie poster that contains the hero name
    else {
      for (const [title, poster] of moviePosters.entries()) {
        if (title.includes(nameLower)) {
          image = poster;
          break;
        }
      }
    }
  }

  return { heroName: name, image };
});

let fileContent = 'export const heroesData = [\n';
finalHeroes.forEach(h => {
  fileContent += `  { heroName: ${JSON.stringify(h.heroName)}, image: ${h.image ? JSON.stringify(h.image) : 'null'} },\n`;
});
fileContent += '];\n';

fs.writeFileSync('./src/data/heroesData.js', fileContent);
console.log(`Generated heroesData.js with ${finalHeroes.length} heroes.`);

import fs from 'fs';
import { mcuTimeline } from './src/data/mcuData.js';

let chars = {};
mcuTimeline.forEach(m => {
  if (m.cast) {
    m.cast.forEach(c => {
      let key = c.name;
      if (!chars[key]) {
        chars[key] = {
          actorName: c.name,
          characterName: c.character,
          image: c.image,
          count: 0,
          movies: []
        };
      }
      chars[key].count++;
      // store the movie object or just id and title
      chars[key].movies.push(m.id);
    });
  }
});

let sorted = Object.values(chars).sort((a,b) => b.count - a.count);

let fileContent = 'export const allCharacters = [\n';
sorted.forEach(c => {
  fileContent += `  { actorName: ${JSON.stringify(c.actorName)}, characterName: ${JSON.stringify(c.characterName)}, image: ${JSON.stringify(c.image)}, count: ${c.count}, movies: ${JSON.stringify(c.movies)} },\n`;
});
fileContent += '];\n';

fs.writeFileSync('./src/data/charactersData.js', fileContent);
console.log(`Extracted ${sorted.length} unique characters with movie data.`);

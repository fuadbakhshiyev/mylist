const { image_search } = require('duckduckgo-images-api');
const fs = require('fs');

const missing = [
  { order: "02", query: "Marvel One-Shot: Agent Carter poster tmdb imdb" },
  { order: "62", query: "WHiH Newsfront poster tmdb imdb" },
  { order: "66", query: "WHiH Newsfront Season 2 poster tmdb imdb" },
  { order: "68", query: "Team Thor poster tmdb imdb" },
  { order: "69", query: "Team Thor: Part 2 poster tmdb imdb" },
  { order: "139", query: "The Guardians of the Galaxy Holiday Special poster tmdb imdb" }
];

async function run() {
  const fixes = {};
  for (const item of missing) {
    try {
      const results = await image_search({ query: item.query, moderate: true });
      if (results && results.length > 0) {
        // Find a vertical-looking poster if possible
        const best = results.find(r => r.height > r.width) || results[0];
        console.log(`Found ${item.query}: ${best.image}`);
        fixes[item.order] = best.image;
      } else {
        console.log(`No results for ${item.query}`);
      }
    } catch(e) {
      console.log(`Error for ${item.query}: ${e.message}`);
    }
  }

  const filePath = '/Users/fuad/Desktop/marvel/src/data/mcuData.js';
  let content = fs.readFileSync(filePath, 'utf-8');
  const blockIterRegex = /("?order"?\s*:\s*"(\d+)".*?"?poster"?\s*:\s*")(.*?)(")/gs;

  let newContent = "";
  let lastIndex = 0;
  let match;
  while ((match = blockIterRegex.exec(content)) !== null) {
      const order = match[2];
      newContent += content.substring(lastIndex, match.index);
      
      if (fixes[order]) {
          newContent += match[1] + fixes[order] + match[4];
      } else {
          newContent += match[0];
      }
      
      lastIndex = blockIterRegex.lastIndex;
  }

  newContent += content.substring(lastIndex);
  fs.writeFileSync(filePath, newContent);
  console.log('DDG search and replace done.');
}

run();

const fs = require('fs');

const missing = [
  { order: "02", id: "tt3067032", query: "Marvel One-Shot: Agent Carter" },
  { order: "62", id: "tt4844392", query: "WHiH Newsfront" },
  { order: "66", id: "tt4844392", query: "WHiH Newsfront Season 2" },
  { order: "68", id: "tt6013230", query: "Team Thor" },
  { order: "69", id: "tt6553860", query: "Team Thor: Part 2" },
  { order: "139", id: "tt13623136", query: "The Guardians of the Galaxy Holiday Special" }
];

async function run() {
  const fixes = {};
  for (const item of missing) {
    try {
      const url = `https://www.imdb.com/title/${item.id}/`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await res.text();
      const match = html.match(/<meta property="og:image" content="(https:\/\/m\.media-amazon\.com\/images\/M\/[^"]+)"/);
      if (match) {
        let posterUrl = match[1];
        // strip size params
        posterUrl = posterUrl.replace(/\._V1.*\.jpg/, '.jpg');
        console.log(`Found ${item.query}: ${posterUrl}`);
        fixes[item.order] = posterUrl;
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
  console.log('IMDB scrape and replace done.');
}

run();

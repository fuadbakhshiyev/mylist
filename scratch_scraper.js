import fs from 'fs';

const raw = fs.readFileSync('./scratch/raw_heroes.txt', 'utf8');
const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const parsedNames = lines.map(l => {
  const match = l.match(/^\d+\.\s*(.+)$/);
  return match ? match[1] : l;
});
const uniqueNames = [...new Set(parsedNames)];

async function getFandomImage(name) {
  try {
    const searchUrl = `https://marvel.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    
    if (data.query && data.query.search && data.query.search.length > 0) {
      const title = data.query.search[0].title;
      const imgUrl = `https://marvel.fandom.com/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&format=json&pithumbsize=500`;
      const imgRes = await fetch(imgUrl);
      const imgData = await imgRes.json();
      
      const pages = imgData.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pages[pageId] && pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
      }
    }
  } catch(e) {
    console.error("Error fetching", name);
  }
  return null;
}

async function run() {
  const finalData = [];
  console.log(`Fetching images for ${uniqueNames.length} characters...`);
  
  // process in batches of 20
  for (let i = 0; i < uniqueNames.length; i += 20) {
    const batch = uniqueNames.slice(i, i + 20);
    const promises = batch.map(async (name) => {
      const img = await getFandomImage(name);
      return { heroName: name, image: img };
    });
    
    const results = await Promise.all(promises);
    finalData.push(...results);
    console.log(`Processed ${Math.min(i + 20, uniqueNames.length)} / ${uniqueNames.length}`);
  }
  
  let fileContent = 'export const heroesData = [\n';
  finalData.forEach(h => {
    fileContent += `  { heroName: ${JSON.stringify(h.heroName)}, image: ${h.image ? JSON.stringify(h.image) : 'null'} },\n`;
  });
  fileContent += '];\n';
  
  fs.writeFileSync('./src/data/heroesData.js', fileContent);
  console.log('Finished updating heroesData.js');
}

run();

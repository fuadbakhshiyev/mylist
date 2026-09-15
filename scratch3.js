import { mcuTimeline } from './src/data/mcuData.js';

mcuTimeline.forEach(item => {
  if (item.title.includes("Defenders")) console.log("Defenders releaseDate:", item.releaseDate);
  if (item.title.includes("Blade")) console.log("Blade releaseDate:", item.releaseDate);
});

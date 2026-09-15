import { mcuTimeline } from './src/data/mcuData.js';
const titles = ['WandaVision', 'I Am Groot', 'Daredevil', 'The Punisher'];
titles.forEach(t => {
  const m = mcuTimeline.find(mov => mov.title === t);
  if (m) {
    console.log(`${t}: ${m.poster}`);
  } else {
    console.log(`${t}: Not found`);
  }
});

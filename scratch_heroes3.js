import { mcuTimeline } from './src/data/mcuData.js';
const keywords = ['Wanda', 'Groot', 'Daredevil', 'Punisher', 'Ultron', 'Guardians'];
keywords.forEach(k => {
  mcuTimeline.forEach(m => {
    if (m.title.includes(k)) {
      console.log(`${m.title}: ${m.poster}`);
    }
  });
});

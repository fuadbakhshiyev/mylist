import { mcuTimeline } from './src/data/mcuData.js';

mcuTimeline.slice(0, 10).forEach(item => {
  console.log(`${item.title} -> desc: ${item.desc}`);
});

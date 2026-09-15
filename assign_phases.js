import fs from 'fs';
import { mcuTimeline } from './src/data/mcuData.js';

// Phase mappings based on MCU official phases
const phase1End = 'The Avengers';
const phase2End = 'Ant-Man';
const phase3End = 'Spider-Man: Far From Home';
const phase4End = 'The Guardians of the Galaxy Holiday Special';
const phase5End = 'Thunderbolts*';

// Release order matters for phase boundaries, but we should sort mcuTimeline by release date first, 
// then assign phases sequentially.
// Or we can manually map based on the year and specific titles.

// mcuData might have mixed dates. Let's just create an explicit set if it's easier, or sequential assignment.
// To be accurate, let's sort by releaseDate (which is YYYY-MM-DD), but skip unreleased?
// Or just hardcode the boundaries in the sorted chronological release order.

let currentPhase = 1;
const updatedTimeline = mcuTimeline.map(m => {
  // If the movie has no release date (e.g. unknown), we might put it in phase 5 or 6.
  // Actually, let's just do it manually by checking titles.
  let phase = 0;
  
  const title = m.title.toLowerCase();
  const year = m.releaseDate ? parseInt(m.releaseDate.substring(0, 4)) : 2026;

  if (year >= 2008 && year <= 2012) {
    phase = 1;
  } else if (year >= 2013 && year <= 2015) {
    phase = 2;
  } else if (year >= 2016 && year <= 2019) {
    phase = 3;
  } else if (year >= 2021 && year <= 2022) {
    phase = 4;
  } else if (year >= 2023 && year <= 2025) {
    // F4 is phase 6
    if (title.includes('fantastic four') || title.includes('doomsday') || title.includes('secret wars') || title.includes('blade') || title.includes('vision quest')) {
      phase = 6;
    } else {
      phase = 5;
    }
  } else if (year >= 2025) {
    phase = 6;
  } else {
    // Fallback for missing dates
    phase = 6;
  }
  
  // Specific boundary fixes
  if (title === 'spider-man: far from home') phase = 3;
  if (title === 'the guardians of the galaxy holiday special') phase = 4;
  if (title === 'ant-man' && year === 2015) phase = 2;
  if (title.includes('wolverine') || title.includes('deadpool') && year < 2024) phase = 0; // Legacy movies? Wait MCU tracker might only have MCU

  return { ...m, phase };
});

// we need to write back the mcuData.js file exactly as it was but with phase added.
// It's tricky to write JS code directly since it has functions (maybe?)
// mcuTimeline is just a big array of objects. We can serialize it to JSON, and write it back as a JS file.
// We need to keep the exports.
const fileContent = `export const mcuTimeline = ${JSON.stringify(updatedTimeline, null, 2)};\n`;
fs.writeFileSync('./src/data/mcuData.js', fileContent);

console.log("Updated mcuData.js with phases.");

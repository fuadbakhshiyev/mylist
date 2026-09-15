import { mcuTimeline } from './src/data/mcuData.js';

const heroes = [
  { name: 'Iron Man', movieTitle: 'Iron Man' },
  { name: 'Captain America', movieTitle: 'Captain America: The First Avenger' },
  { name: 'Thor', movieTitle: 'Thor' },
  { name: 'Hulk', movieTitle: 'The Incredible Hulk' },
  { name: 'Spider-Man', movieTitle: 'Spider-Man: Homecoming' },
  { name: 'Black Widow', movieTitle: 'Black Widow' },
  { name: 'Doctor Strange', movieTitle: 'Doctor Strange' },
  { name: 'Black Panther', movieTitle: 'Black Panther' },
  { name: 'Captain Marvel', movieTitle: 'Captain Marvel' },
  { name: 'Ant-Man', movieTitle: 'Ant-Man' },
  { name: 'Shang-Chi', movieTitle: 'Shang-Chi and the Legend of the Ten Rings' },
  { name: 'Wolverine', movieTitle: 'X-Men Origins: Wolverine' },
  { name: 'Deadpool', movieTitle: 'Deadpool' },
  { name: 'Star-Lord', movieTitle: 'Guardians of the Galaxy' }
];

const results = heroes.map(h => {
  const m = mcuTimeline.find(mov => mov.title === h.movieTitle);
  return {
    hero: h.name,
    image: m ? m.poster : null
  };
});

console.log(results);

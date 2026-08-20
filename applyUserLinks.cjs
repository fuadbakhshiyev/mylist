const fs = require('fs');

const links = {
  "02": "https://image.tmdb.org/t/p/w500/4vFKKWPvCVDJTOWiwReBfpAMScP.jpg",
  "54": "https://image.tmdb.org/t/p/w500/y0QYZPWgeGKOvyrzi6Oz3aJPxJa.jpg",
  "62": "https://image.tmdb.org/t/p/w500/2RAbC1bwYvE3kYr6PdYFUo6vmO6.jpg",
  "66": "https://image.tmdb.org/t/p/w500/2RAbC1bwYvE3kYr6PdYFUo6vmO6.jpg",
  "68": "https://image.tmdb.org/t/p/w500/hpHvGuMc46pppwpcW0Xk7eys3L4.jpg",
  "69": "https://image.tmdb.org/t/p/w500/2jmP71A5Un0jDNqBesDPQSN8hjJ.jpg",
  "139": "https://image.tmdb.org/t/p/w500/8dqXyslZ2hv49Oiob9UjlGSHSTR.jpg"
};

const filePath = '/Users/fuad/Desktop/marvel/src/data/mcuData.js';
let content = fs.readFileSync(filePath, 'utf-8');
const blockIterRegex = /("?order"?\s*:\s*"(\d+)".*?"?poster"?\s*:\s*")(.*?)(")/gs;

let newContent = "";
let lastIndex = 0;
let match;
while ((match = blockIterRegex.exec(content)) !== null) {
    const orderStr = match[2];
    const orderKey = orderStr.padStart(2, '0'); // ensure "02" format
    
    newContent += content.substring(lastIndex, match.index);
    
    if (links[orderKey] || links[orderStr]) {
        const linkToUse = links[orderKey] || links[orderStr];
        newContent += match[1] + linkToUse + match[4];
    } else {
        newContent += match[0];
    }
    
    lastIndex = blockIterRegex.lastIndex;
}

newContent += content.substring(lastIndex);
fs.writeFileSync(filePath, newContent);
console.log('User links applied successfully.');

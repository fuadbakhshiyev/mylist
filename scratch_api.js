async function test() {
  const name = "Spider-Man (Peter Parker)";
  // Search for the character
  const searchUrl = `https://marvel.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&utf8=&format=json`;
  const res = await fetch(searchUrl);
  const data = await res.json();
  
  if (data.query && data.query.search && data.query.search.length > 0) {
    const title = data.query.search[0].title;
    console.log("Found title:", title);
    
    // Get the image
    const imgUrl = `https://marvel.fandom.com/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&format=json&pithumbsize=500`;
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();
    
    const pages = imgData.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pages[pageId].thumbnail) {
      console.log("Image URL:", pages[pageId].thumbnail.source);
    } else {
      console.log("No thumbnail found");
    }
  } else {
    console.log("Not found in search");
  }
}
test();

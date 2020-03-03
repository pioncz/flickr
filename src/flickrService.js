const flickrApiKey = "dea37ced0256a1ff90c510f81a740f28"
  , flickrSearchPhotos = "https://api.flickr.com/services/rest/?method=flickr.photos.search&nojsoncallback=1&format=json"
  , flickrExplorePhotos = "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&nojsoncallback=1&format=json";

const serialize = function(obj) {
  const str = [];
  for (let p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  }
  return str.join("&");
}

async function getPhotos(tags, page){
  // Parse params
  const data = { 'api_key': flickrApiKey, 'page': page, 'per_page': 20 };

  if (tags) {
    data.text = tags;
  }

  const url = `${tags ? flickrSearchPhotos : flickrExplorePhotos}&${serialize(data)}`;
  const response = await fetch(url, { dataType: 'json' });
  const responseJson = await response.json();
  return responseJson.photos.photo;
};

export { getPhotos };
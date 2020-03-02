const flickrApiKey = "dea37ced0256a1ff90c510f81a740f28"
  , flickrSearchPhotos = "https://api.flickr.com/services/rest/?method=flickr.photos.search&nojsoncallback=1&format=json"
  , flickrExplorePhotos = "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&nojsoncallback=1&format=json";

const serialize = function(obj) {
    const str = [];
    for (let p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
}

const apiRequest = function( apiUrl, callback, page, per_page, query ) {
    if (!page || isNaN(page)) {
        var page = 1;
    }
    if (!per_page || isNaN(per_page)) {
        var per_page = 20;
    }
    const data = { 'api_key': flickrApiKey, 'page': page, 'per_page': per_page };
    if (query) {
        data.text = query;
    }

    

    fetch(`${apiUrl}&${serialize(data)}`, { dataType: 'json' })
      .then(response => response.json())
      .then(responseJson => {
          if (responseJson.stat === 'ok') {
            const results = [];

            for(let i=0,len=responseJson.photos.photo.length;i<len;i++) {
                const photo = responseJson.photos.photo[i];
                results.push("https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_c.jpg");
            }

            callback(results);
          }
      })
};

export function getPhotos(callback, query, page, per_page) {
    apiRequest( flickrSearchPhotos, callback, page, per_page, query );
};
export function getExplore(callback, page, per_page) {
    apiRequest( flickrExplorePhotos, callback, page, per_page );
};
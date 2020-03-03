import './style.scss';
import debounce from 'lodash/debounce';
import { getPhotos } from './flickrService';

const PhotosContainer = document.getElementById('photos');
const EditorContainer = document.getElementById('editor');
const Background = EditorContainer.querySelector('.background');
const SearchInput = document.getElementById('search');
const Loader = document.getElementById('loader');
const AnimationLength = 500; // resize clicked photo
const ShowDelay = 200; // new photo animation delay
let canvas = null;
let searchValue = '';
let loadedTags = '';
let page = 0;

const createElement = ({
  className, element = 'div', innerText, container,
}) => {
  const newElement = document.createElement(element);
  className && (newElement.className = className);
  innerText && (newElement.innerText = innerText);
  if (container) {
      container.appendChild(newElement);
  }
  return newElement;
};

const resizePhoto = ({
  fromWidth,
  fromHeight,
  fromLeft,
  fromTop,
}) => {
  const animationStart = Date.now();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = fromWidth / fromHeight;
  const windowRatio = w / h;
  let toWidth = fromWidth;
  let toHeight = fromHeight;
  let toLeft = fromLeft;
  let toTop = fromTop;

  if (ratio < windowRatio) {
    toHeight = h * 0.9;
    toWidth = toHeight * ratio;
    toLeft = w * 0.05 + (w * 0.9 - toWidth) / 2;
    toTop = h * 0.05;
  } else {
    toWidth = w * 0.9;
    toHeight = toWidth / ratio;
    toLeft = w * 0.05;
    toTop = h * 0.05 + (h * 0.9 - toHeight) / 2;
  }

  const resize = () => {
    const now = Date.now(); 
    let progress = Math.min((now - animationStart)/AnimationLength, 1);
    progress *= progress; // ease in quad

    let newWidth = (fromWidth + (toWidth - fromWidth) * progress) + 'px';
    let newHeight = (fromHeight + (toHeight - fromHeight) * progress) + 'px';
    let newLeft = (fromLeft + (toLeft - fromLeft) * progress) + 'px';
    let newTop = (fromTop + (toTop - fromTop) * progress) + 'px';

    if (canvas) {
      canvas.style.width = newWidth;
      canvas.style.height = newHeight;
      canvas.style.left = newLeft;
      canvas.style.top = newTop;
    }

    if (progress < 1 && canvas) {
      requestAnimationFrame(resize);
    }
  };

  resize();
};

const showPhoto = (e, photo) => {
  document.body.className = 'active';
  canvas = createElement({element: 'canvas', className: 'image', container: EditorContainer});
  const ctx = canvas.getContext('2d');
  const boundingRect = e.target.getBoundingClientRect();

  // load image from data url
  var imageObj = new Image();
  imageObj.onload = function() {
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0, 0);

    resizePhoto({
      fromWidth: boundingRect.width,
      fromHeight: boundingRect.height,
      fromLeft: boundingRect.left,
      fromTop: boundingRect.top,
    });
  };
  imageObj.src = photo.url;
};

const hidePhoto = () => {
  document.body.className = '';
  EditorContainer.removeChild(canvas);
  canvas = null;
}

const addPhoto = (photo, delay) => {
  const container = createElement({element: 'div', className: 'post', container: PhotosContainer});
  const photoElement = createElement({element: 'div', className: 'post__image', container: container});
  const imageElement = new Image();
  imageElement.src = photo.url;
  imageElement.alt = photo.title;
  photoElement.appendChild(imageElement);

  imageElement.onload = function(image) {
    const ratio = this.width / this.height;
    imageElement.style.width = (ratio < 1 ? 100 * ratio : 100) + '%';
    imageElement.style.height = (ratio > 1 ? 100 / ratio : 100) + '%';
  };
  photoElement.addEventListener('click', (e) => {
    showPhoto(e, photo);
  });
  const descriptionElement = createElement({element: 'div', className: 'post__description', container: container});
  createElement({element: 'h3', className: 'post__title', innerText: photo.title, container: descriptionElement});
  const linksElement = createElement({element: 'div', className: 'post__links', container: descriptionElement});
  const authorLink = createElement({element: 'a', innerText: 'Author', container: linksElement});
  authorLink.target = ' _blank';
  authorLink.title = 'Author page on flickr';
  authorLink.href = photo.authorLink;
  const postLink = createElement({element: 'a', innerText: 'View on Flickr', container: linksElement});
  postLink.target = ' _blank';
  postLink.href = photo.link;
  postLink.title = 'Photo page on flickr';
  container.style.animation = `slide-up 0.4s ease ${delay}s forwards`;
};

fetch('/test', (e) =>{
  console.log(e);
});

const updatePhotos = async () => {
  Loader.className = 'active';
  // clear if tags changed
  if (searchValue !== loadedTags) {
    PhotosContainer.innerHTML = '';
    loadedTags = searchValue;
    page = 0;
  }

  const photos = await getPhotos(searchValue, page);

  for(let i = 0; i < photos.length; i++) {
      let photo = photos[i];
      if (!photo.title) {
          photo.title = 'Untitled';
      }
      photo.url =  `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_c.jpg`;
      photo.authorLink = `https:\/\/www.flickr.com\/people\/${photo.owner}`;
      photo.link = `https:\/\/www.flickr.com\/photos\/${photo.owner}\/${photo.id}\/`;
      addPhoto(photo, (ShowDelay * i)/1000);
  }

  Loader.className = '';
};

Background.addEventListener('click', () => {
  hidePhoto();
});

const debouncedKeyUp = debounce((e) => {
  searchValue = e.target.value;
  updatePhotos();
}, 500);

SearchInput.addEventListener('keyup', debouncedKeyUp);

const debouncedScroll = debounce((e) => {
  page++;
  updatePhotos();
}, 1000, {leading: true, trailing: false});

window.addEventListener('scroll', (e) => {
  const height = PhotosContainer.getBoundingClientRect().height;
  if (window.scrollY + 3/2 * window.innerHeight > height) {
    debouncedScroll();
  }
});

updatePhotos();


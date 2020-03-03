import './style.scss';
import debounce from 'lodash/debounce';
import { getPhotos } from './flickrService';

const PhotosContainer = document.getElementById('photos');
const EditorContainer = document.getElementById('editor');
const Background = EditorContainer.querySelector('.background');
const SearchInput = document.getElementById('search');
const Loader = document.getElementById('loader');
const AnimationLength = 500;
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
  imageObj.onload = function(image) {
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0, 0);

    const ratio = this.width / this.height;
    const fromWidth = boundingRect.width * (ratio < 1 ? ratio : 1);
    const fromHeight = boundingRect.height / (ratio > 1 ? ratio : 1);
    const fromLeft = boundingRect.left + (ratio < 1 ? (boundingRect.width * (1-ratio)) / 2 : 0);
    const fromTop = boundingRect.top + (ratio > 1 ? (boundingRect.height * (1 - 1 / ratio)) / 2 : 0);

    resizePhoto({
      photoElement: canvas,
      fromWidth,
      fromHeight,
      fromLeft,
      fromTop,
    });
  };
  imageObj.src = photo.url;
};

const hidePhoto = () => {
  document.body.className = '';
  EditorContainer.removeChild(canvas);
  canvas = null;
}

const addPhoto = (photo) => {
  const photoElement = createElement({element: 'div', className: 'post', container: PhotosContainer});
  const imageElement = createElement({element: 'div', className: 'post__image', container: photoElement});
  imageElement.style.background = `url(${photo.url}) no-repeat #181e28`;
  imageElement.style.backgroundSize = 'contain';
  imageElement.style.backgroundPosition = 'center center';
  imageElement.addEventListener('click', (e) => {
    showPhoto(e, photo);
  });
  const descriptionElement = createElement({element: 'div', className: 'post__description', container: photoElement});
  createElement({element: 'h3', className: 'post__title', innerText: photo.title, container: descriptionElement});
  const linksElement = createElement({element: 'div', className: 'post__links', container: descriptionElement});
  const authorLink = createElement({element: 'a', innerText: 'Author', container: linksElement});
  authorLink.target = ' _blank';
  authorLink.href = photo.authorLink;
  const postLink = createElement({element: 'a', innerText: 'View on Flickr', container: linksElement});
  postLink.target = ' _blank';
  postLink.href = photo.link;
};

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
      addPhoto(photo);
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


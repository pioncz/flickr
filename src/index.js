import './style.scss';

async function getPhotos(tags){
    // Parse tags
    let response = await fetch(`/api`);
    let data = await response.json();
    return data.items;
};

const Photos = {
    all: [],
    tags: {},
};
const PhotosContainer = document.getElementById('posts');

const addPhoto = (photo) => {
    const createElement = ({
        className, element = 'div', innerText, container,
    }) => {
        const newElement = document.createElement(element);
        newElement.className = className;
        innerText && (newElement.innerText = innerText);
        if (container) {
            container.appendChild(newElement);
        }
        return newElement;
    };

    const photoElement = createElement({element: 'div', className: 'post', container: PhotosContainer});
    const imageElement = createElement({element: 'div', className: 'post__image', container: photoElement});
    imageElement.style.background = `url(${photo.media.m}) no-repeat #181e28`;
    imageElement.style.backgroundSize = 'contain';
    imageElement.style.backgroundPosition = 'center center';
    const descriptionElement = createElement({element: 'div', className: 'post__description', container: photoElement});
    const titleElement = createElement({element: 'h3', className: 'post__title', innerText: photo.title, container: descriptionElement});
    const dateElement = createElement({element: 'div', className: 'post__date', innerText: photo.parsedDate, container: descriptionElement});
    const linksElement = createElement({element: 'div', className: 'post__links', container: descriptionElement});
    const authorLink = createElement({element: 'a', innerText: 'Author', container: linksElement});
    authorLink.target = ' _blank';
    authorLink.href = photo.authorLink;
    const postLink = createElement({element: 'a', innerText: 'View on Flickr', container: linksElement});
    postLink.target = ' _blank';
    postLink.href = photo.link;
};

const updatePhotos = async () => {
    let photos = await getPhotos('space');

    // clear if tags changed

    for(let i = 0; i < photos.length; i++) {
        let photo = photos[i];
        if (!photo.title) {
            photo.title = 'Untitled';
        }
        photo.authorLink = `https:\/\/www.flickr.com\/people\/${photo.author_id}`;
        const date = new Date(photo.published);
        let month = date.toLocaleString('default', { month: 'short' });
        month = month.charAt(0).toUpperCase() + month.slice(1);
        photo.parsedDate = `Published: ${date.getDate()} ${month}`;
        addPhoto(photo);
    }
    // add to dom
    // add visible class with delay

    Photos.all.push(photos);
    console.log(Photos);
};
//update photos
    //if new photos
        // 

updatePhotos();


const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '6b44dd6aa9bb075d639f72cb09115e64';
const SERVER = 'https://api.themoviedb.org/3';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');

const loading = document.createElement('div');
loading.className = 'loading';

//откр/закр меню
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.body.addEventListener('click', event => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    }
});

leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
});

//откр модального окна
tvShowsList.addEventListener('click', event => {

    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if(card) {

        //вывод данных в модалку
        new DBService().getTvShow(card.id)
            .then(({ 
                poster_path: posterPath, 
                name: title, 
                genres, 
                vote_average: voteAverage, 
                overview, 
                homepage }) => {
                tvCardImg.src = IMG_URL + posterPath;
                tvCardImg.alt = title;
                modalTitle.textContent = title;
                genresList.innerHTML = '';
                for (const item of genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                }
                rating.textContent = voteAverage;
                description.textContent = overview;
                modalLink.href = homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden'; //open
                modal.classList.remove('hide');
            })
    }
});

//закр модального окна
modal.addEventListener('click', event => {
   
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
            document.body.style.overflow = '';
            modal.classList.add('hide');   
        }
});

//смена карточки
const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');

    if (card) {
        const img = card.querySelector('.tv-card__img');
        
        if (img.dataset.backdrop) {
           [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
        }
    }
}; 

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

//карточки
const DBService = class {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные по адрессу ${url}`)
        }
    }

    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResuilt = query => {  //запрос к бд
        return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`);
    }

    getTvShow = id => { //полные данные фильмов
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
    }
}
const renderCard = response => {
    tvShowsList.textContent = ''  //очищение прошлых карточек

    response.results.forEach(item => {  //вывод карточек
        const { backdrop_path: backdrop, 
                name: title, 
                poster_path: poster, 
                vote_average: vote,
                id 
            } = item;

            const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
            const backdropIMG = backdrop ? IMG_URL + backdrop : '';
            const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';
        
        const card = document.createElement('li');
        card.className = 'tv-shows__item';
        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${backdropIMG}"
                    alt="${title}">
                 <h4 class="tv-card__head">${title}</h4>
             </a>
        `;
        loading.remove();
        tvShowsList.append(card);
    });
};

//поиск
searchForm.addEventListener('submit', event => {
    event.preventDefault(); //не перезагрузка при нажатии
    const value = searchFormInput.value.trim();
    if (value) {
        tvShows.append(loading); //загрузка страницы(preloader)
        new DBService().getSearchResuilt(value).then(renderCard);     
    }
    searchFormInput.value = '';
});

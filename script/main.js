

const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';


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
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const modalContent = document.querySelector('.modal__content');
const pagination = document.querySelector('.pagination');


const loading = document.createElement('div');
loading.className = 'loading';

//откр/закр меню
const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.body.addEventListener('click', event => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

//откр модального окна
tvShowsList.addEventListener('click', event => {
    
    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');
   
    if(card) {
        
        preloader.style.display = 'block';//загрузка

        //вывод данных в модалку
        new DBService().getTvShow(card.id)
            .then(({ 
                poster_path: posterPath, 
                name: title, 
                genres, 
                vote_average: voteAverage, 
                overview, 
                homepage }) => {

                    if (posterPath) {
                        tvCardImg.src = IMG_URL + posterPath;
                        tvCardImg.alt = title;
                        posterWrapper.style.display = ''; 
                        modalContent.style.paddingLeft = '';
                    } else {
                        posterWrapper.style.display = 'none'; //убираем постер, если его нет
                        modalContent.style.paddingLeft = '25px'; //убираем расстояние, где был постер
                    }
                    modalTitle.textContent = title;
                    genresList.textContent = '';
                    genres.forEach(item => {
                        genresList.innerHTML += `<li>${item.name}</li>`;
                    });
                    rating.textContent = voteAverage;
                    description.textContent = overview;
                    modalLink.href = homepage;
                })
            .then(() => {
                document.body.style.overflow = 'hidden'; //open
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = ''; //загрузка завершена
            });
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

    constructor(){
        this.SERVER = 'https://api.themoviedb.org/3';
        this.API_KEY = '6b44dd6aa9bb075d639f72cb09115e64';
    }
    
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
 
    getSearchResuilt = query => {//запрос к бд
        this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU&query=${query}`;
        return this.getData(this.temp);
    }

    getNextPage = page => {
        return this.getData(this.temp + '&page=' + page);
    }

    getTvShow = id => this //полные данные фильмов
        .getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
    
    // запросы вкладок меню
    getTopRated = () => this //топ сериалы 
        .getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);
    getPopular = () => this // популярные 
        .getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);
    getToday = () => this // эпизоды сегодня 
        .getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);
    getWeek = () => this //эпизоды на неделю 
        .getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
}

const dbService = new DBService();

const renderCard = (response, target) => {
    tvShowsList.textContent = '';  //очищение прошлых карточек


    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'К сожалению по вашему запросу ничего ненайдено...';
        tvShowsHead.style.color = 'red';
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:';
    tvShowsHead.style.color = '#00838f';

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

    pagination.textContent = '';  // очищение страниц результата

    if (!target && response.total_pages > 1) { // страницы результата
        for (let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
        }
    }
};


//меню
leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
    // запросы вкладок меню
    if (target.closest('#top-rated')) { //топ сериалы 
        dbService.getTopRated().then((response) => renderCard(response, target));
    }
    if (target.closest('#popular')) { //популярные 
        dbService.getPopular().then((response) => renderCard(response, target));
    }
    if (target.closest('#week')) { //эпизоды на неделю
        dbService.getWeek().then((response) => renderCard(response, target));
    }
    if (target.closest('#today')) { //эпизоды сегодня
        dbService.getToday().then((response) => renderCard(response, target));
    }

    if (target.closest('#search')) { //поиск
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';
    }
});


//поиск
searchForm.addEventListener('submit', event => {
    event.preventDefault(); //не перезагрузка при нажатии
    const value = searchFormInput.value.trim();
    if (value) {
        tvShows.append(loading); //загрузка страницы(preloader)
        dbService.getSearchResuilt(value).then(renderCard);     
    }
    searchFormInput.value = '';
});

pagination.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;

    if (target.classList.contains('pages')) {
        
        dbService.getNextPage(target.textContent).then(renderCard);
    }
});
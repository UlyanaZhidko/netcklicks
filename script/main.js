

const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '6b44dd6aa9bb075d639f72cb09115e64';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');



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
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
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
        return this.getData('test.json')
    }
}
const renderCard = response => {
    tvShowsList.textContent = ''  //очищение прошлых карточек

    response.results.forEach(item => {  //вывод карточек
        const { backdrop_path: backdrop, 
                name: title, 
                poster_path: poster, 
                vote_average: vote 
            } = item;

            const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
            const backdropIMG = '';
            const voteElem = '';
        
        const card = document.createElement('li');
        card.className = 'tv-shows__item';
        card.innerHTML = `
            <a href="#" class="tv-card">
                <span class="tv-card__vote">${vote}</span>
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${IMG_URL + backdrop}"
                    alt="${title}">
                 <h4 class="tv-card__head">${title}</h4>
             </a>
        `;
        tvShowsList.append(card);
    });
};
new DBService().getTestData().then(renderCard);


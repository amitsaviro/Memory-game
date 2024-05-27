const cards = document.querySelectorAll('.memory-card');
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

function allCardsFlipped() {
    return [...cards].every(card => card.classList.contains('flip'));
}

function reloadGame() {
    if (allCardsFlipped()) {
        alert("Congratulations! You've won!");
        location.reload();
    }
}

async function fetchImages(type = "dogs") {
    let api_endpoint = "";
    if(type == "harrypoter") {
        api_endpoint = "https://hp-api.onrender.com/api/characters";
    } else if (type == "flags") {
        api_endpoint = "https://restcountries.com/v3.1/all";
    } else {
        api_endpoint = "https://dog.ceo/api/breeds/image/random/6";
    }
    try {
        const response = await fetch(api_endpoint);
        const data = await response.json();

        return type === "dogs" ? data.message : (type === "flags" ? data : data);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

async function printDogs(dogImages) {
    const uniqueDogImages = [...dogImages, ...dogImages];

    uniqueDogImages.sort(() => Math.random() - 0.5);

    cards.forEach((card, index) => {
        card.querySelector('.front-face').style.backgroundImage = `url(${uniqueDogImages[index]})`;
        card.dataset.framework = uniqueDogImages[index];
    });
}

async function printHarryPoter(images) {
    let uniqueImages = [];

    let validImages = images.filter(image => image.image !== "");

    while (uniqueImages.length < 6) {
        let randomIndex = Math.floor(Math.random() * validImages.length);
        let randomImage = validImages[randomIndex].image;

        if (!uniqueImages.includes(randomImage)) {
            uniqueImages.push(randomImage);
        }
    }

    uniqueImages = [...uniqueImages, ...uniqueImages];

    uniqueImages.sort(() => Math.random() - 0.5);

    cards.forEach((card, index) => {
        card.querySelector('.front-face').style.backgroundImage = `url(${uniqueImages[index]})`;
        card.dataset.framework = uniqueImages[index];
    });
}

async function fetchFlagImages() {
    const apiEndpoint = "https://restcountries.com/v3.1/all";

    try {
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const countriesWithFlags = data.filter(country => country.flags);

        if (countriesWithFlags.length < 6) {
            console.error('Not enough countries with flags available.');
            return [];
        }

        return countriesWithFlags.slice(0, 6).map(country => country.flags.svg);
    } catch (error) {
        console.error('Error fetching flag images:', error);
        return [];
    }
}

async function printFlags(flagUrls) {
    const uniqueFlagUrls = [...flagUrls, ...flagUrls];
    uniqueFlagUrls.sort(() => Math.random() - 0.5);
    cards.forEach((card, index) => {
        card.querySelector('.front-face').style.backgroundImage = `url(${uniqueFlagUrls[index]})`;
        card.dataset.framework = uniqueFlagUrls[index]; 
    });
}

async function setCardImages(type = "dogs") {
    try {
        let images = await fetchImages(type);

        if (type === "dogs") {
            printDogs(images);
        } else if (type === "harrypoter") {
            printHarryPoter(images);
        } else if (type === "flags") {
            const flagUrls = await fetchFlagImages();
            printFlags(flagUrls);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error('Error setting card images:', error);
    }
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
    setTimeout(()=> { reloadGame();},2000)
}

function checkForMatch() {
    let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

(function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * 12);
        card.style.order = randomPos;
    });
})();

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomGame() {
    let apis = [
        'dogs',
        'harrypoter',
        'flags'
    ];
    
    return apis[randomIntFromInterval(0, 2)];
}

const clickable = document.querySelectorAll('.select-api');
function selectGame(){
    let target = this.id;
    if(target == "random") target = getRandomGame();
    setCardImages(target);
    document.getElementById("home").classList = "hidden";
    document.getElementById("game-board").classList = "memory-game";

};


for (var i = 0; i < clickable.length; i++) {
    clickable[i].addEventListener('click', selectGame, false);
}
cards.forEach(card => card.addEventListener('click', flipCard));


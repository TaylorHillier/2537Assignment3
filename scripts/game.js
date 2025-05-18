const BASE_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1500';

let response;
let gameDifficulty = 'easy';
let pokemonList = [];
const pokeballImageUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;

let currentMode = 'light'; // Default mode

// User data
let numClicks = 0;
let pairsLeft = 0;
let totalPairs = 0;
let maxTime = 0;
let times = [60, 120, 180]; // Easy, Medium, Hard
let currentTime = 0;

let timerInterval = null;


async function fetchFromPokeAPI() {
    const url = BASE_URL;
    try {
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`PokeAPI error: ${response.status}`);
        }

        const data = await response.json();
        pokemonList = data.results; // Save results globally
        return data;
    } catch (error) {
        console.error('Failed to fetch from PokeAPI:', error);
        throw error;
    } finally {
        console.log('Fetch attempt finished.');
    }
}
fetchFromPokeAPI();

const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const resetButton = document.getElementById('reset');
const difficultyButtons = document.querySelectorAll('.difficulty');
const modeButton = document.getElementById('currentMode');
const timerElement = document.getElementById('time');
const numClicksElement = document.getElementById('clickCount');
const totalPairsElement = document.getElementById('totalPairs');
const pairsLeftElement = document.getElementById('pairsLeft');
const matchedPairsElement = document.getElementById('matchedPairs');
const powerUpButton = document.getElementById('powerUp');
const powerUpCount = document.getElementById('powerUpCount');

document.addEventListener('DOMContentLoaded', () => {
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetBoard);
    modeButton.addEventListener('click', toggleMode);
    powerUpButton.addEventListener('click', powerUp);
    updateDashboard();
    modeButton.textContent = `Current Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
    difficultyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            gameDifficulty = event.target.dataset.difficulty;
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
              console.log('Difficulty button clicked:', event.target.dataset.difficulty);
        });
      
    });
});

function handleSquareClick(event) {
    const square = event.currentTarget;

    if(lockBoard || square.classList.contains('flipped')) return;

    numClicks++;
    numClicks.textContent = `Clicks: ${numClicks}`;
    updateDashboard();
    square.classList.add('flipped');

    square.style.backgroundImage = `url(${square.dataset.pokemonImageUrl})`;

    if(!firstCard) {
        firstCard = square;
        return;
    }

    secondCard = square;
    lockBoard = true;

    if(firstCard.dataset.id === secondCard.dataset.id) {
        matchedPairs++;
        pairsLeft--;
        firstCard.removeEventListener('click', handleSquareClick);
        secondCard.removeEventListener('click', handleSquareClick);
         updateDashboard();
        resetTurn();
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            firstCard.style.backgroundImage = `url(${pokeballImageUrl})`;
            secondCard.style.backgroundImage = `url(${pokeballImageUrl})`;
            resetTurn();
        }, 1000);
    }

    pairsLeft = document.querySelectorAll(".square:not(.flipped)").length / 2;
}

function updateDashboard() {
    totalPairsElement.textContent = `Total Pairs: ${numSquares / 2}`;
    pairsLeftElement.textContent = `Pairs Left: ${numSquares / 2 - matchedPairs}`;
    matchedPairsElement.textContent = `Matched Pairs: ${matchedPairs}`;
    numClicksElement.textContent = `Clicks: ${numClicks}`;
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    currentTime = maxTime;
    timerElement.textContent = `${currentTime}s`;

    updateDashboard();
    timerInterval = setInterval(() => {
        currentTime--;
        timerElement.textContent = `${currentTime}s`;

        if (currentTime <= 0) {
            clearInterval(timerInterval);
            currentTime = 0;
            alert('Game Over! Time is up!');
             document.querySelectorAll('.square').forEach(square => {
                square.removeEventListener('click', handleSquareClick);
            });
           
        }

         updateDashboard();
       
    }, 1000);

}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    if (matchedPairs === numSquares / 2) {
        setTimeout(() => {
            alert('Congratulations! You found all pairs!');
            matchedPairs = 0;
            if(timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            document.querySelectorAll('.square').forEach(square => {
                square.removeEventListener('click', handleSquareClick);
            });
        }, 500);
    }
}

function resetBoard() {

     updateDifficulty();
     updateDashboard();
      timerElement.textContent = maxTime + 's';
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    totalPairs =numSquares / 2;
    pairsLeft = totalPairs;
    matchedPairs = 0;
    numClicks = 0;  
    
       totalPairsElement.textContent = `Total Pairs: ${numSquares / 2}`;
    pairsLeftElement.textContent = `Pairs Left: ${numSquares / 2 - matchedPairs}`;
    matchedPairsElement.textContent = `Matched Pairs: ${matchedPairs}`;
    numClicksElement.textContent = `Clicks: ${numClicks}`;

    firstCard = null;
    secondCard = null;
    lockBoard = true;

    document.querySelectorAll('.square').forEach(square => {
        square.addEventListener('click', handleSquareClick);
        square.classList.remove('flipped');
        square.style.backgroundImage = `url(${pokeballImageUrl})`;
    });

    resetButton.disabled = true;
    startButton.disabled = false;
    powerUpButton.disabled = true;
}


function getPokemonImageById(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getFallbackImageById(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function getRandomPokemon() {
    const index = Math.floor(Math.random() * pokemonList.length);
    const basePokemon = pokemonList[index];
    
    const match = basePokemon.url.match(/\/pokemon\/(\d+)\//);
    const id = match ? match[1] : null;

    console.log('Grabbed Pokemon:', basePokemon); // Optional: log grabbed Pokemon
    return {
        ...basePokemon,
        id,
        imageUrl: id ? getPokemonImageById(id) : null,
        fallbackImageUrl: getFallbackImageById(id)
    };
}



async function startGame() {
    if (pokemonList.length === 0) {
        await fetchFromPokeAPI(); // Load data first if needed
    }
    if(lockBoard) {
        lockBoard = false;
    }

    startButton.disabled = true;

    powerUpCount.textContent = 1;

    gameContainer.innerHTML = ''; // Clear previous game board

    totalPairs =numSquares / 2;
    pairsLeft = totalPairs;
    matchedPairs = 0;
    numClicks = 0;  

       totalPairsElement.textContent = `Total Pairs: ${numSquares / 2}`;
    pairsLeftElement.textContent = `Pairs Left: ${numSquares / 2 - matchedPairs}`;
    matchedPairsElement.textContent = `Matched Pairs: ${matchedPairs}`;
    numClicksElement.textContent = `Clicks: ${numClicks}`;

    updateDifficulty();
    updateDashboard();

    await createBoard();
    startTimer();

    startButton.disabled = true;
    resetButton.disabled = false;
    powerUpButton.disabled = false;
}

function updateDifficulty() {
       switch (gameDifficulty) {
        case 'easy':
            maxTime = times[0];
            numSquares = 8;
            break;
        case 'medium':
             maxTime = times[1];
            numSquares = 16;
            break;
        case 'hard':
             maxTime = times[2];
            numSquares = 24;
            break;
        default:
             maxTime = times[0];
            numSquares = 8;
    }
}


let numSquares = 0;



async function createBoard() {
    let randomPokemon = [];
    
    for (let i = 0; i < numSquares / 2; i++) {
        const pokemon = getRandomPokemon();
        if(randomPokemon.some(p => p.id === pokemon.id)) {
            i--;
            continue;
        }
        randomPokemon.push(pokemon, pokemon);
    }


    randomPokemon = randomPokemon.sort(() => Math.random() - 0.5); // Shuffle the array
    console.log('Shuffled Pokemon:', randomPokemon); // Optional: log shuffled Pokemon
    
    switch (gameDifficulty) {
        case 'easy':
            numSquares = 8;
            break;
        case 'medium':
            numSquares = 16;
            break;
        case 'hard':
            numSquares = 24;
            break;
        default:
            console.error('Invalid game difficulty:', gameDifficulty);
    }

    switch (numSquares) {
        case 8:
            gameContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
            break;
        case 16:
            gameContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
            break;
        case 24:
            gameContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
            break;
    }

    gameContainer.innerHTML = ''; // Clear previous game board

    const squares = [];
    for (let i = 0; i < numSquares; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.dataset.index = i;
        
        let pokemon = randomPokemon[i];
        let image = new Image();
        image.src = pokemon.imageUrl;

        let url = '';
        if (pokemon.imageUrl) {
            url = pokemon.imageUrl;
        } else {
            url = pokemon.fallbackImageUrl;
        }

        gameContainer.appendChild(square);
        square.dataset.pokemonImageUrl = url;
        square.dataset.id = pokemon.id;
        square.style.backgroundImage = `url(${pokeballImageUrl})`;
        squares.push(square);
        await sleep(100);
  
    }

    squares.forEach(square => {
        square.addEventListener('click', handleSquareClick);
    });

     powerUpButton.style.display = 'block';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    currentMode = isDarkMode ? 'dark' : 'light';
    document.getElementById('currentMode').textContent = `Current Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
}

function powerUp() {
    if (powerUpCount.textContent > 0) {
        powerUpCount.textContent--;
       
        document.querySelectorAll('.square').forEach(square => {
            lockBoard = true;
            square.classList.add('powerflipped');
            square.style.backgroundImage = `url(${square.dataset.pokemonImageUrl})`;
        });
        setTimeout(() => {
             document.querySelectorAll('.square').forEach(square => {
                square.classList.remove('powerflipped');
                if(square.classList.contains('flipped')) {
                    return;
                }
                square.style.backgroundImage = `url(${pokeballImageUrl})`;
                square.addEventListener('click', handleSquareClick);
            });
            lockBoard = false;
        }, 500);
        updateDashboard();
    } else {
        alert('No power-ups left!');
    }
}





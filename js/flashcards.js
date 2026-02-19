import { updateFooter } from './utils.js';
import { navBarLinks } from './utils.js';

// DOM elements
const dropMenu = document.getElementById('dropMenu');
const engCard = document.getElementById('engCardContent');
const malCard = document.getElementById('malCardContent');
const timeElapsedDiv = document.getElementById('timeElapsed');
const counterContainer = document.getElementById('counterContainer');
const cardsViewedEl = document.getElementById('cardsViewed');
const playButton = document.getElementById('playButton');

// Globals
let flashcards = [];
let currentIndex = 0;
let isFlipped = false;
let isShuffled = false;
let autoInterval = null;
const viewedIds = new Set();

const flashcardJsonData = "data/flashcards.json";

// ────────────────────────────────────────────────
// Load & Display
// ────────────────────────────────────────────────

async function loadFlashcards() {
  try {
    const response = await fetch(flashcardJsonData);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    flashcards = await response.json();

    if (flashcards.length > 0) {
      currentIndex = 0;
      isFlipped = false;
      resetCardVisibility();
      displayCard();
    } else {
      console.warn('No flashcards loaded');
    }
  } catch (err) {
    console.error('Failed to load flashcards:', err);
    flashcards = [];
  }
}

function displayCard() {
  if (!flashcards[currentIndex]) return;

  const card = flashcards[currentIndex];

  // English side
  document.getElementById('category').textContent = card.category || '';
  document.getElementById('english').textContent = card.english || '';
  document.getElementById('engExample').textContent = card.engExample || '';

  // Malayalam side
  document.getElementById('malayalam').textContent = card.malayalam || '';
  document.getElementById('translit').textContent = card.transliteration || '';
  document.getElementById('malExample').textContent = card.malExample || '';
  document.getElementById('malExampleTranslit').textContent = card.malExampleTranslit || '';

  updateViewedCounter();
}

function resetCardVisibility() {
  if (engCard) {
    engCard.style.display = 'flex';
    engCard.style.flexDirection = 'column';
    engCard.style.alignItems = 'center';
    engCard.style.justifyContent = 'space-around';
    engCard.style.textAlign = 'center';
  }
  if (malCard) malCard.style.display = 'none';
}

// ────────────────────────────────────────────────
// Flip Logic
// ────────────────────────────────────────────────

function flipCard() {
  isFlipped = !isFlipped;
  if (isFlipped) {
    engCard.style.display = 'none';
    malCard.style.display = 'flex';
    malCard.style.flexDirection = 'column';
    malCard.style.alignItems = 'center';
    malCard.style.justifyContent = 'space-around';
    malCard.style.textAlign = 'center';
  } else {
    resetCardVisibility();
  }
}

engCard?.addEventListener('click', flipCard);
malCard?.addEventListener('click', () => {
  isFlipped = false;
  resetCardVisibility();
});

// ────────────────────────────────────────────────
// Navigation
// ────────────────────────────────────────────────

function goNext() {
  if (flashcards.length === 0) return;
  currentIndex = (currentIndex + 1) % flashcards.length;
  isFlipped = false;
  resetCardVisibility();
  displayCard();
}

function goPrev() {
  if (flashcards.length === 0) return;
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  isFlipped = false;
  resetCardVisibility();
  displayCard();
}

document.getElementById('nextButton')?.addEventListener('click', goNext);
document.getElementById('prevButton')?.addEventListener('click', goPrev);

// ────────────────────────────────────────────────
// Auto Play / Pause
// ────────────────────────────────────────────────

function toggleAutoPlay() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    playButton.textContent = 'Play ▶️';
  } else {
    autoInterval = setInterval(() => {
      goNext();
      setTimeout(flipCard, 5000); // Flip to Malayalam ~5s after new card
    }, 15000); // Next card every 15s total cycle
    playButton.textContent = 'Pause ⏸️';
  }
}

playButton?.addEventListener('click', toggleAutoPlay);

// ────────────────────────────────────────────────
// Shuffle & Reset
// ────────────────────────────────────────────────

document.getElementById('shuffleButton')?.addEventListener('click', () => {
  flashcards = [...flashcards].sort(() => Math.random() - 0.5);
  currentIndex = 0;
  isFlipped = false;
  viewedIds.clear();
  resetCardVisibility();
  displayCard();
});

document.getElementById('resetButton')?.addEventListener('click', async () => {
  viewedIds.clear();
  await loadFlashcards();
  currentIndex = 0;
  isFlipped = false;
  if (autoInterval) toggleAutoPlay(); // Stop auto if running
  resetCardVisibility();
  displayCard();
});

// ────────────────────────────────────────────────
// Viewed Counter + Color Progression
// ────────────────────────────────────────────────

function updateViewedCounter() {
  if (!flashcards[currentIndex]) return;
  const cardId = flashcards[currentIndex].id;
  const total = flashcards.length;

  if (!viewedIds.has(cardId)) {
    viewedIds.add(cardId);
    const viewed = viewedIds.size;

    cardsViewedEl.textContent = viewed === total 
      ? `All ${total} cards viewed! 🎉` 
      : `${viewed} of ${total} viewed`;

    // Color progression
    if (viewed === total) {
      counterContainer.style.backgroundColor = "#003200ff";
    } else if (viewed > 100) {
      counterContainer.style.backgroundColor = "#1a0033ff";
    } else if (viewed > 75) {
      counterContainer.style.backgroundColor = "#170057ff";
    } else if (viewed > 50) {
      counterContainer.style.backgroundColor = "#650000ff";
    } else if (viewed > 25) {
      counterContainer.style.backgroundColor = "#043800ff";
    } else if (viewed > 10) {
      counterContainer.style.backgroundColor = "#00283cff";
    }
  }
}

// ────────────────────────────────────────────────
// Deep Search (DuckDuckGo)
// ────────────────────────────────────────────────

document.getElementById('searchButton')?.addEventListener('click', () => {
  if (flashcards.length === 0 || !flashcards[currentIndex]) return;

  const card = flashcards[currentIndex];
  const term = isFlipped ? card.malayalam : card.english;

  if (term) {
    const encoded = encodeURIComponent(term.trim());
    const url = `https://duckduckgo.com/?q=${encoded}&ia=web`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
});

// ────────────────────────────────────────────────
// Hover Effects
// ────────────────────────────────────────────────

const hoverColor = "#00aa00";

engCard?.addEventListener('mouseenter', () => engCard.style.backgroundColor = hoverColor);
engCard?.addEventListener('mouseleave', () => engCard.style.backgroundColor = '');
malCard?.addEventListener('mouseenter', () => malCard.style.backgroundColor = hoverColor);
malCard?.addEventListener('mouseleave', () => malCard.style.backgroundColor = '');

// ────────────────────────────────────────────────
// Timer
// ────────────────────────────────────────────────

function startTimer() {
  let seconds = 0;
  setInterval(() => {
    seconds++;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    timeElapsedDiv.textContent = `Time Elapsed: ${min}m ${sec}s`;
  }, 1000);
}

// ────────────────────────────────────────────────
// Init
// ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  dropMenu?.addEventListener('click', navBarLinks);

  await loadFlashcards();

  if (flashcards.length > 0) {
    displayCard();
  } else {
    if (document.getElementById('english')) {
      document.getElementById('english').textContent = 'Failed to load flashcards';
    }
  }

  startTimer();
  updateFooter();
});
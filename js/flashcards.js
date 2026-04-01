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
let flashcards = [];       // ← original, never mutated after loading
let deck = [];             // ← working deck (shuffled or original)
let currentIndex = 0;
let isFlipped = false;
let isShuffled = false;
let autoInterval = null;
const viewedIds = new Set();

const flashcardJsonData = "data/flashcards.json";

// ────────────────────────────────────────────────
// LOCAL STORAGE PERSISTENCE
// ────────────────────────────────────────────────

const STORAGE_KEY = 'malayalam-flashcards-progress-v1';

function saveState() {
  if (deck.length === 0) return;

  const state = {
    index: currentIndex,
    isFlipped: isFlipped,
    isShuffled: isShuffled,
    viewedIds: Array.from(viewedIds),
    deckOrder: isShuffled ? deck.map(card => flashcards.indexOf(card)) : null,
    timestamp: Date.now()  // optional – useful if you ever want to expire old saves
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSavedState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const state = JSON.parse(saved);

    // Restore index
    if (typeof state.index === 'number' && state.index >= 0 && state.index < deck.length) {
      currentIndex = state.index;
    }

    // Restore flip state
    isFlipped = !!state.isFlipped;

    // Restore viewed
    if (Array.isArray(state.viewedIds)) {
      viewedIds.clear();
      state.viewedIds.forEach(id => viewedIds.add(id));
    }

    // Restore shuffle order
    if (state.isShuffled && Array.isArray(state.deckOrder) && state.deckOrder.length === flashcards.length) {
      isShuffled = true;
      deck = state.deckOrder.map(originalIndex => flashcards[originalIndex]);
    }

    console.log(`Restored state: index=${currentIndex}, viewed=${viewedIds.size}, shuffled=${isShuffled}`);
  } catch (err) {
    console.warn('Invalid saved state – starting fresh', err);
  }
}

// ────────────────────────────────────────────────
// Load & Display
// ────────────────────────────────────────────────

async function loadFlashcards() {
  try {
    const response = await fetch(flashcardJsonData);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    flashcards = await response.json();

    if (flashcards.length > 0) {
      deck = [...flashcards];   // start with original order
      resetCardVisibility();
      loadSavedState();         // apply saved state after deck is ready
      displayCard();
    } else {
      console.warn('No flashcards loaded');
    }
  } catch (err) {
    console.error('Failed to load flashcards:', err);
    flashcards = [];
    deck = [];
  }
}

function displayCard() {
  if (deck.length === 0 || !deck[currentIndex]) return;

  const card = deck[currentIndex];

  document.getElementById('category').textContent     = card.category || '';
  document.getElementById('english').textContent      = card.english || '';
  document.getElementById('engExample').textContent   = card.engExample || '';

  document.getElementById('malayalam').textContent         = card.malayalam || '';
  document.getElementById('translit').textContent          = card.transliteration || '';
  document.getElementById('malExample').textContent        = card.malExample || '';
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
  saveState();
}

engCard?.addEventListener('click', flipCard);
malCard?.addEventListener('click', () => {
  isFlipped = false;
  resetCardVisibility();
  saveState();
});

// ────────────────────────────────────────────────
// Navigation
// ────────────────────────────────────────────────

function goNext() {
  if (deck.length === 0) return;
  currentIndex = (currentIndex + 1) % deck.length;
  isFlipped = false;
  resetCardVisibility();
  displayCard();
  saveState();
}

function goPrev() {
  if (deck.length === 0) return;
  currentIndex = (currentIndex - 1 + deck.length) % deck.length;
  isFlipped = false;
  resetCardVisibility();
  displayCard();
  saveState();
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
    return;
  }

  const card = deck[currentIndex];
  const engLen = card.engExample?.length || 0;
  const malLen = card.malExample?.length || 0;
  const longest = Math.max(engLen, malLen);

  let cycleTime = 15000;
  let flipDelay = 5000;

  if (longest > 80) { cycleTime = 22000; flipDelay = 8000; }
  if (longest > 120) { cycleTime = 30000; flipDelay = 11000; }

  if (!isFlipped) flipCard();

  autoInterval = setInterval(() => {
    goNext();
    setTimeout(flipCard, flipDelay);
  }, cycleTime);

  playButton.textContent = 'Pause ⏸️';
}

playButton?.addEventListener('click', toggleAutoPlay);

// ────────────────────────────────────────────────
// Shuffle & Reset
// ────────────────────────────────────────────────

document.getElementById('shuffleButton')?.addEventListener('click', () => {
  isShuffled = true;
  deck = [...flashcards].sort(() => Math.random() - 0.5);
  currentIndex = 0;
  isFlipped = false;
  viewedIds.clear();           // your original behavior
  resetCardVisibility();
  displayCard();
  saveState();
});

document.getElementById('resetButton')?.addEventListener('click', async () => {
  localStorage.removeItem(STORAGE_KEY);
  viewedIds.clear();
  await loadFlashcards();      // reloads & resets deck to original
  currentIndex = 0;
  isFlipped = false;
  isShuffled = false;
  if (autoInterval) toggleAutoPlay();
  resetCardVisibility();
  displayCard();
});

// ────────────────────────────────────────────────
// Viewed Counter + Color Progression
// ────────────────────────────────────────────────

function updateViewedCounter() {
  if (deck.length === 0 || !deck[currentIndex]) return;
  const cardId = deck[currentIndex].id;
  const total = deck.length;

  let newlyViewed = false;
  if (!viewedIds.has(cardId)) {
    viewedIds.add(cardId);
    newlyViewed = true;
  }

  const viewed = viewedIds.size;

  cardsViewedEl.textContent = viewed === total 
    ? `All ${total} cards viewed! 🎉` 
    : `${viewed} of ${total} viewed`;

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

  if (newlyViewed) saveState();
}

// ────────────────────────────────────────────────
// Deep Search (DuckDuckGo)
// ────────────────────────────────────────────────

document.getElementById('searchButton')?.addEventListener('click', () => {
  if (deck.length === 0 || !deck[currentIndex]) return;

  const card = deck[currentIndex];
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
  

  await loadFlashcards();

  if (deck.length > 0) {
    displayCard();
  } else {
    if (document.getElementById('english')) {
      document.getElementById('english').textContent = 'Failed to load flashcards';
    }
  }

  navBarLinks()
  startTimer();
  updateFooter();

  // Optional safety net: save periodically
  setInterval(saveState, 10000);
});
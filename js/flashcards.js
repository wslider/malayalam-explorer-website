import { updateFooter } from 'https://wslider.github.io/malayalam-explorer-website/js/utils.js';
import { navBarLinks } from 'https://wslider.github.io/malayalam-explorer-website/js/utils.js';

document.getElementById('dropMenu').addEventListener('click', navBarLinks); 

let flashcards = []; // Global array of cards
let currentIndex = 0;
let isFlipped = false; 
let isShuffled = false; 

// DOM elements 
const engCard = document.getElementById('engCardContent');
const malCard = document.getElementById('malCardContent');

//const API_BASE = window.location.origin; 

const flashcardJsonData = "https://wslider.github.io/malayalam-explorer-website/data/flashcards.json"; 

//Load flashcards from JSON file and parse into JS array of objects

async function loadFlashcards() {
    try {
        const response = await fetch(flashcardJsonData);
        if (!response.ok) throw new Error('Fetch failed');
        flashcards = await response.json(); 
    } catch (err) {
        console.error('Load failed:', err);
        flashcards = [];
    }

    if (flashcards.length > 0) {
        currentIndex = 0;
        isFlipped = false;
        engCard.style.display = 'block';
        malCard.style.display = 'none';
        displayCard();
    } else {
        console.warn('No flashcards loaded');
    }
}


// Display current card on both sides (always populate, visibility toggles)
function displayCard() {
    if (flashcards.length === 0 || !flashcards[currentIndex]) {
        console.warn('No card to display');
        return;
    }
    const card = flashcards[currentIndex];
    
    // English side
    document.getElementById('category').textContent = card.category;
    document.getElementById('english').textContent = card.english;
    document.getElementById('engExample').textContent = card.engExample;
    
    // Malayalam side (always set, even if hidden)
    document.getElementById('malayalam').textContent = card.malayalam;
    document.getElementById('translit').textContent = card.transliteration;  
    document.getElementById('malExample').textContent = card.malExample;
    document.getElementById('malExampleTranslit').textContent = card.malExampleTranslit;
    
    console.log(`Displayed card ${currentIndex + 1}: ${card.english} / ${card.malayalam}`);  
}

// Flip on click - toggle English front / Malayalam back
engCard.addEventListener('click', () => {
    console.log('Flip clicked! Current isFlipped:', isFlipped);  
    isFlipped = !isFlipped;
    
    if (isFlipped) {
        // Flip to Malayalam
        engCard.style.display = 'none';
        malCard.style.display = 'block';  // Show back
        console.log('Switched to Malayalam side');
    } else {
        // Flip back to English
        engCard.style.display = 'block';
        malCard.style.display = 'none';
        console.log('Switched to English side');
    }
    
    displayCard();  // Refresh content AFTER swap
});

//Change background color on card to highlight interactivity

engCard.addEventListener('mouseover', ()=>{
    engCard.style.backgroundColor = "#00aa00"; 
});

engCard.addEventListener('mouseleave', ()=>{
    engCard.style.backgroundColor = ''; 
});

malCard.addEventListener('mouseover', ()=> {
    malCard.style.backgroundColor = "#00aa00"; 
});

malCard.addEventListener('mouseleave', () => {
    malCard.style.backgroundColor = '';
});


// Add click listener to Malayalam side for flip-back
malCard.addEventListener('click', () => {
    console.log('Malayalam clicked! Flipping back');
    isFlipped = false;  // Force back to English
    engCard.style.display = 'block';
    malCard.style.display = 'none';
    displayCard();
});

// Navigation Buttons (with flip reset to English)
document.getElementById('nextButton').addEventListener('click', () => {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex + 1) % flashcards.length; 
    isFlipped = false;
    engCard.style.display = 'block';
    malCard.style.display = 'none';
    displayCard(); 
});

document.getElementById('prevButton').addEventListener('click', () => {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    isFlipped = false;
    engCard.style.display = 'block';
    malCard.style.display = 'none';
    displayCard(); 
});

// Shuffle: Copy array, randomize, reset index and flip
document.getElementById('shuffleButton').addEventListener('click', () => {
    isShuffled = !isShuffled; 
    flashcards = [...flashcards].sort(() => Math.random() - 0.5); 
    currentIndex = 0; 
    // Reset to English side
    isFlipped = false;
    engCard.style.display = 'block';
    malCard.style.display = 'none';
    displayCard(); 
});

// Reset: Reload original, unshuffle, reset flip
document.getElementById('resetButton').addEventListener('click', async () => {
    isShuffled = false;
    await loadFlashcards();  // Wait for fresh load
    currentIndex = 0;
    isFlipped = false;
    if (engCard) engCard.style.display = 'block';
    if (malCard) malCard.style.display = 'none';

    if (flashcards.length > 0) {
        displayCard();
    }
});



document.addEventListener('DOMContentLoaded', async () => {
    await loadFlashcards();  // Wait for fetch to finish

    currentIndex = 0;
    isFlipped = false;
    
    if (engCard) engCard.style.display = 'block';
    if (malCard) malCard.style.display = 'none';

    if (flashcards.length > 0) {
        displayCard();
        console.log('Initial card displayed after load');
    } else {
        console.warn('No flashcards loaded on init');
        const engTitle = document.getElementById('english');
        if (engTitle) engTitle.textContent = 'Failed to load flashcards';
    }

    navBarLinks();
    updateFooter();
});
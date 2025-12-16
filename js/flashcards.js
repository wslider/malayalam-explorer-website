import { updateFooter } from 'http://wslider.github.io/malayalam-explorer-website/js/utils.js';
import { navBarLinks } from 'http://wslider.github.io/malayalam-explorer-website/js/utils.js';

document.getElementById('dropMenu').addEventListener('click', navBarLinks); 

let flashcards = []; // Global array of cards
let currentIndex = 0;
let isFlipped = false; 
let isShuffled = false; 

// DOM elements 
const engCard = document.getElementById('engCardContent');
const malCard = document.getElementById('malCardContent');

const API_BASE = window.location.origin; 

const flashcardJsonData = "https://wslider.github.io/malayalam-explorer-website/data/flashcards.json"; 

// Load data (API first, fallback to local JSON)
async function loadFlashcards() {{
     try {
            const localData = await fetch(`${flashcardJsonData}`);
            if (!localData.ok) throw new Error('Local fetch failed');
            flashcards = await localData.json(); 
        } catch (localErr) {
            console.error('Local load failed:', localErr);
            flashcards = [];  
        }
    }
    if (flashcards.length > 0) {
        currentIndex = 0;  // Reset index on reload
        displayCard();
    } else {
        console.warn('No flashcards loaded');
    } }


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
    document.getElementById('translit').textContent = card.transliteration;  // Matches JSON field
    document.getElementById('malExample').textContent = card.malExample;
    document.getElementById('malExampleTranslit').textContent = card.malExampleTranslit;
    
    console.log(`Displayed card ${currentIndex + 1}: ${card.english} / ${card.malayalam}`);  // Debug log
}

// Flip on click - toggle English front / Malayalam back
engCard.addEventListener('click', () => {
    console.log('Flip clicked! Current isFlipped:', isFlipped);  // Debug
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
    // Reset to English side
    isFlipped = false;
    engCard.style.display = 'block';
    malCard.style.display = 'none';
    displayCard(); 
});

document.getElementById('prevButton').addEventListener('click', () => {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    // Reset to English side
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
document.getElementById('resetButton').addEventListener('click', () => {
    loadFlashcards();
    isShuffled = false; 
});

// DELETE current card
document.getElementById('deleteButton').addEventListener('click', async () => {  
    if (flashcards.length === 0 || !flashcards[currentIndex]) {
        console.warn('Nothing to delete.');
        return;
    }
    const card = flashcards[currentIndex]; 
    if (!confirm(`Delete "${card.english}" (${card.category})? This cannot be undone!`)) {
        return; 
    }
    
    // Remove locally first (UI updates immediately)
    const deletedIndex = currentIndex;  // Save for potential rollback
    flashcards.splice(currentIndex, 1);
    if (currentIndex >= flashcards.length) {
        currentIndex = Math.max(0, flashcards.length - 1);  
    }

    try {
        let response = { ok: true };  //Default "success" for local-only
        if (card.id) {
            response = await fetch(`${API_BASE}/api/flashcards/${card.id}`, { 
                method: 'DELETE',
            });
            if (!response.ok) {  // Now safe: Always defined
                throw new Error(`DELETE failed: ${response.status}`);
            }
            console.log(`API delete succeeded for card ${card.id}`); 
        } else {
            console.warn('No card ID—skipped API delete (local-only mode)');  
        }

        // Success: Update UI
        isFlipped = false;
        engCard.style.display = 'block';
        malCard.style.display = 'none';

        if (flashcards.length > 0) {
            displayCard(); 
        } else {
            alert('All Cards deleted. Create new cards using the form.');
        }
    } catch (err) {
        // Rollback: Reload to restore from source (re-adds if API failed)
        console.error('Delete failed:', err);
        alert('Failed to delete card. Check console for details.');
        loadFlashcards();  
        currentIndex = Math.min(deletedIndex, flashcards.length - 1); 
    }
});


// New Card Form: POST to API, refresh list
// Server assigns Id
document.getElementById('newCardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newCard = {
        category: document.getElementById('newCategory').value.trim(),
        english: document.getElementById('newEnglish').value.trim(),
        engExample: document.getElementById('newEngExample').value.trim(),
        malayalam: document.getElementById('newMalayalam').value.trim(),
        transliteration: document.getElementById('newTranslit').value.trim(),  // Matches JSON field
        malExample: document.getElementById('newMalExample').value.trim(),
        malExampleTranslit: document.getElementById('newMalExampleTranslit').value.trim(),
    };

    
    // Basic validation + Matches if all characters in Malayalam inputs are in Malayalam unicode range
    // Includes Malayalam numerals 
    // Allows spaces and common punctuations 
    const malayalamRegex = /^[\u0D00-\u0D7F\u0D66-\u0D78\s\u200C-\u200D.,!?'"“”()-]+$/u;   

    if (!newCard.category || !newCard.english || !newCard.malayalam) {
        alert('Please fill required fields: Category, English, Malayalam');
        return;
    }

    // Check if all letters of Malayalam word (not translit) are in Malayalam Script
    if (!malayalamRegex.test(newCard.malayalam)) {
        alert('Malayalam word must be in valid Malayalam script');
        return; 
    }
    //check if all letters of malayalam example phrase (not translit) are in Malayalam Script (skip if empty)
    if (newCard.malExample && !malayalamRegex.test(newCard.malExample)) {  
        alert(`Malayalam example be in valid Malayalam script (common puntuations allowed: ", !, ?)`);
        return; 
    }


    try {
        const response = await fetch(`${API_BASE}/api/flashcards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCard)
        });
        if (!response.ok) throw new Error('POST failed');

        const addedCard = await response.json();  // Server returns the full card w/ ID
        loadFlashcards();  // Refresh list
        e.target.reset();
        console.log('New card added:', addedCard.english, 'ID:', addedCard.id);

    } catch (err) {
        console.error('Form submission failed:', err);
        alert('Failed to add card. Check console.');
    }
});

// Init: Load on page load, ensure English side visible
loadFlashcards();
isFlipped = false;
engCard.style.display = 'block';
malCard.style.display = 'none';



updateFooter(); 
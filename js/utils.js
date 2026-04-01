export function navBarLinks() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('myLinks');

  if (!hamburger || !navLinks) return;

  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    
    hamburger.setAttribute('aria-expanded', !isOpen);
    hamburger.classList.toggle('active');       // ← toggles X icon
    navLinks.classList.toggle('active');
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('active');       // ← X goes back to hamburger
    navLinks.classList.remove('active');
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMenu();
    }
  });
}

export function updateSunMapLink() {
    const nowUtc = new Date().toString();
    const isoTxt = nowUtc.slice(0, 16).replace(/[-:]/g, '');
    const sunMapLink = `https://www.timeanddate.com/scripts/sunmap.php?iso=${isoTxt}`;
    const sunMapButton = document.getElementById('sunMapButton');
    sunMapButton.addEventListener('click', () => {
        const win = window.open(sunMapLink, '_blank');
        if (!win) {
            window.open('https://www.timeanddate.com/sun/india/thiruvananthapuram', '_blank');
        }
    });
}


export function updateFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return; 

    const now = new Date();
    const footerYear = now.getFullYear();
    footer.textContent = `Malayalam Explorer - ${footerYear}`;
}

// Run when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateFooter();
        setInterval(updateFooter, 3600000); // 1 hour 
    });
} else {
    updateFooter();
    setInterval(updateFooter, 36000000);
}

/* export function updateSunMapLink(){
  const nowUtc = new Date().toISOString();
  const isoTxt = nowUtc.slice(0, 16).replace(/[-:]/g, '');
  const sunMapLink = `https://www.timeanddate.com/scripts/sunmap.php?iso=${isoTxt}`; 
  document.getElementById('sunMapButton').addEventListener('click', ()=>{
    window.open(`${sunMapLink}`, '_blank');
  }); 
} */
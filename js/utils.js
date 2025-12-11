// export to other js files

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



export function navBarLinks() {
    const myLinks = document.getElementById("myLinks");
    const currentDisplay = window.getComputedStyle(myLinks).display;
    const topNavBar = document.getElementById('topNavBar'); 

    if (currentDisplay === "block" || currentDisplay === "flex") {
        myLinks.style.display = "none";
    } else if (window.innerWidth < 768) {
        myLinks.style.display = "flex";
        myLinks.style.flexDirection = "column";
        topNavBar.style.display = "flex";
        topNavBar.style.flexDirection = "column"; 
    } else {
        myLinks.style.display = "flex";
        myLinks.style.flexDirection = "row";
        myLinks.style.justifyContent = "space-evenly"
        myLinks.style.gap = "2vw"
        topNavBar.style.display = "flex"; 
        topNavBar.style.flexDirection = "row"; 
        topNavBar.style.justifyContent = "flex-start";
        topNavBar.style.gap = "5vw"; 
        topNavBar.style.padding = "0 3vw 0 -1vw";
    }
}
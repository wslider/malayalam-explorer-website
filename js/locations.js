import { updateFooter, updateSunMapLink, navBarLinks } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements once
  const elements = {
    dropMenu: document.getElementById('dropMenu'),
    locationName: document.getElementById('locationName'),
    currentTemp: document.getElementById('currentTemp'),
    time: document.getElementById('time'),
    locationImg: document.getElementById('locationImg'),
    locationDesc: document.getElementById('locationDesc'), // unused right now
    locationMap: document.getElementById('locationMap'),
  };

  // Early exit if critical elements are missing
  if (!elements.locationName || !elements.currentTemp || !elements.time ||
      !elements.locationImg || !elements.locationMap) {
    console.error("One or more critical DOM elements are missing!");
    return;
  }

  if (elements.dropMenu) {
    elements.dropMenu.addEventListener('click', navBarLinks);
  } else {
    console.warn("Dropdown menu element (#dropMenu) not found");
  }

  // Update Global Sun Map link with current time
  updateSunMapLink();

  const locations = [
    {
      name: "Munnar",
      lat: 10.09,
      lon: 77.06,
      src: "images/munnar-hillstation.jpg",
      alt: "Munnar hill station landscape"
    },
    {
      name: "Thiruvananthapuram",
      lat: 8.52,
      lon: 76.94,
      src: "images/trivandrum-nairMuseum.jpg",
      alt: "Nair Museum in Thiruvananthapuram"
    },
    {
      name: "Vembanad Lake",
      lat: 9.60,
      lon: 76.40,
      src: "images/vembanad-lake-monsoon-clouds.jpeg",
      alt: "Vembanad Lake during monsoon"
    }
  ];

  let currentIndex = 0;

  async function updateLocation() {
    const loc = locations[currentIndex];

    // Using worker proxy to avoid CORS issues
    const target = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m&temperature_unit=fahrenheit&timezone=Asia%2FKolkata`;

    const proxyUrl = `https://malayalam-exp-weather-api.wslider2000.workers.dev/?url=${encodeURIComponent(target)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Weather API returned ${response.status}`);
      }

      const data = await response.json();

      // Defensive check — sometimes API returns unexpected structure
      if (!data.current?.temperature_2m || !data.current?.time) {
        throw new Error("Incomplete weather data received");
      }

      const temp = Math.round(data.current.temperature_2m);
      const timeStr = data.current.time.slice(11, 16); // HH:MM

      // Update DOM
      elements.locationName.textContent = loc.name;
      elements.currentTemp.textContent = `${temp}°F`;
      elements.time.textContent = `as of ${timeStr} IST`;

      elements.locationImg.src = loc.src;
      elements.locationImg.alt = loc.alt;

      // Updated map embed with proper escaping and dynamic values
      elements.locationMap.innerHTML = `
        <iframe class="mapImage image"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${loc.lon-0.5},${loc.lat-0.5},${loc.lon+0.5},${loc.lat+0.5}&layer=mapnik&marker=${loc.lat},${loc.lon}"
          style="border:1px solid #555; width:100%; height:280px;">
        </iframe>
        <br>
        <small>
          <a href="https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lon}#map=10/${loc.lat}/${loc.lon}"
             target="_blank" rel="noopener noreferrer">
            View Larger Map
          </a>
        </small>`;

    } catch (err) {
      console.error("Failed to update weather/location:", err);
      elements.currentTemp.textContent = "—";
      elements.time.textContent = "update failed";
    }

    // Move to next location (cycle)
    currentIndex = (currentIndex + 1) % locations.length;
  }

  // Initial update
  updateLocation();

  // Refresh every 60 seconds
  setInterval(updateLocation, 60_000);

  // Footer update (assuming it only needs to run once)
  updateFooter();
});
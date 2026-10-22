import { updateFooter, updateSunMapLink, navBarLinks } from './utils.js';

const LOCATION_JSON = "data/locations.json";

document.addEventListener('DOMContentLoaded', async () => {
  // Cache DOM elements
  const elements = {
    locationName: document.getElementById('locationName'),
    currentTemp: document.getElementById('currentTemp'),
    time: document.getElementById('time'),
    locationImg: document.getElementById('locationImg'),
    locationMap: document.getElementById('locationMap'),
  };

  // Early exit if critical elements are missing
  if (Object.values(elements).some(el => !el)) {
    console.error("One or more critical DOM elements are missing!");
    return;
  }

  updateSunMapLink();
  navBarLinks();
  updateFooter();

  let locations = [];
  let currentIndex = 0;

  async function loadLocations() {
    try {
      const response = await fetch(LOCATION_JSON);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      locations = await response.json();
      if (!Array.isArray(locations) || locations.length === 0) {
        throw new Error("Locations data is empty or invalid");
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
      locations = [];
    }
  }

  async function updateLocation() {
    if (locations.length === 0) {
      elements.currentTemp.textContent = "—";
      elements.time.textContent = "no locations";
      return;
    }

    const loc = locations[currentIndex];

    // Open-Meteo via worker proxy (avoids CORS)
    const target = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m&temperature_unit=fahrenheit&timezone=Asia%2FKolkata`;
    const proxyUrl = `https://malayalam-exp-weather-api.wslider2000.workers.dev/?url=${encodeURIComponent(target)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Weather API returned ${response.status}`);

      const data = await response.json();

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
      elements.locationImg.alt = loc.alt || loc.name;

      // Map embed
      const bbox = `${loc.lon - 0.5},${loc.lat - 0.5},${loc.lon + 0.5},${loc.lat + 0.5}`;
      elements.locationMap.innerHTML = `
        <iframe class="mapImage image"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lon}"
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

    // Cycle to next location
    currentIndex = (currentIndex + 1) % locations.length;
  }

  // Load once, then start updates
  await loadLocations();
  await updateLocation();

  // Refresh every 60 seconds
  setInterval(updateLocation, 60_000);
});
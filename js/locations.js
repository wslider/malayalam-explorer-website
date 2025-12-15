import { updateFooter } from "https://wslider.github.io/malayalam-explorer-website/js/utils.js";
import { navBarLinks } from "https://wslider.github.io/malayalam-explorer-website/js/utils.js";

document.getElementById('dropMenu').addEventListener('click', navBarLinks); 

const locationName = document.getElementById('locationName');
    const currentTempText = document.getElementById('currentTemp');
    const timeText = document.getElementById('time');

    const locationImg = document.getElementById('locationImg');
    const locationDesc = document.getElementById('locationDesc'); 

    const locationMap = document.getElementById('locationMap'); 

    const locations = [
      { name: "Munnar", lat: "10.09", lon: "77.06", src:"images/munnar-hillstation.jpg", alt:"Anamudi as seen from the south with State Highway 17. Photo taken from Nayamakad, Kannan Devan Hills, Kerala, India.- Bimal K C from Cochin, India, 2008"},
      { name: "Thiruvananthapuram", lat: "8.52", lon: "76.94", src:"images/trivandrum-nairMuseum.jpg", alt:"Image of Nair Museum in Trivandrum. - William Slider, 2008"},
      { name: "Vembanad Lake", lat: "9.60", lon: "76.40", src:"images/vembanad-lake-monsoon-clouds.jpeg", alt:"Image of houseboats on Vembanad Lake and monsoon clouds. - William Slider, 2011"}
    ];

    let i = 0;

    async function updateLocation() {
      const loc = locations[i];

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m&temperature_unit=fahrenheit&timezone=Asia%2FKolkata`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const temp = Math.round(data.current.temperature_2m);
        const time = data.current.time.slice(11, 16); 

        locationName.textContent = loc.name;
        currentTempText.textContent = `${temp}°F`;
        timeText.textContent = `as of ${time} IST`;

        locationImg.src = `${loc.src}`;
        locationImg.alt = `${loc.alt}`; 

        locationMap.innerHTML = `
        <iframe class="mapImage image" src="https://www.openstreetmap.org/export/embed.html?bbox=73.53698730468751%2C7.988511967656373%2C80.60119628906251%2C12.157480388484009&amp;layer=mapnik&amp;marker=${loc.lat}%2C${loc.lon}" style="border: 1px solid black">
        </iframe><br/>
        <small>
        <a href="https://www.openstreetmap.org/?mlat=${loc.lat}&amp;mlon=${loc.lon}#map=8/${loc.lat}/${loc.lon}">View Larger Map</a>
        </small>`

        
      } 
      
      catch (err) {
        currentTempText.textContent = "Error";
      }

      i = (i + 1) % locations.length; // loop though continously 
    }

    updateLocation();
    setInterval(updateLocation, 60000);

    updateFooter();


// pin on map location (add to array)
// location image for each location 
// insp for locations on profile site 

/* 

     const locations = [
      { name: "Munnar", lat: "10.09", lon: "77.06", src:"images/munnar-hillstation.jpg", engDesc:"", malDesc:"" },
      { name: "Thiruvananthapuram", lat: "8.52", lon: "76.94", src:"images/trivandrum-nairMuseum.jpg", engDesc:"", malDesc:"" }
    ];

        locationDesc.addEventListener("mouseout", function() {
          this.textContent = `${loc.engDesc}`
        });                             

        locationDesc.addEventListener("mouseover", function() {
          this.textContent = `${loc.malDesc}`
        }); */ 
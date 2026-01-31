const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const loader = document.getElementById('loader');
const tempValue = document.getElementById('tempValue');
const unitText = document.getElementById('unitText');

let currentTempCelsius = null;
let isCelsius = true;

function updateRealTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = `${now.toLocaleDateString(undefined, dateOptions)} | ${now.toLocaleTimeString()}`;
}

setInterval(updateRealTime, 1000);
updateRealTime();

async function searchByCity(cityName) {
    if (!cityName) {
        alert("Please enter a city name!");
        return;
    }
    
    loader.style.display = 'block';
    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found!");
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m,visibility&daily=weathercode,temperature_2m_max&timezone=auto`;
        
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        updateUI(name, country, weatherData);
        updateForecast(weatherData.daily);
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Something went wrong! Check your internet connection.");
    } finally {
        loader.style.display = 'none';
    }
}

function updateUI(name, country, data) {
    const current = data.current_weather;
    currentTempCelsius = current.temperature;

    document.getElementById('locationName').innerText = `${name}, ${country}`;
    document.getElementById('windValue').innerText = `${current.windspeed} km/h`;
    document.getElementById('humidityValue').innerText = `${data.hourly.relative_humidity_2m[0]}%`;
    document.getElementById('visibilityValue').innerText = `${(data.hourly.visibility[0] / 1000).toFixed(1)} km`;

    isCelsius = true;
    unitText.innerText = "°C";
    tempValue.innerText = Math.round(currentTempCelsius);

    const config = {
        0: ["Clear Sky", "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?q=80&w=1920"],
        1: ["Mainly Clear", "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?q=80&w=1920"],
        2: ["Partly Cloudy", "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1920"],
        3: ["Partly Cloudy", "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1920"],
        61: ["Rainy Day", "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920"],
        95: ["Thunderstorm", "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1920"]
    };

    const status = config[current.weathercode] || ["Overcast", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920"];
    document.getElementById('weatherStatus').innerText = status[0];
    document.body.style.backgroundImage = `url('${status[1]}')`;
}

function updateForecast(dailyData) {
    const forecastList = document.getElementById('dailyForecastList');
    if (!forecastList) return;
    
    forecastList.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        const dateRaw = new Date(dailyData.time[i]);
        const dateString = dateRaw.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
        const tempMax = Math.round(dailyData.temperature_2m_max[i]);
        const code = dailyData.weathercode[i];

        let statusText = code <= 3 ? "Clear" : (code <= 67 ? "Rainy" : "Cloudy");

        const li = document.createElement('li');
        li.innerHTML = `
            <span class="forecast-date">${dateString}</span>
            <span class="forecast-status">${statusText}</span>
            <span class="forecast-temp">${tempMax}°C</span>
        `;
        forecastList.appendChild(li);
    }
}

document.getElementById('tempContainer').addEventListener('click', () => {
    if (currentTempCelsius === null) return;
    isCelsius = !isCelsius;
    
    if (isCelsius) {
        tempValue.innerText = Math.round(currentTempCelsius);
        unitText.innerText = "°C";
    } else {
        tempValue.innerText = Math.round((currentTempCelsius * 9 / 5) + 32);
        unitText.innerText = "°F";
    }
});

searchBtn.addEventListener('click', () => searchByCity(cityInput.value.trim()));

cityInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') {
        searchByCity(cityInput.value.trim());
    }
});
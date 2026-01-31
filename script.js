const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
function updateRealTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString(undefined, dateOptions);
    const timeString = now.toLocaleTimeString();
    document.getElementById('currentDate').innerText = `${dateString} | ${timeString}`;
} setInterval(updateRealTime, 1000);
updateRealTime();
function triggerSearch() {
    const city = cityInput.value.trim();
    if (city) {
        searchByCity(city);
    } else {
        alert("Please enter a city name!");
    }
} searchBtn.addEventListener('click', triggerSearch);
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        triggerSearch();
    }
});
async function searchByCity(cityName) {
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found!");
            return;
        }
        const { latitude, longitude, name, country } = geoData.results[0];
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m,visibility`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        updateUI(name, country, weatherData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
function updateUI(name, country, data) {
    const current = data.current_weather;
    const weatherCode = current.weathercode;
    document.getElementById('locationName').innerText = `${name}, ${country}`;
    document.getElementById('tempValue').innerText = Math.round(current.temperature);
    document.getElementById('windValue').innerText = current.windspeed;
    document.getElementById('humidityValue').innerText = data.hourly.relative_humidity_2m[0] + "%";
    document.getElementById('visibilityValue').innerText = (data.hourly.visibility[0] / 1000).toFixed(1);
    let statusText = "";
    let bgImage = "";
    if (weatherCode === 0) {
        statusText = "Clear Sky";
        bgImage = "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?q=80&w=1920";
    } else if (weatherCode >= 1 && weatherCode <= 3) {
        statusText = "Partly Cloudy";
        bgImage = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1920";
    } else if (weatherCode >= 51 && weatherCode <= 67) {
        statusText = "Rainy Day";
        bgImage = "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920";
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        statusText = "Snowy";
        bgImage = "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=1920";
    } else if (weatherCode >= 95) {
        statusText = "Thunderstorm";
        bgImage = "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1920";
    } else {
        statusText = "Overcast";
        bgImage = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920";
    }
    document.getElementById('weatherStatus').innerText = statusText;
    document.body.style.backgroundImage = `url('${bgImage}')`;
}
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherDisplay = document.getElementById('weatherDisplay');
const loader = document.getElementById('loader');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        searchByCity(city);
    } else {
        alert("Please enter a city name first!");
    }
});

async function searchByCity(cityName) {
    try {
        // Show loader and hide display
        loader.classList.remove('d-none');
        weatherDisplay.classList.add('d-none');

        // Step 1: Geocoding (City to Lat/Long)
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results) {
            alert("City not found! Check spelling.");
            loader.classList.add('d-none');
            return;
        }

        const { latitude, longitude, name } = geoData.results[0];

        // Step 2: Fetch Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // Step 3: Display Data in UI
        document.getElementById('cityName').innerText = name;
        document.getElementById('temp').innerText = weatherData.current_weather.temperature;
        document.getElementById('wind').innerText = weatherData.current_weather.windspeed;

        // Hide loader and show display
        loader.classList.add('d-none');
        weatherDisplay.classList.remove('d-none');

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
        loader.classList.add('d-none');
    }
}
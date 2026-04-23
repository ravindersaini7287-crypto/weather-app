let chart;

// Loader
function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// Get weather
async function getWeather() {
  const city = document.getElementById("city").value;
  if (!city) return alert("Enter city");

  showLoader();

  const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
  const geoData = await geo.json();

  if (!geoData.results) {
    alert("City not found");
    hideLoader();
    return;
  }

  const lat = geoData.results[0].latitude;
  const lon = geoData.results[0].longitude;

  fetchWeather(lat, lon, city);
}

// Location
function getLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
  });
}

// Fetch weather
async function fetchWeather(lat, lon, city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true`;

  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("cityName").innerText = city;
  document.getElementById("temp").innerText =
    "Temperature: " + data.current_weather.temperature + "°C";

  document.getElementById("wind").innerText =
    "Wind: " + data.current_weather.windspeed + " km/h";

  showChart(data.hourly.temperature_2m, data.hourly.weathercode);
  showForecast(data.daily);

  hideLoader();
}

// Chart
function showChart(temp, codes) {
  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  const icons = codes.slice(0, 12).map(code => {
    if (code <= 1) return "☀️";
    if (code <= 3) return "⛅";
    if (code < 50) return "☁️";
    if (code < 70) return "🌧️";
    return "❄️";
  });

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: icons,
      datasets: [{
        label: "Temp °C",
        data: temp.slice(0, 12),
        borderWidth: 2,
        tension: 0.4
      }]
    }
  });
}

// 7 Day Forecast
function showForecast(daily) {
  const div = document.getElementById("forecast");
  div.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    let icon = "☀️";
    const code = daily.weathercode[i];

    if (code <= 1) icon = "☀️";
    else if (code <= 3) icon = "⛅";
    else if (code < 50) icon = "☁️";
    else if (code < 70) icon = "🌧️";
    else icon = "❄️";

    const el = document.createElement("div");
    el.className = "day";

    el.innerHTML = `
      <p>Day ${i + 1}</p>
      <p>${icon}</p>
      <p>${daily.temperature_2m_max[i]}°C</p>
      <p>${daily.temperature_2m_min[i]}°C</p>
    `;

    div.appendChild(el);
  }
}

// Dark mode
function toggleMode() {
  document.body.classList.toggle("dark");
}
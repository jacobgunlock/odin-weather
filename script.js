const fetchWeather = (() => {
    async function getData(city, unit) {
        const dataCall = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=3ecf838da21bf34245c83c48672ad880&units=${unit}`
        );
        if (!dataCall.ok) {
            alert(`Something went wrong:
            City "${city}" not found`);
            return;
        }
        //handle loadscreen
        document.querySelector(".content").classList.add("hidden");
        document.querySelector(".loadscreen").classList.remove("hidden");
        //
        const dataJson = await dataCall.json();
        const weather = processData(dataJson);

        const geoCall = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${dataJson.coord.lat}&lon=${dataJson.coord.lon}&appid=3ecf838da21bf34245c83c48672ad880`
        );
        const geoJson = await geoCall.json();
        const coord = { lat: geoJson[0].lat, lon: geoJson[0].lon };

        const forecastCall = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=3ecf838da21bf34245c83c48672ad880&units=${unit}`
        );
        const forecastJson = await forecastCall.json();
        const forecast = processForecast(forecastJson);

        setBackGround(weather);
        updateWeatherDOM(weather, unit);
        updateForecastDOM(forecast, unit);
        unitListener(city);
    }

    function processData(obj) {
        return {
            city: obj.name,
            country: obj.sys.country,
            desc: obj.weather[0].description,
            temp: obj.main.temp,
            feelsLike: obj.main.feels_like,
            low: obj.main.temp_min,
            high: obj.main.temp_max,
            humidity: obj.main.humidity,
            windSpeed: obj.wind.speed,
            windDir: obj.wind.deg,
            weather: obj.weather[0].main,
            id: obj.weather[0].id,
        };
    }

    function processForecast(forecast) {
        const list = forecast.list;
        let days = [];
        list.filter((index, i) => {
            if (i == 1 || i == 9 || i == 17 || i == 25 || i == 33) {
                days.push(index);
            }
        });
        return days;
    }

    function updateWeatherDOM(data, unit) {
        let symbol = "°F";
        if (unit !== "imperial") symbol = "°C";
        const windDir = windDegToDir(data.windDir);

        const city = document.getElementById("city");
        const country = document.getElementById("country");
        const desc = document.getElementById("desc");
        const temp = document.getElementById("temp");
        const low = document.getElementById("low");
        const high = document.getElementById("high");
        const feelsLike = document.getElementById("feels-like");
        const humidity = document.getElementById("humidity");
        const wind = document.getElementById("wind");

        city.innerHTML = `${data.city} ${data.country}`;
        desc.innerHTML = data.desc.toUpperCase();
        temp.innerHTML = `Current: ${Math.floor(data.temp)}${symbol}`;
        feelsLike.innerHTML = `Feels like: ${Math.floor(
            data.feelsLike
        )}${symbol}`;
        low.innerHTML = `Low: ${Math.floor(data.low)}${symbol}`;
        high.innerHTML = `High: ${Math.floor(data.high)}${symbol}`;
        humidity.innerHTML = `Humidity: ${data.humidity}%`;
        wind.innerHTML = `Wind: ${windDir} ${data.windSpeed} mph`;

        function windDegToDir(deg) {
            if (340 >= deg && deg <= 20) return "N";
            if (20 < deg && deg < 70) return "NE";
            if (70 <= deg && deg <= 110) return "E";
            if (110 < deg && deg < 160) return "SE";
            if (160 <= deg && deg <= 200) return "S";
            if (200 < deg && deg < 250) return "SW";
            if (250 <= deg && deg <= 290) return "W";
            if (290 < deg && deg < 340) return "NW";
        }
    }

    function updateForecastDOM(forecast, unit) {
        let symbol = "°F";
        if (unit !== "imperial") symbol = "°C";
        const date = Array.from(document.querySelectorAll(".date"));
        const temp = Array.from(document.querySelectorAll(".temp"));
        const high = Array.from(document.querySelectorAll(".high"));
        const low = Array.from(document.querySelectorAll(".low"));
        forecast.forEach((day, i) => {
            const currDate = new Date(day.dt * 1000);
            const dateDay = currDate.getDate();
            const dateMonth = currDate.getMonth() + 1;
            date[i].innerHTML = `${dateMonth}/${dateDay}`;
            temp[i].innerHTML = `${Math.floor(day.main.temp)}${symbol}`;
            high[i].innerHTML = `H<br>${Math.floor(
                day.main.temp_max
            )}${symbol}`;
            low[i].innerHTML = `L<br>${Math.floor(day.main.temp_min)}${symbol}`;
        });
    }

    function setBackGround(weather) {
        const currWeather = weather.weather.replace(/\s/g, "");
        if (700 < weather.id && weather < 800) currWeather = "Mist";
        document.querySelector(
            "body"
        ).style.backgroundImage = `url(./assets/${currWeather}.jpg`;
        document.querySelector("body").style.backgroundSize = "100vw 100vh";
        //handle loadscreen
        document.querySelector(".loadscreen").classList.add("hidden");
        document.querySelector(".content").classList.remove("hidden");
        //
    }

    function unitListener(city) {
        const checkbox = document.getElementById("checkbox");
        checkbox.onchange = function () {
            let unit;
            if (checkbox.checked == true) unit = "imperial";
            else unit = "metric";
            fetchWeather.getData(city, unit);
        };
    }
    return { getData };
})();

window.addEventListener("load", () => {
    fetchWeather.getData("Minneapolis", "imperial");
});

document.querySelector(".submit").addEventListener("click", (e) => {
    let unit;
    const checkbox = document.getElementById("checkbox");
    e.preventDefault();
    const city = document.querySelector(".searchbar");
    if (!city.checkValidity()) {
        city.reportValidity();
    } else {
        if (checkbox.checked == true) unit = "imperial";
        else unit = "metric";
        fetchWeather.getData(city.value, unit)
        city.value = "";
    }
});

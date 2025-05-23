const apiKey = '7263c6cc3223417cece9afdca96f3131' ;

function validateCityName(city) {
    const regex = /^[A-Za-zÀ-ÿ\s-]+$/ ;
    return regex.test(city.trim()) ;
}

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric` ;
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error("Cidade não encontrada ou erro na API.") ;
    }

    const dados = await resposta.json() ;
    return {
        temp: dados.main.temp,
        descricao: dados.weather[0].description,
        umidade: dados.main.humidity,
        vento: dados.wind.speed
    };
}

document.getElementById('form-consulta').addEventListener('submit', async function (e) {
    e.preventDefault() ;

    const cidadeInput = document.getElementById('input-cidade').value.trim() ;

    if (!validateCityName(cidadeInput)) {
        alert("Nome de cidade inválido. Use apenas letras, espaços e traços.") ;
        return;
    }

    try {
        const clima = await getWeather(cidadeInput) ;

        document.getElementById('temperatura-atual').textContent = `${clima.temp}°C` ;
        document.getElementById('clima-descricao').textContent = clima.descricao ;
        document.getElementById('umidade').textContent = `${clima.umidade}%` ;
        document.getElementById('vento').textContent = `${clima.vento} m/s` ;

    } catch (erro) {
        alert("Erro ao consultar cidade. Verifique se o nome está correto.") ;
        console.error(erro);
    }
});

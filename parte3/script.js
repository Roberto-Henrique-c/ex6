async function buscarDadosIBGE(nomeCidade) {
    const resposta = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios") ;
    const municipios = await resposta.json() ;

    const cidadeEncontrada = municipios.find(m => m.nome.toLowerCase() === nomeCidade.toLowerCase()) ;

    if (!cidadeEncontrada) {
        throw new Error("Cidade não encontrada pelo IBGE") ;    
    }

    return {
        nome: cidadeEncontrada.nome,
        regiao: cidadeEncontrada.microrregiao.mesorregiao.UF.regiao.nome,
        estado: cidadeEncontrada.microrregiao.mesorregiao.UF.nome
    }
}


const apiKey = '7263c6cc3223417cece9afdca96f3131';  

class Estado {
    constructor (cidade, populacao, regiao, disponivel) {
        this.cidade = cidade;
        this.populacao = populacao;
        this.regiao = regiao;
        this.disponivel = disponivel;
    }


 async previsaoDoTempo() {
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.cidade)}&appid=${apiKey}&units=metric`;
    const resposta = await fetch (url) ;
    const dados = await resposta.json() ;
    return dados.main.temp ;
}

async temperaturaAtual() {
    return await this.previsaoDoTempo() ;
}

informacoes() {
    return `Cidade: ${this.cidade} | População: ${this.populacao} | Região: ${this.regiao}`;
}
}

let historiaConsultas = [] ;

document.getElementById('form-consulta').addEventListener('submit', async function (e) {
    e.preventDefault() ;

    const cidadeInput = document.getElementById('input-cidade').value.trim() ;

    if (!cidadeInput) {
        alert("Por favor, Digite uma cidade")
        return ;
    }

    let infoIBGE
    try {
        infoIBGE = await buscarDadosIBGE(cidadeInput) ; 
    } catch (erro) {
        alert("Cidade não encontrada na base de dados do IBGE.") ; 
        console.error(erro) ; 
        return ; 
    }

   let populacao ; 
   try {
    const resPop = await fetch(`https://servicodados.ibge.gov.br/api/v1/projecoes/populacao/${infoIBGE.id}`) ; 
    const dadosPop = await resPop.json() ;
    populacao = dadosPop.projecao.populacao.toLocaleString('pt-br') ;  
   } catch (erro) {
    populacao = "Dados não disponíveis";
    console.error("Erro ao buscar população", erro) ; 
   }

   const estado = new Estado(infoIBGE.nome, populacao, infoIBGE.regiao, "Sim");

    try {
        const temp = await estado.temperaturaAtual() ; 

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidadeInput)}&appid=${apiKey}&units=metric` ;
        const resposta = await fetch(url) ;
        const dados = await resposta.json() ;
        
        document.getElementById('temperatura-atual').textContent = `${temp}°C`;
        document.getElementById('clima-descricao').textContent = dados.weather[0].description;
        document.getElementById('umidade').textContent = `${dados.main.humidity}%`;
        document.getElementById('vento').textContent = `${dados.wind.speed} m/s`;

        document.getElementById('cidade-nome').textContent = estado.cidade ;
        document.getElementById('populacao').textContent = estado.populacao ;
        document.getElementById('regiao').textContent = estado.regiao ;
        document.getElementById('disponivel').textContent = estado.disponivel ;

        const historicoItem = document.createElement('li') ;
        historicoItem.textContent = `${estado.cidade} - ${temp}°C - ${dados.weather[0].description}` ; 
        document.getElementById('lista-historico').appendChild(historicoItem) ; 

        historiaConsultas.push(estado.informacoes()) ; 
    } catch (erro) {
        alert("Erro ao consultar uma cidade. Verifique se o nome está absolutamente correto.") ; 
        console.error(erro) ; 
    }

    
}) ; 

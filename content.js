//URL api
const API_URL = "https://api.languagetoolplus.com/v2/check";

//definindo os limites de caracteres do plano gratuito
const LIMITE_CARACTERES = 20000;

//tempo de espera após o campo ser digitado em milissegundos
const DELAY_ANALISE = 1000;

//armazenando o timer de cada campo
const timers = new Map();

//armazenando os erros encontrados em cada campo
const errosPorCampo = new Map();

//criando icone e posicionando no canto inferior direito do campo 
function criarIcone(campo){
    
    // evitando de enviar o icone duplicado no mesmo campo
    if (campo.dataset.amoraIcone) return;
    campo.dataset.amoraIcone = "true";

    //criando o elemento icone
    const icone = document.createElement("img");
    icone.className = "amora-icone";

    //estilo do icone
    icone.style.cssText = `
        position: absolute;
        width: 24px;
        height: 24px;
        cursor: pointer;
        z-index: 999999;
        display: none;
    `;

    //adicionando o icone na página
    document.body.appendChild(icone);

    //posicionando o icone no canto inferior do campo
    function posicionarIcone(){
        const rect = campo.getBoundingClientRect();
        icone.style.top = `${rect.bottom - 28 + window.scrollY}px`;
        icone.style.left = `${rect.right - 28 + window.scrollX}px`;
    }

    posicionarIcone();

    //reposicionando icone se a tela for redimensionada ou rolada
    window.addEventListener("scroll", posicionarIcone);
    window.addEventListener("resize", posicionarIcone);

    return icone;
}

// caminho da base dos icones
const ICONES = {
    analisando: chrome.runtime.getURL("icons/analisando.png"),
    correto: chrome.runtime.getURL("icons/correto.png"),
    errado: chrome.runtime.getURL("icons/errado.png"),
}

//mudando o estado visual do icone
function setEstadoIcone(icone, estado){
    icone.src = ICONES[estado];
    icone.style.display = "block";
}

//escondendo o icone
function esconderIcone(icone){
    icone.style.display = "none";
}

//analisa o texto do campo e atualiza o icone
async function analisarCampo(campo, icone){
    const texto = campo.value;

    //se o campo estiver vazio, esconde o icone e para
    if(!texto.trim()){
        esconderIcone(icone);
        return;
    }

    //se o texto for muito longo, avisa e para
    if(texto.length > LIMITE_CARACTERES){
        setEstadoIcone(icone, "errado");
        errosPorCampo.set(campo,[{
            mensagem: "Texto muito longo para ser analisado (limite: 20.000 caracteres).",
            replacements: [],
            offset: 0,
            length: 0
        }])
        return;
    }

    // mostrando o icone analisando enquando agurada a api
    setEstadoIcone(icone, "analisando");

    try{
        // enviando o texto para a api
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type":"application/x-www-form-urlencoded"},
            body: `text=${encodeURIComponent(texto)}&language=pt-BR`
        });

        // Verifica se a API respondeu corretamente antes de converter
        if (!resposta.ok) {
         console.error("Amora: API retornou erro", resposta.status, await resposta.text());
            esconderIcone(icone);
             return;
        }

        const dados = await resposta.json();

        //sem encontrar erros
        if(dados.matches.length === 0){
            setEstadoIcone(icone, "correto");
            errosPorCampo.delete(campo);
            return;
        }

        //se encontrar erros
        setEstadoIcone(icone, "errado");
        errosPorCampo.set(campo, dados.matches);
    }catch(erro){
        //se a api falhar, esconde o icone silenciosamente
        esconderIcone(icone);
        console.error("Amora: erro ao conectar com a API", erro);
    }
}

//cria/atualiza o popup de erros na página
function mostrarPopupErros(campo, icone){
    const erros = errosPorCampo.get(campo);
    if (!erros || erros.length === 0) return;

    //remove o popup anterior se existir
    const popupAnterior = document.getElementById("amora-popup");
    if (popupAnterior) popupAnterior.remove();

    //cria o popup
    const popup = document.createElement("div");
    popup.id = "amora-popup";
    popup.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
        width: 280px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999999;
        font-family: sans-serif;
        font-size: 13px;
    `;

    //posiciona o popup acima do icone
    const rect = icone.getBoundingClientRect();
    popup.style.top = `${rect.top - 10 + window.scrollY}px`;

    popup.style.left = `${rect.left - 260 + window.scrollX}px`;

    //titulo do popup
    const titulo = document.createElement("strong");
    titulo.textContent = `Amora - ${erros.length} erro(s) encontrados`;
    titulo.style.cssText = "display: block; margin-bottom: 8px; color: #333;";
    popup.appendChild(titulo);

    //lista de erros
    erros.forEach((erro, index) => {
        const item = document.createElement("div");
        item.style.cssText = `
            background: #f9f9f9;
            border-radius: 6px;
            padding: 8px;
            margin-bottom: 6px;
            border-left: 3px solid #e74c3c;
        `;

        //texto do erro
        const textoErro = document.createElement("p");
        textoErro.style.cssText = "margin: 0 0 4px 0; color: #555;";
        textoErro.textContent = erro.message || erro.mensagem;
        item.appendChild(textoErro);

        //sugestão
        if (erro.replacements && erro.replacements.length > 0){
            const sugestao = document.createElement("p");
            sugestao.style.cssText = "margin: 0;color: #27ae60; font-weight: bold;";
            sugestao.textContent = `Sugestão: ${erro.replacements[0].value}`;
            item.appendChild(sugestao);
        }

        popup.appendChild(item);
    });


    //botão de correção
    const botao = document.createElement("button");
    botao.textContent = "Corrigir tudo";
    botao.style.cssText = `
        width: 100%;
        padding: 8px;
        margin-top: 8px;
        background: #6c3483;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
    `;

   //ação quando clicar no botão
   botao.addEventListener("click", ()=>{
    const texto = campo.value;
    let textoCorrigido = texto;

    //corrige da direita pra esquerda
    [...erros].reverse().forEach(erro=>{
        if (erro.replacements && erro.replacements.length > 0){
            const inicio = erro.offset;
            const fim = erro.offset + erro.length;
            textoCorrigido = textoCorrigido.slice(0,inicio) + erro.replacements[0].value + textoCorrigido.slice(fim);
        }
    })

    //aplicando o texto corrigido
    campo.value = textoCorrigido;
    campo.dispatchEvent(new Event("input",{bubbles: true}));
    campo.dispatchEvent(new Event("change",{bubbles: true}));

    //atualiza o icone para o correto e fecha i popup
    setEstadoIcone(icone, "correto");
    errosPorCampo.delete(campo);
    popup.remove();
   });

   popup.appendChild(botao);
   document.body.appendChild(popup);

   //fecha o popup quando clicado fora dele
   setTimeout(() =>{
    document.addEventListener("click", function fecharPopup(e){
        if (!popup.contains(e.target) && e.target !== icone){
            popup.remove();
            document.removeEventListener("click", fecharPopup);
        }
    });
   }, 100);
}

//monitora um campo de texto especifico
function monitorarCampo(campo){
    //Cria o icone para esse campo
    const icone = criarIcone(campo);
    if(!icone) return;

   //ao clicar no icone mostra o popup de erros
   icone.addEventListener("click", (e) =>{
    e.stopPropagation();
    mostrarPopupErros(campo, icone);
   });

   //quando o usuario digita, aguarda 1 segundo antes de analisar
   campo.addEventListener("input", () =>{
    //remove o popup aberto se existir
    const popupAnterior = document.getElementById("amora-popup");
    if(popupAnterior) popupAnterior.remove();

    //cancela o time anterior
    if(timers.has(campo)){
        clearTimeout(timers.get(campo));
    }

    //inicia um novo timer
    const timer = setTimeout(() =>{
        analisarCampo(campo, icone);
    }, DELAY_ANALISE);
    timers.set(campo, timer);
   });

   //mostra o icone quando o campo recebe foco
   campo.addEventListener("focus", () =>{
    if (campo.value.trim()){
        icone.style.display = "block";
    }
   });

   //escondendo o icone quando o campo esta fora de foco
   campo.addEventListener("blur", () =>{
    setTimeout(() =>{
        const popupAberto = document.getElementById("amora-popup");
        if(!popupAberto){
            esconderIcone(icone);
        }
        },200);
    });
}


function inicializar(){
    const campos = document.querySelectorAll("input[type='text'], textarea");
    campos.forEach(campo => monitorarCampo(campo));

    //observa se novos campos aparecem na página dinamicamente
    const observer = new MutationObserver(() => {
        const novosCampos = document.querySelectorAll("input[type='text']:not([data-amora-icone]), textarea:not([data-amora-icone])");
        novosCampos.forEach(campo => monitorarCampo(campo));
    });

    //observa as mudanças em toda a página
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

//inicia a extensão
inicializar();
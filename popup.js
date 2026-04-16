//aguardando o clique do botão
document.getElementById("corrigir").addEventListener("click",() =>{

    //buscando a aba em que o usário está no momento
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>{

        //injeta e executa o content.js na aba ativada
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ["content.js"]
        });
    });
});
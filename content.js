async function corrigirTexto() {
    //busca todos os campos de texto da página
    const campos = document.querySelectorAll("input[type='text'], textarea");

    //percorrendo cada campo encontrado
    for(const campo of campos){
        const texto = campo.value;

        //ignorando campos vazios
        if(!texto.trim()) continue;

        //enviando o texto para a API da LanguageTool
        const resposta = await fetch("https://api.languagetoolplus.com/v2/check", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded" },
            body: 'text=${encodeURIComponent(texto)}&language=pt-BR'
        });

        //convertendo a resposta para json
        const dados = await resposta.json();

        let textoCorrigido = texto;

        //percorrendo os erros de trás oara frente evitando deslocar as posição ao substituir palavras
        for(const erro of dados.matches.reverse()){

            //só corrige se houver sugestões disponíveis
            if(erro.replacements.length > 0){
                const inicio = erro.offset;
                const fim = erro.offset + erro.length;

                //substituindo o erro pela primeira sugestão

                textoCorrigido = textoCorrigido.slice(0, inicio) + erro.replacements[0].value + textoCorrigido.slice(fim);
            }
        }

        //aplicando o texto corrigido para o campo
        campo.value = textoCorrigido;
    }
}

 //executando a função ao rodar o script
corrigirTexto();
const htmlQuestionarios = (json) => {
    // a partir de um json, retorna o html correspondente a cada um dos questionários: título e descrição
    let html = '';
    for (const questionario of json) {
        html += `
            <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                <h3>${questionario.titulo}</h3>
                <p>${questionario.descricao}</p>
                <button onclick="window.location.href='questionario.html?id=${questionario.idInterno}';">
                    Selecionar
                </button>
            </div>
            <hr> 
        `;
    }
    return html
}

async function carregarQuestionarios() {
    try {
        const response = await fetch('/api/questionarios');
        const dados = await response.json();
        console.log("Dados recebidos:", dados);
        const div_lista = document.getElementById("lista");
        div_lista.innerHTML = htmlQuestionarios(dados);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

// Chamar a função assim que a página carregar
window.onload = carregarQuestionarios;
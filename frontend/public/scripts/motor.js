const renderizarQuestionario = (questionario) => {
    const div = document.getElementById('container-questionario');
    let html = ''
    html += `<h1>${questionario.titulo}</h1>`;
    for (grupo of questionario.grupos) {
        html += `<div id="${grupo.idInterno}" class="grupo", style="display: none">`;
        html += `<h2>${grupo.titulo}</h2>`
        for (pergunta of grupo.perguntas) {
            if (!pergunta.tipo.includes("invisivel")) {
                html += `<div id="${pergunta.idInterno}" class="pergunta" style="display: none">`;
                html += `<p>${pergunta.escopo}</p>`
                if (pergunta.tipo.includes("escolha_unica")) {
                    for (let i = 0; i < pergunta.opcoes.length; i++) {
                        let idOpcao = pergunta.idInterno + `_${i}`;
                        html += `<input type="radio" id="${idOpcao}" value="${idOpcao}"><label for="${idOpcao}">${pergunta.opcoes[i].texto}</label><br>`;
                    }
                } else if (pergunta.tipo.includes("numerico")) {
                    html += `<input type="number" id="${pergunta.idInterno}_box">`
                } else if (pergunta.tipo.includes("escolha_multipla")) {
                    for (let i = 0; i < pergunta.opcoes.length; i++) {
                        let idOpcao = pergunta.idInterno + `_${i}`;
                        html += `<input type="checkbox" id="${idOpcao}" value="${idOpcao}"><label for="${idOpcao}">${pergunta.opcoes[i].texto}</label><br>`;
                    }
                }
                html += `<button onclick="computarResposta('${pergunta.idInterno}', '${pergunta.proximo}', '${pergunta.tipo}')">Enviar</button>`
            }
            html += "</div>";
        }
        html += `</div>`;
    }
    div.innerHTML = html

    // Rotina para ativar o primeiro grupo
    idPrimeiroGrupo = questionario.primeiro
    primeiroGrupo = questionario.grupos.find(u => u.idInterno == idPrimeiroGrupo)
    idPrimeiraPergunta = primeiroGrupo.primeiro
    
    document.getElementById(idPrimeiroGrupo).style.display = "block";
    document.getElementById(idPrimeiraPergunta).style.display = "block";
}

const respostasUsuario = {};

function computarResposta(idAtual, idProximo, tipo) {
    let valor = '';
    if (tipo.includes("numerico")) {
        valor = document.getElementById(`${idAtual}_box`).value;
    } 
    else if (tipo.includes("escolha_unica")) {
        const selecionado = document.querySelector(`input[id^="${idAtual}_"]:checked`);
        valor = selecionado ? selecionado.value : null;
    }
    else if (tipo.includes("escolha_multipla")) {
        const selecionados = document.querySelectorAll(`input[id^="${idAtual}_"]:checked`);
        valor = Array.from(selecionados).map(cb => cb.value);
    }

    respostasUsuario[idAtual] = valor;

    document.getElementById(idAtual).style.display = 'none';
    
    if (idProximo && idProximo !== 'null' && document.getElementById(idProximo)) {
        document.getElementById(idProximo).style.display = 'block';
    } else {
        console.log("Fim do questionário!", respostasUsuario);
        alert("Questionário finalizado! Verifique o console.");
    }
}

async function iniciarMotor() {
    // pega parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idQuestionario = urlParams.get('id');

    if (!idQuestionario) {
        alert("Erro: Nenhum questionário selecionado!");
        return;
    }

    // faz o fetch específico para aquele ID
    const response = await fetch(`/api/questionarios/${idQuestionario}`);
    const questionario = await response.json();

    renderizarQuestionario(questionario[0]);
}

window.onload = iniciarMotor;
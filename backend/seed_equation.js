const mongoose = require("mongoose");
const Questionario = require("./src/models/Questionario.js")
const connectDB = require("./src/config/db.js")

// JSON QUESTIONARIO
const questionarioSarcopenia = {
    titulo: "Equation Test",
    idInterno: "eqtest",
    descricao: "Equation Test",
    criadoPor: "mim (idUsuario)",
    primeiro: "idp",
    blocos: [
        {
            idInterno: "idp",
            titulo: "Identificação",
            tipo: "identificacao",
            primeiro: "idp_sexo",
            perguntas: 
            [{
                idInterno: "idp_idade",
                escopo: "Qual a idade do paciente?",
                tipo: "numerico",
                logica: "identificacao",
                configuracao: {proximo: "idp_sexo"}
            },
            {
                idInterno: "idp_sexo",
                escopo: "Qual o sexo do paciente?",
                tipo: "escolha_unica",
                logica: "identificacao",
                configuracao: [
                    {
                        opcao: "Masculino",
                        proximo: "idp_raca"
                    }, 
                    {
                        opcao: "Feminino",
                        proximo: "idp_raca"
                    }
                ],
            },
            {
                idInterno: "idp_raca",
                escopo: "Qual a raça do paciente?",
                tipo: "escolha_unica",
                logica: "identificacao",
                configuracao: [
                    {
                        opcao: "Branco",
                        proximo: "idp_altura"
                    }, 
                    {
                        opcao: "Negro",
                        proximo: "idp_altura"
                    },
                    {
                        opcao: "Asiático",
                        proximo: "idp_altura"
                    }
                ],
            },
            {
                idInterno: "idp_altura",
                escopo: "Qual a altura do paciente (em metros)?",
                tipo: "numerico",
                logica: "identificacao",
                configuracao: {proximo: "idp_peso"}
            },
            {
                idInterno: "idp_peso",
                escopo: "Qual o peso do paciente (em kg)?",
                tipo: "numerico",
                logica: "identificacao",
                configuracao: {proximo: {proximo: "equacao"}}
            }]
        },
        {
            idInterno: "equacao",
            titulo: "Avaliação de Massa Muscular",
            tipo: "comum",
            primeiro: "equacao_lee",
            perguntas: 
            [{
                idInterno: "equacao_lee",
                escopo: "Escreva o valor obtido ao calcular a Equação de Lee", // por enquanto isso
                tipo: "equacao",
                logica: "redirecionamento",
                contexto: "idp_sexo",
                configuracao:
                {
                    variaveis: 
                    [{
                        idInterno: "idp_peso",
                        variavel: "P",
                        opcoes: {}
                    },
                    {
                        idInterno: "idp_altura",
                        variavel: "h",
                        opcoes: {}
                    },
                    {
                        idInterno: "idp_sexo",
                        variavel: "S",
                        opcoes: 
                        [{
                            opcao: "Masculino",
                            valor: 1
                        },
                        {
                            opcao: "Feminino",
                            valor: 0
                        }]
                    },
                    {
                        idInterno: "idp_idade",
                        variavel: "I",
                        opcoes: {}
                    },
                    {
                        idInterno: "idp_raca",
                        variavel: "R",
                        opcoes: [{
                            opcao: "Branco",
                            valor: 0
                        },
                        {
                            opcao: "Negro",
                            valor: 1.4
                        },
                        {
                            opcao: "Asiático",
                            valor: -1.2
                        }]
                    }],
                    equacao: "\\frac{0.244P + 7.8h + 6.6S - 0.098I + R - 3.3}{h^2}", // considerando um leitor e executor de equações latex
                    condicional: 
                    [{
                        opcao: "Masculino",
                        escolhido: 
                        {
                            regra: "menor_que",
                            limiar: 8.9,
                            verdadeiro: {
                                proximo: {proximo: {diagnostico: "Positivo"}}
                            },
                            falso: {
                                proximo: {proximo: {diagnostico: "Provável"}}
                            }
                        }
                    },
                    {
                        opcao: "Feminino",
                        escolhido: 
                        {
                            regra: "menor_que",
                            limiar: 6.4,
                            verdadeiro: {
                                proximo: "equacao2"
                            },
                            falso: {
                                proximo: "equacao2"
                            }
                        }
                    }] 
                }
            },
            {
                idInterno: "equacao2",
                escopo: "Escreva o valor obtido ao calcular a Equação de Lee", // por enquanto isso
                tipo: "equacao",
                logica: "redirecionamento",
                configuracao:
                {
                    variaveis: 
                    [{
                        idInterno: "idp_peso",
                        variavel: "P",
                        opcoes: {}
                    },
                    {
                        idInterno: "idp_altura",
                        variavel: "h",
                        opcoes: {}
                    },
                    {
                        idInterno: "idp_sexo",
                        variavel: "S",
                        opcoes: 
                        [{
                            opcao: "Masculino",
                            valor: 1
                        },
                        {
                            opcao: "Feminino",
                            valor: 0
                        }]
                    },
                    {
                        idInterno: "idp_idade",
                        variavel: "I",
                        opcoes: {}
                    },
                    {
                        idInterno: "idp_raca",
                        variavel: "R",
                        opcoes: [{
                            opcao: "Branco",
                            valor: 0
                        },
                        {
                            opcao: "Negro",
                            valor: 1.4
                        },
                        {
                            opcao: "Asiático",
                            valor: -1.2
                        }]
                    }],
                    equacao: "P^2 - sqrt{h + S^I} + R", // considerando um leitor e executor de equações latex
                    condicional: 
                    {
                        regra: "menor_que",
                        limiar: 8.9,
                        verdadeiro: {
                            proximo: {proximo: {diagnostico: "Positivo"}}
                        },
                        falso: {
                            proximo: {proximo: {diagnostico: "Provável"}}
                        }
                    } 
                }
            }]
        }
    ]
}

const seed = async () => {
    await connectDB(); // conexão com a database
    //await Questionario.deleteMany({}); // limpeza inicial
    await Questionario.create(questionarioSarcopenia)
        .then(() => console.log('Questionário criado com sucesso'))
        .catch((err) => console.log('ERRO! ',  err));

    mongoose.connection.close();
}

seed();
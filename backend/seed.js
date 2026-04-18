const mongoose = require("mongoose");
const Questionario = require("./src/models/Questionario.js")
const connectDB = require("./src/config/db.js")

// JSON QUESTIONARIO
const questionarioSarcopenia = {
    titulo: "Sarcopenia",
    idInterno: "sarcopenia",
    descricao: "Questionário para diagnóstico de Sarcopenia, amparado pelo European Working Group on Sarcopenia in Older People 2 (EWGSOP2)",
    criadoPor: "mim (idUsuario)",
    primeiro: "idp",
    blocos: [
        {
            idInterno: "idp",
            titulo: "Identificação",
            tipo: "identificacao",
            primeiro: "idp_nome",
            perguntas: 
            [{
                idInterno: "idp_nome",
                escopo: "Qual o nome do paciente?",
                tipo: "texto",
                logica: "identificacao",
                configuracao: {proximo: "idp_idade"}
            },
            {
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
                configuracao: {proximo: {proximo: "encontrar_caso"}}
            }]
        },
        {
            idInterno: "encontrar_caso",
            titulo: "SARC-CaIF",
            tipo: "peso",
            primeiro: "forca_carga",
            perguntas: 
            [{
                idInterno: "forca_carga",
                escopo: "O quanto de dificuldade você tem para levantar e carregar 5kg?",
                tipo: "escolha_unica",
                logica: "peso",
                configuracao: 
                [{
                    opcao: "Nenhuma",
                    escolhido: 
                    {
                        peso: 0,
                        proximo: "ajuda_caminhar"
                    }
                },
                {
                    opcao: "Alguma",
                    escolhido: 
                    {
                        peso: 1,
                        proximo: "ajuda_caminhar"
                    }
                },
                {
                    opcao: "Muita ou não consegue",
                    escolhido: 
                    {
                        peso: 2,
                        proximo: "ajuda_caminhar"
                    }
                }]
            },
            {
                idInterno: "ajuda_caminhar",
                escopo: "O quanto de dificuldade você tem para atravessar um cômodo?",
                tipo: "escolha_unica",
                logica: "peso",
                configuracao: 
                [{
                    opcao: "Nenhuma",
                    escolhido: 
                    {
                        peso: 0,
                        proximo: "levantar_cadeira"
                    } 
                },
                {
                    opcao: "Alguma",
                    escolhido: 
                    {
                        peso: 1,
                        proximo: "levantar_cadeira"
                    }
                },
                {
                    opcao: "Muita, usa apoios ou é incapaz",
                    escolhido: 
                    {
                        peso: 2,
                        proximo: "levantar_cadeira"
                    } 
                }]
            },
            {
                idInterno: "levantar_cadeira",
                escopo: "O quanto de dificuldade você tem para levantar de uma cama ou cadeira?",
                tipo: "escolha_unica",
                logica: "peso",
                configuracao: [{
                    opcao: "Nenhuma",
                    escolhido: 
                    {
                        peso: 0,
                        proximo: "subir_escadas"
                    }
                },
                {
                    opcao: "Alguma",
                    escolhido: 
                    {
                        peso: 1,
                        proximo: "subir_escadas"
                    }
                },
                {
                    opcao: "Muita ou não consegue sem ajuda",
                    escolhido: 
                    {
                        peso: 2,
                        proximo: "subir_escadas"
                    }
                }]
            },
            {
                idInterno: "subir_escadas",
                escopo: "O quanto de dificuldade você tem para subir um lance de escadas de 10 degraus?",
                tipo: "escolha_unica",
                logica: "peso",
                configuracao: [{
                    opcao: "Nenhuma",
                    escolhido: 
                    {
                        peso: 0,
                        proximo: "quedas"
                    } 
                },
                {
                    opcao: "Alguma",
                    escolhido: 
                    {
                        peso: 1,
                        proximo: "quedas"
                    }
                },
                {
                    opcao: "Muita ou não consegue",
                    escolhido: 
                    {
                        peso: 2,
                        proximo: "quedas"
                    }
                }],
            },
            {
                idInterno: "quedas",
                escopo: "Quantas vezes você caiu no último ano?",
                tipo: "escolha_unica",
                logica: "peso",
                configuracao: [{
                    opcao: "Nenhuma",
                    escolhido: 
                    {
                        peso: 0,
                        proximo: "cp"
                    } 
                },
                {
                    opcao: "1 - 3 quedas",
                    escolhido: 
                    {
                        peso: 1,
                        proximo: "cp"
                    }
                },
                {
                    opcao: "4 ou mais quedas",
                    escolhido: 
                    {
                        peso: 2,
                        proximo: "cp"
                    }
                }],
            },
            {
                idInterno: "cp",
                escopo: "Circunferência da Panturrilha (CP)",
                tipo: "numerico",
                logica: "peso",
                contexto: "idp_sexo",
                configuracao: 
                [{
                    opcao: "Masculino",
                    escolhido: 
                    {
                        regra: "maior_que",
                        limiar: 34,
                        verdadeiro: {
                            peso: 0,
                            proximo: "calculoPeso",
                        },
                        falso: {
                            peso: 10,
                            proximo: "calculoPeso"
                        }
                    }
                },
                {
                    opcao: "Feminino",
                    escolhido: 
                    {
                        regra: "maior_que",
                        limiar: 33,
                        verdadeiro: {
                            peso: 0,
                            proximo: "calculoPeso",
                        },
                        falso: {
                            peso: 10,
                            proximo: "calculoPeso"
                        }
                    }
                }]
            },
            {
                idInterno: "calculoPeso",
                tipo: "calculoPeso",
                logica: "redirecionamento",
                configuracao: {
                    regra: "maior_que",
                    limiar: 11,
                    verdadeiro: {
                        proximo: {proximo: "avaliacao_forca"},
                    },
                    falso: {
                        proximo: {proximo: {diagnostico: "Negativo"}}
                    }
                }
            }]
        },

        {
            idInterno: "avaliacao_forca",
            titulo: "Avaliação de Força Muscular",
            tipo: "comum",
            primeiro: "escolha_forca",
            perguntas: 
            [{
                idInterno: "escolha_forca",
                escopo: "Escolha um método para avaliação.",
                tipo: "escolha_unica",
                logica: "redirecionamento",
                configuracao: 
                [{
                    opcao: "Força de Preensão Palmar com Dinamômetro",
                    proximo: "forca_preensao"
                },
                {
                    opcao: "Teste do sentar e levantar da cadeira",
                    proximo: "teste_cadeira"
                }]
            },
            {
                idInterno: "forca_preensao",
                escopo: "Quantos kg foram registrados no dinamômetro após o teste?",
                tipo: "numerico",
                logica: "redirecionamento",
                contexto: "idp_sexo",
                configuracao: 
                [{
                    opcao: "Masculino",
                    escolhido: 
                    {
                        regra: "menor_que",
                        limiar: 27,
                        verdadeiro: {
                            proximo: {proximo: "avaliacao_massa"}},
                        falso: {
                            proximo: {proximo: {diagnostico: "Negativo"}}
                        }
                    }
                },
                {
                    opcao: "Feminino",
                    escolhido: 
                    {
                        regra: "menor_que",
                        limiar: 16,
                        verdadeiro: {
                            proximo: {proximo: "avaliacao_massa"}},
                        falso: {
                            proximo: {proximo: {diagnostico: "Negativo"}}
                        }
                    }
                }]
            },
            {
                idInterno: "teste_cadeira",
                escopo: "Quantos segundos o paciente levou para executar o movimento de sentar e levantar da cadeira 5x?",
                tipo: "numerico",
                logica: "redirecionamento",
                configuracao: 
                {
                    regra: "maior_que",
                    limiar: 15,
                    verdadeiro: {
                        proximo: {proximo: "avaliacao_massa"}},
                    falso: {
                        proximo: {proximo: {diagnostico: "Negativo"}}
                    }
                }
            }]
        },

        {
            idInterno: "avaliacao_massa",
            titulo: "Avaliação de Massa Muscular",
            tipo: "comum",
            primeiro: "escolha_massa",
            perguntas: 
            [{
                idInterno: "escolha_massa",
                escopo: "Escolha um método para avaliação.",
                tipo: "escolha_unica",
                logica: "redirecionamento",
                configuracao: [{
                    opcao: "MMEA",
                    proximo: "valor_mmea"
                },
                {
                    opcao: "IMMEA",
                    proximo: "valor_immea"
                },
                {
                    opcao: "Equação de Lee",
                    proximo: "equacao_lee"
                }]
            },
            {
                idInterno: "valor_mmea",
                escopo: "Qual o valor de MMEA medido (em kg)?",
                tipo: "numerico",
                logica: "redirecionamento",
                contexto: "idp_sexo",
                configuracao:
                [{
                    opcao: "Masculino",
                    escolhido: 
                    {
                        regra: "menor_que",
                        limiar: 20,
                        verdadeiro: {
                            proximo: {proximo: "avaliacao_caminhada"}},
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
                        limiar: 15,
                        verdadeiro: {
                            proximo: {proximo: "avaliacao_caminhada"}},
                        falso: {
                            proximo: {proximo: {diagnostico: "Provável"}}
                        }
                    }
                }] 
            },
            {
                idInterno: "valor_immea",
                tipo: "numerico",
                logica: "redirecionamento",
                contexto: "idp_sexo",
                configuracao:
                [{
                    opcao: "Masculino",
                    escolhido: 
                    {
                        regra: "menor_que",
                        limiar: 7,
                        verdadeiro: {
                            proximo: {proximo: "avaliacao_caminhada"}},
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
                        limiar: 5.5,
                        verdadeiro: {
                            proximo: {proximo: "avaliacao_caminhada"}},
                        falso: {
                            proximo: {proximo: {diagnostico: "Provável"}}
                        }
                    }
                }] 
            },
            {
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
                    equacao: "\frac{0.244P + 7.8h + 6.6S - 0.098I + R - 3.3}{h^2}", // considerando um leitor e executor de equações latex
                    condicional: 
                    [{
                        opcao: "Masculino",
                        escolhido: 
                        {
                            regra: "menor_que",
                            limiar: 8.9,
                            verdadeiro: {
                                proximo: {proximo: "avaliacao_caminhada"}},
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
                                proximo: {proximo: "avaliacao_caminhada"}},
                            falso: {
                                proximo: {proximo: {diagnostico: "Provável"}}
                            }
                        }
                    }] 
                }
            }]
        },

        {
            idInterno: "avaliacao_caminhada",
            titulo: "Velocidade de Marcha",
            tipo: "redirecionamento",
            primeiro: "velocidade_marcha",
            perguntas: [{
                idInterno: "velocidade_marcha",
                escopo: "Quanto tempo o paciente levou para cumprir uma caminhada de 4 metros?",
                tipo: "numerico",
                logica: "diagnostico",
                configuracao: {
                    regra: "maior_que",
                    limiar: 5,
                    verdadeiro: {
                        proximo: {proximo: {diagnostico: "Positivo Grave"}}
                    }, 
                    falso: {
                        proximo: {proximo: {diagnostico: "Positivo"}}
                    }, 
                }
            }]
        }
    ]
}

const seed = async () => {
    await connectDB(); // conexão com a database
    await Questionario.deleteMany({}); // limpeza inicial
    await Questionario.create(questionarioSarcopenia)
        .then(() => console.log('Questionário criado com sucesso'))
        .catch((err) => console.log('ERRO! ',  err));

    mongoose.connection.close();
}

seed();
const mongoose = require("mongoose");
const Questionario = require("./src/models/Questionario.js")
const connectDB = require("./src/config/db.js")

// JSON QUESTIONARIO
const questionarioSarcopenia = {
  "titulo": "Sarcopenia v2",
  "idInterno": "sarcopenia_v2",
  "descricao": "Questionário para diagnóstico de Sarcopenia, amparado pelo European Working Group on Sarcopenia in Older People 2 (EWGSOP2)",
  "primeiro": "uid_bloco_1780422903459_w1i85",
  "blocos": [
    {
      "uid": "uid_bloco_1780422903459_w1i85",
      "idInterno": "idp",
      "titulo": "Dados do Paciente",
      "tipo": "identificacao",
      "primeiro": "uid_bloco_1780422903459_svwk12",
      "perguntas": [
        {
          "uid": "uid_bloco_1780422903459_svwk12",
          "idInterno": "idp_nome",
          "escopo": "Nome:",
          "tipo": "texto",
          "proximo": "uid_preset_1780422979310_ly6dp"
        },
        {
          "uid": "uid_preset_1780422979309_xk05j",
          "idInterno": "idp_sexo",
          "escopo": "Sexo:",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Masculino"
            },
            {
              "opcao": "Feminino"
            }
          ],
          "proximo": "uid_preset_1780422979310_bi5f3"
        },
        {
          "uid": "uid_preset_1780422979310_ly6dp",
          "idInterno": "idp_idade",
          "escopo": "Idade:",
          "tipo": "numerico",
          "proximo": "uid_preset_1780422979309_xk05j"
        },
        {
          "uid": "uid_preset_1780422979310_9k4o5",
          "idInterno": "idp_peso",
          "escopo": "Peso (kg):",
          "tipo": "numerico",
          "proximo": {
            "proximo": "uid_bloco_1780423054457_1shjt"
          }
        },
        {
          "uid": "uid_preset_1780422979310_2ntxc",
          "idInterno": "idp_altura",
          "escopo": "Altura (m):",
          "tipo": "numerico",
          "proximo": "uid_preset_1780422979310_9k4o5"
        },
        {
          "uid": "uid_preset_1780422979310_bi5f3",
          "idInterno": "idp_raca",
          "escopo": "Raça:",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Branco"
            },
            {
              "opcao": "Negro"
            },
            {
              "opcao": "Asiatico"
            }
          ],
          "proximo": "uid_preset_1780422979310_2ntxc"
        }
      ]
    },
    {
      "uid": "uid_bloco_1780423054457_1shjt",
      "idInterno": "encontrar_caso",
      "titulo": "SARC-CaIF",
      "tipo": "peso",
      "primeiro": "uid_pergunta_1780423086659_1nuvn",
      "perguntas": [
        {
          "uid": "uid_pergunta_1780423086659_1nuvn",
          "idInterno": "forca_carga",
          "escopo": "O quanto de dificuldade você tem para levantar e carregar 5kg?",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Nenhuma",
              "escolhido": {
                "peso": 0
              }
            },
            {
              "opcao": "Alguma",
              "escolhido": {
                "peso": 1
              }
            },
            {
              "opcao": "Muita ou não consegue",
              "escolhido": {
                "peso": 2
              }
            }
          ],
          "proximo": "uid_pergunta_1780423166316_46axj"
        },
        {
          "uid": "uid_pergunta_1780423166316_46axj",
          "idInterno": "ajuda_caminhar",
          "escopo": "O quanto de dificuldade você tem para atravessar um cômodo?",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Nenhuma",
              "escolhido": {
                "peso": 0
              }
            },
            {
              "opcao": "Alguma",
              "escolhido": {
                "peso": 1
              }
            },
            {
              "opcao": "Muita, usa apoios ou é incapaz",
              "escolhido": {
                "peso": 2
              }
            }
          ],
          "proximo": "uid_pergunta_1780423213923_f1jgy"
        },
        {
          "uid": "uid_pergunta_1780423213923_f1jgy",
          "idInterno": "levantar_cadeira",
          "escopo": "O quanto de dificuldade você tem para levantar de uma cama ou cadeira?",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Nenhuma",
              "escolhido": {
                "peso": 0
              }
            },
            {
              "opcao": "Alguma",
              "escolhido": {
                "peso": 1
              }
            },
            {
              "opcao": "Muita ou não consegue sem ajuda",
              "escolhido": {
                "peso": 2
              }
            }
          ],
          "proximo": "uid_pergunta_1780423259955_etqq7"
        },
        {
          "uid": "uid_pergunta_1780423259955_etqq7",
          "idInterno": "subir_escadas",
          "escopo": "O quanto de dificuldade você tem para subir um lance de escadas de 10 degraus?",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Nenhuma",
              "escolhido": {
                "peso": 0
              }
            },
            {
              "opcao": "Alguma",
              "escolhido": {
                "peso": 1
              }
            },
            {
              "opcao": "Muita ou não consegue",
              "escolhido": {
                "peso": 2
              }
            }
          ],
          "proximo": "uid_pergunta_1780423293827_tffxy"
        },
        {
          "uid": "uid_pergunta_1780423293827_tffxy",
          "idInterno": "quedas",
          "escopo": "Quantas vezes você caiu no último ano?",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Nenhuma",
              "escolhido": {
                "peso": 0
              }
            },
            {
              "opcao": "1-3 vezes",
              "escolhido": {
                "peso": 1
              }
            },
            {
              "opcao": "4+ vezes",
              "escolhido": {
                "peso": 2
              }
            }
          ],
          "proximo": "uid_pergunta_1780423337007_ktga2"
        },
        {
          "uid": "uid_pergunta_1780423337007_ktga2",
          "idInterno": "cp",
          "escopo": "Circunferência da Panturrilha (CP)",
          "tipo": "numerico",
          "contexto": "uid_preset_1780422979309_xk05j",
          "configuracao": {
            "regra": "maior_que",
            "limiar": {
              "Masculino": 34,
              "Feminino": 33
            },
            "verdadeiro": {
              "peso": 0
            },
            "falso": {
              "peso": 10
            }
          },
          "proximo": "calculoPeso"
        }
      ],
      "calculoPeso": {
        "regra": "maior_que",
        "limiar": 11,
        "verdadeiro": {
          "proximo": {
            "proximo": "uid_bloco_1780423398858_raxqs"
          }
        },
        "falso": {
          "proximo": {
            "proximo": {
              "diagnostico": "Negativo"
            }
          }
        }
      }
    },
    {
      "uid": "uid_bloco_1780423398858_raxqs",
      "idInterno": "avaliacao_forca",
      "titulo": "Avaliação de Força Muscular",
      "tipo": "comum",
      "primeiro": "uid_pergunta_1780423570565_742gb",
      "perguntas": [
        {
          "uid": "uid_pergunta_1780423570565_742gb",
          "idInterno": "escolha_forca",
          "escopo": "Escolha um método para avaliação.",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "Força de Preensão Palmar com Dinamômetro",
              "escolhido": {
                "proximo": "uid_pergunta_1780423618133_zs5lg"
              }
            },
            {
              "opcao": "Teste do sentar e levantar da cadeira",
              "escolhido": {
                "proximo": "uid_pergunta_1780423619065_a1v5u"
              }
            }
          ]
        },
        {
          "uid": "uid_pergunta_1780423618133_zs5lg",
          "idInterno": "forca_preensao",
          "escopo": "Quantos kg foram registrados no dinamômetro após o teste?",
          "tipo": "numerico",
          "contexto": "uid_preset_1780422979309_xk05j",
          "configuracao": {
            "regra": "menor_que",
            "limiar": {
              "Masculino": 27,
              "Feminino": 16
            },
            "verdadeiro": {
              "proximo": {
                "proximo": "uid_bloco_1780423655584_oy15w"
              }
            },
            "falso": {
              "proximo": {
                "proximo": {
                  "diagnostico": "Negativo"
                }
              }
            }
          }
        },
        {
          "uid": "uid_pergunta_1780423619065_a1v5u",
          "idInterno": "teste_cadeira",
          "escopo": "Quantos segundos o paciente levou para executar o movimento de sentar e levantar da cadeira 5x?",
          "tipo": "numerico",
          "configuracao": {
            "regra": "maior_que",
            "limiar": 15,
            "verdadeiro": {
              "proximo": {
                "proximo": "uid_bloco_1780423655584_oy15w"
              }
            },
            "falso": {
              "proximo": {
                "proximo": {
                  "diagnostico": "Negativo"
                }
              }
            }
          }
        }
      ]
    },
    {
      "uid": "uid_bloco_1780423655584_oy15w",
      "idInterno": "avaliacao_massa",
      "titulo": "Avaliação de Massa Muscular",
      "tipo": "comum",
      "primeiro": "uid_pergunta_1780423749918_8uvmd",
      "perguntas": [
        {
          "uid": "uid_pergunta_1780423749918_8uvmd",
          "idInterno": "escolha_massa",
          "escopo": "Escolha um método para avaliação.",
          "tipo": "escolha_unica",
          "configuracao": [
            {
              "opcao": "MMEA",
              "escolhido": {
                "proximo": "uid_pergunta_1780423790005_rwp8y"
              }
            },
            {
              "opcao": "IMMEA",
              "escolhido": {
                "proximo": "uid_pergunta_1780423801434_2ojca"
              }
            },
            {
              "opcao": "Equação de Lee",
              "escolhido": {
                "proximo": "uid_pergunta_1780423808727_46sis"
              }
            }
          ]
        },
        {
          "uid": "uid_pergunta_1780423790005_rwp8y",
          "idInterno": "valor_mmea",
          "escopo": "Qual o valor de MMEA medido (em kg)?",
          "tipo": "numerico",
          "contexto": "uid_preset_1780422979309_xk05j",
          "configuracao": {
            "regra": "menor_que",
            "limiar": {
              "Masculino": 20,
              "Feminino": 15
            },
            "verdadeiro": {
              "proximo": {
                "proximo": "uid_bloco_1780423862365_w2fsn"
              }
            },
            "falso": {
              "proximo": {
                "proximo": {
                  "diagnostico": "Provável"
                }
              }
            }
          }
        },
        {
          "uid": "uid_pergunta_1780423801434_2ojca",
          "idInterno": "valor_immea",
          "escopo": "Qual o valor de IMMEA medido?",
          "tipo": "numerico",
          "contexto": "uid_preset_1780422979309_xk05j",
          "configuracao": {
            "regra": "menor_que",
            "limiar": {
              "Masculino": 7,
              "Feminino": 5.5
            },
            "verdadeiro": {
              "proximo": {
                "proximo": "uid_bloco_1780423862365_w2fsn"
              }
            },
            "falso": {
              "proximo": {
                "proximo": {
                  "diagnostico": "Provável"
                }
              }
            }
          }
        },
        {
          "uid": "uid_pergunta_1780423808727_46sis",
          "idInterno": "equacao_lee",
          "escopo": "Eis o valor obtido pela Equação de Lee",
          "tipo": "equacao",
          "contexto": "uid_preset_1780422979309_xk05j",
          "configuracao": {
            "regra": "menor_que",
            "limiar": {
              "Masculino": 8.9,
              "Feminino": 6.4
            },
            "verdadeiro": {
              "proximo": {
                "proximo": "uid_bloco_1780423862365_w2fsn"
              }
            },
            "falso": {
              "proximo": {
                "proximo": {
                  "diagnostico": "Provável"
                }
              }
            }
          },
          "equacao": "\\frac{0.244P + 7.8h + 6.6S - 0.098I + R - 3.3}{h^2}",
          "variaveis": [
            {
              "uid": "uid_preset_1780422979310_9k4o5",
              "variavel": "P",
              "mapeamento": {}
            },
            {
              "uid": "uid_preset_1780422979310_2ntxc",
              "variavel": "h",
              "mapeamento": {}
            },
            {
              "uid": "uid_preset_1780422979309_xk05j",
              "variavel": "S",
              "mapeamento": {
                "Masculino": 1,
                "Feminino": 0
              }
            },
            {
              "uid": "uid_preset_1780422979310_ly6dp",
              "variavel": "I",
              "mapeamento": {}
            },
            {
              "uid": "uid_preset_1780422979310_bi5f3",
              "variavel": "R",
              "mapeamento": {
                "Branco": 0,
                "Negro": 1.4,
                "Asiatico": -1.2
              }
            }
          ]
        }
      ]
    },
    {
      "uid": "uid_bloco_1780423862365_w2fsn",
      "idInterno": "avaliacao_caminhada",
      "titulo": "Velocidade de Marcha",
      "tipo": "comum",
      "primeiro": "uid_pergunta_1780424124798_hf8d2",
      "perguntas": [
        {
          "uid": "uid_pergunta_1780424124798_hf8d2",
          "idInterno": "velocidade_marcha",
          "escopo": "Quanto tempo o paciente levou para cumprir uma caminhada de 4 metros?",
          "tipo": "numerico",
          "configuracao": {
            "regra": "maior_que",
            "limiar": 5,
            "verdadeiro": {
              "proximo": {
                "proximo": {
                  "diagnostico": "Positivo Grave"
                }
              }
            },
            "falso": {
              "proximo": {
                "proximo": {
                  "diagnostico": "Positivo"
                }
              }
            }
          }
        }
      ]
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
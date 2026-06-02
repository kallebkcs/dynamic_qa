export const presetQuestions = [
  {
    templateId: 'sexo',
    idInterno: 'idp_sexo',
    escopo: 'Sexo:',
    tipo: 'escolha_unica', 
    configuracao: [
        {opcao: "Masculino", escolhido: ''}, 
        {opcao: "Feminino", escolhido: '' }
    ],
    proximo: ""
  },
  {
    templateId: 'idade',
    idInterno: 'idp_idade',
    escopo: 'Idade:',
    tipo: 'numerico', 
    configuracao: [{
      regra: 'maior_que',
      limiar: 0,
      verdadeiro:  {},
      falso: {}
    }],
    proximo: "" 
  },
  {
    templateId: 'peso',
    idInterno: 'idp_peso',
    escopo: 'Peso (kg):',
    tipo: 'numerico', 
    configuracao: [{
      regra: 'maior_que',
      limiar: 0,
      verdadeiro:  {},
      falso: {}
    }],
    proximo: "" 
  },
  {
    templateId: 'altura',
    idInterno: 'idp_altura',
    escopo: 'Altura (m):',
    tipo: 'numerico',
    configuracao: [{
      regra: 'maior_que',
      limiar: 0,
      verdadeiro:  {},
      falso: {}
    }],
    proximo: ""
  },
  {
    templateId: 'raca',
    idInterno: 'idp_raca',
    escopo: 'Raça:',
    tipo: 'escolha_unica',
    configuracao: [
      { opcao: 'Branco', escolhido: '' },
      { opcao: 'Negro', escolhido: '' },
      { opcao: 'Asiatico', escolhido: '' }
    ],
    proximo: "" 
  },
  {
    templateId: 'estado_civil',
    idInterno: 'idp_estado_civil',
    escopo: 'Estado Civil:',
    tipo: 'escolha_unica',
    configuracao: [
      { opcao: 'Solteiro(a)', escolhido: '' },
      { opcao: 'Casado(a)', escolhido: '' },
      { opcao: 'Divorciado(a)', escolhido: '' },
      { opcao: 'Viúvo(a)', escolhido: '' }
    ],
    proximo: "" 
  }
];
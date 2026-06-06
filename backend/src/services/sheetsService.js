const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'src/services/credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permissão para mexer no Sheets
});

const inicializarPlanilha = async (spreadsheetId, questionario) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Extrai todos os idInterno's
    const cabecalhos = ['Data_Submissao']; 
    
    questionario.blocos.forEach(bloco => {
      if (bloco.perguntas) {
        bloco.perguntas.forEach(p => {
          if (p.idInterno) cabecalhos.push(p.idInterno);
        });
      }
      if (bloco.tipo === 'peso') cabecalhos.push('peso_acumulado_' + bloco.idInterno);
    });
    cabecalhos.push('Diagnóstico');

    const resposta = await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Página1!A1', // Se a sua aba do Sheets tiver outro nome, mude aqui
      valueInputOption: 'RAW',
      resource: {
        values: [cabecalhos],
      },
    });

    return resposta.data;
  } catch (error) {
    console.error("Falha ao escrever cabeçalho:", error.message);
    throw error;
  }
};

const preencherPlanilha = async (spreadsheetId, payload) => {
    try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Ordem exata das colunas
    const dadosPlanilha = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Página1!1:1',
    });
    const cabecalhos = dadosPlanilha.data.values ? dadosPlanilha.data.values[0] : [];
    
    if (cabecalhos.length === 0) {
      throw new Error("A planilha não foi inicializada com os cabeçalhos.");
    }

    // Construção iterativa
    const novaLinha = cabecalhos.map(coluna => {
      if (coluna === 'Data_Submissao') {
        return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      }
      
      if (coluna === 'Diagnóstico') {
        return payload.diagnostico || 'Sem diagnóstico';
      }
      const respostaUsuario = payload.respostas[coluna];      
      return respostaUsuario !== undefined ? respostaUsuario : 'N/A';
    });

    // Adiciona os valores na planilha
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Página1!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [novaLinha],
      },
    });

  } catch (error) {
    console.error("ERRO: ", error.message);
    throw error;
  }
};

module.exports = { inicializarPlanilha, preencherPlanilha };
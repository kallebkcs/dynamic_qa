const { getDB } = require('../config/db');
const crypto = require('crypto');
const sheetsService = require('../services/sheetsService');

exports.listarTodos = async (req, res) => {
  try {
    const db = getDB();
    const linhas = await db.all(`SELECT documento FROM Questionarios`);
    
    // Transforma os textos de volta em objetos e filtra só o que a lista precisa
    const lista = linhas.map(linha => {
      const q = JSON.parse(linha.documento);
      return {
        titulo: q.titulo,
        idInterno: q.idInterno,
        descricao: q.descricao,
        vinculos: q.vinculos || []
      };
    });
    res.json(lista);
  } catch (err) {
    res.status(500).json({erro: "Falha ao buscar questionários"});
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const db = getDB();
    const linha = await db.get(`SELECT documento FROM Questionarios WHERE idInterno = ?`, [req.params.id]);
    if (!linha) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(JSON.parse(linha.documento));
  } catch (err) {
    res.status(500).json({ erro: 'ID inválido ou erro no banco' });
  }
};

exports.atualizarQuestionario = async (req, res) => {
  try {
    const {id} = req.params;
    const dadosAtualizados = req.body;
    const db = getDB();
    
    // Editou a estrutura = perdeu os vínculos
    dadosAtualizados.vinculos = [];

    const documentoString = JSON.stringify(dadosAtualizados);
    const result = await db.run(
      `UPDATE Questionarios SET idInterno = ?, titulo = ?, documento = ? WHERE idInterno = ?`,
      [dadosAtualizados.idInterno, dadosAtualizados.titulo, documentoString, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ erro: 'Esse questionário não existe.'});
    }

    res.status(200).json({ 
      mensagem: 'Questionário atualizado com sucesso.', 
      dados: dadosAtualizados 
    });
  } catch (err) {
    res.status(500).json({erro: err.message})
  }
};

exports.salvarQuestionario = async (req, res) => {
  try {
    const db = getDB();
    const dados = req.body;
    if (!dados.idInterno) {
      dados.idInterno = crypto.randomUUID();
    }
    const documentoString = JSON.stringify(dados);

    await db.run(
      `INSERT INTO Questionarios (idInterno, titulo, documento) VALUES (?, ?, ?)`,
      [dados.idInterno, dados.titulo, documentoString]
    );

    res.status(201).json({mensagem: 'Sucesso', dados: dados});    
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({erro: 'Um questionário com esse ID já existe.'});
    }
    res.status(500).json({erro: err.message})
  }
}

exports.excluirQuestionario = async (req, res) => {
  try {
    const db = getDB();
    await db.run(`DELETE FROM Questionarios WHERE idInterno = ?`, [req.params.id]);
    res.status(200).json({mensagem: 'Sucesso'})
  } catch (err) {
    res.status(500).json({erro: err.msg})
  }
}

exports.enviarResposta = async (req, res) => {
  try {
    const { idPlanilha, respostas, diagnostico } = req.body;

    if (!respostas) return res.status(400).json({ erro: 'Dados incompletos.' });
    if (idPlanilha) {
      await sheetsService.preencherPlanilha(idPlanilha, { respostas, diagnostico });
      res.status(200).json({ mensagem: 'Respostas computadas com sucesso!' });
    } else {
      res.status(200).json({ mensagem: 'Respostas recebidas, mas não salvas!' });
    }
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

exports.vincularPlanilha = async (req, res) => {
  try {
    const { id } = req.params; // idInterno
    const { idPlanilha, idCoordenador } = req.body;
    const db = getDB();
    
    if (!idPlanilha || !idCoordenador) {
      return res.status(400).json({ err: 'ID da planilha ou ID do coordenador não encontrado' });
    }

    const linha = await db.get(`SELECT documento FROM Questionarios WHERE idInterno = ?`, [id]);
    if (!linha) return res.status(404).json({ erro: 'Questionário não encontrado.' });
    const questionario = JSON.parse(linha.documento); 

    // Remove o vínculo antigo desse coordenador (se existir) e adiciona o novo
    if (!questionario.vinculos) questionario.vinculos = [];
    questionario.vinculos = questionario.vinculos.filter(v => v.idCoordenador !== idCoordenador);
    questionario.vinculos.push({ idCoordenador, idPlanilha });

    await db.run(
      `UPDATE Questionarios SET documento = ? WHERE idInterno = ?`,
      [JSON.stringify(questionario), id]
    );

    // Formata a planilha nova
    await sheetsService.inicializarPlanilha(idPlanilha, questionario);

    res.status(200).json({ mensagem: 'Vínculo feito com sucesso.', idPlanilha });
  } catch (error) {
    console.error("Erro ao vincular:", error);
    res.status(500).json({ erro: error.message });
  }
};
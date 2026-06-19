const { getDB } = require('../config/db');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');
const fs = require('fs');

// Impressão digital do hardware para proteção de dados
const idFisico = machineIdSync();
const CHAVE_SISTEMA = crypto.scryptSync(`monitor_pare_de_bisbilhotar_${idFisico}`, 'sal_do_sistema', 32);
const ALGORITMO = 'aes-256-cbc';

const criptografarDado = (texto) => {
  const iv = crypto.randomBytes(16); // Vetor aleatório para a mesma resposta gerar cifragens diferentes
  const cipher = crypto.createCipheriv(ALGORITMO, CHAVE_SISTEMA, iv);
  let encriptado = cipher.update(texto, 'utf8', 'hex');
  encriptado += cipher.final('hex');
  return iv.toString('hex') + ':' + encriptado; // Guarda o IV junto para conseguirmos ler depois
};

const descriptografarDado = (textoCriptografado) => {
  const partes = textoCriptografado.split(':');
  const iv = Buffer.from(partes.shift(), 'hex');
  const encriptado = partes.join(':');
  const decipher = crypto.createDecipheriv(ALGORITMO, CHAVE_SISTEMA, iv);
  let desencriptado = decipher.update(encriptado, 'hex', 'utf8');
  desencriptado += decipher.final('utf8');
  return desencriptado;
};

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
    const { idQuestionario, respostas, diagnostico } = req.body;
    if (!idQuestionario || !respostas) return res.status(400).json({ erro: 'Dados incompletos. Falta o ID do questionário ou as respostas' });
    const db = getDB();

    const dataSubmissao = new Date().toLocaleString('pt-BR');
    const conteudoString = JSON.stringify({ respostas, diagnostico });
    const conteudoCriptografado = criptografarDado(conteudoString);
    await db.run(
      `INSERT INTO Respostas (idQuestionario, dataSubmissao, conteudo) VALUES (?, ?, ?)`,
      [idQuestionario, dataSubmissao, conteudoCriptografado]
    );
    res.status(200).json({ mensagem: 'Respostas computadas e armazenados no banco de dados.'});
  } catch (error) {
    console.error("Erro no envio local:", error);
    res.status(500).json({ erro: error.message });
  }
};

exports.listarRespostas = async (req, res) => {
  try {
    const { id } = req.params; // id do questionario
    const db = getDB();

    const linhas = await db.all(
      `SELECT id, dataSubmissao, conteudo FROM Respostas WHERE idQuestionario = ? ORDER BY id DESC`,
      [id]
    );

    const respostasLimpas = linhas.map(linha => {
      try {
        const conteudoDescriptografado = descriptografarDado(linha.conteudo);
        return {
          id: linha.id,
          dataSubmissao: linha.dataSubmissao,
          conteudo: JSON.parse(conteudoDescriptografado)
        };
      } catch (err) {
        // Se cair aqui, a chave do sistema mudou ou o banco corrompeu
        return { id: linha.id, dataSubmissao: linha.dataSubmissao, conteudo: { erro: "Falha ao descriptografar" } };
      }
    });

    res.status(200).json(respostasLimpas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
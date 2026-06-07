const Questionario = require('../models/Questionario');
const sheetsService = require('../services/sheetsService');

exports.listarTodos = async (req, res) => {
  try {
    const lista = await Questionario.find({}, 'titulo idInterno descricao vinculos');
    res.json(lista);
  } catch (err) {
    res.status(500).json({erro: "Falha ao buscar questionários"});
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const questionario = await Questionario.findOne({idInterno: req.params.id});
    if (!questionario) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(questionario);
  } catch (err) {
    res.status(500).json({ erro: 'ID inválido ou erro no banco' });
  }
};

exports.atualizarQuestionario = async (req, res) => {
  try {
    const {id} = req.params;
    const dadosAtualizados = req.body;
    
    // Editou a estrutura = perdeu os vínculos
    dadosAtualizados.vinculos = [];

    const questionarioAtualizado = await Questionario.findOneAndUpdate(
      {idInterno: id},
      dadosAtualizados,
      { returnDocument: 'after', runValidators: true }
    );

    if (!questionarioAtualizado) {
      return res.status(404).json({ erro: 'Esse questionário não existe.'});
    }

    res.status(200).json({ 
      mensagem: 'Questionário atualizado e cabeçalhos de planilha sincronizados!', 
      dados: questionarioAtualizado 
    });
  } catch (err) {
    res.status(500).json({erro: err.msg})
  }
};

exports.salvarQuestionario = async (req, res) => {
  try {
    const questionario = await Questionario.create(req.body);
    res.status(201).json({mensagem: 'Sucesso', dados: questionario});    
  } catch (err) {
    res.status(500).json({erro: err.msg})
  }
}

exports.excluirQuestionario = async (req, res) => {
  try {
    await Questionario.deleteOne({idInterno: req.params.id});
    res.status(200).json({mensagem: 'Sucesso'})
  } catch (err) {
    res.status(500).json({erro: err.msg})
  }
}

exports.enviarResposta = async (req, res) => {
  try {
    const { idQuestionario, idPlanilha, respostas, diagnostico } = req.body;

    if (!idPlanilha || !respostas) {
      return res.status(400).json({ erro: 'Dados incompletos.' });
    }
    await sheetsService.preencherPlanilha(idPlanilha, { respostas, diagnostico });
    await Questionario.findOneAndUpdate(
      { idInterno: idQuestionario }, 
      { temRespostas: true }
    );
    res.status(200).json({ mensagem: 'Respostas computadas com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

exports.vincularPlanilha = async (req, res) => {
  try {
    const { id } = req.params; // idInterno
    const { idPlanilha, idCoordenador } = req.body;

    if (!idPlanilha || !idCoordenador) {
      return res.status(400).json({ err: 'ID da planilha ou ID do coordenador não encontrado' });
    }

    const questionario = await Questionario.findOne({idInterno: id});
    if (!questionario) return res.status(404).json({ err: 'Questionário não encontrado.' });

    // Remove o vínculo antigo desse coordenador (se existir) e adiciona o novo
    questionario.vinculos = questionario.vinculos.filter(v => v.idCoordenador !== idCoordenador);
    questionario.vinculos.push({ idCoordenador, idPlanilha });

    await questionario.save();

    // Formata a planilha nova
    await sheetsService.inicializarPlanilha(idPlanilha, questionario);

    res.status(200).json({ mensagem: 'Vínculo feito com sucesso.', idPlanilha });
  } catch (error) {
    console.error("Erro ao vincular:", error);
    res.status(500).json({ erro: error.message });
  }
};
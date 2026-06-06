const Questionario = require('../models/Questionario');
const sheetsService = require('../services/sheetsService');

exports.listarTodos = async (req, res) => {
  try {
    const lista = await Questionario.find({}, 'titulo idInterno descricao');
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
    
    const questionarioAtualizado = await Questionario.findOneAndUpdate(
      {idInterno: id},
      dadosAtualizados,
      { returnDocument: 'after', runValidators: true }
    );

    if (!questionarioAtualizado) {
      return res.status(404).json({ erro: 'Esse questionário não existe.'});
    }

    // Se ele alterou a estrutura do questionário, rebatizamos a planilha na mesma hora
    const idPlanilha = questionarioAtualizado.idPlanilha || dadosAtualizados.idPlanilha || "1iyXTLEwhqrF7XNu-3Au4FLOWbF2hn9bQm0iqtidC5Pk";
    if (idPlanilha) {
      await sheetsService.inicializarPlanilha(idPlanilha, dadosAtualizados);
    }

    res.status(200).json({ 
      mensagem: 'Questionário atualizado e cabeçalhos da planilha sincronizados!', 
      dados: questionarioAtualizado 
    });
  } catch (err) {
    res.status(500).json({erro: err.msg})
  }
};

exports.salvarQuestionario = async (req, res) => {
  try {
    const questionario = await Questionario.create(req.body);
    const idPlanilha = questionario.idPlanilha || "1iyXTLEwhqrF7XNu-3Au4FLOWbF2hn9bQm0iqtidC5Pk";
    if (idPlanilha) {
      await sheetsService.inicializarPlanilha(idPlanilha, questionario);
    }
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
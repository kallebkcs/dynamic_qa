const Questionario = require('../models/Questionario');

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
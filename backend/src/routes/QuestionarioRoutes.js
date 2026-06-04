const express = require('express');
const router = express.Router();
const controller = require('../controllers/QuestionarioController');

// deslocamos as funções que o roteamento chamaria para um controller
router.get('/', controller.listarTodos);
router.get('/:id', controller.buscarPorId);
router.delete('/:id', controller.excluirQuestionario);
router.post('/', controller.salvarQuestionario);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/QuestionarioController');

// deslocamos as funções que o roteamento chamaria para um controller
router.get('/', controller.listarTodos);
router.get('/:id', controller.buscarPorId);

module.exports = router;
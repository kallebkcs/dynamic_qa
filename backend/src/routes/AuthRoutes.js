const express = require('express');
const router = express.Router();

const {
  login,
  cadastrarUsuario,
  contarCoordenadores,
  removerUsuario,
  listarMonitores,
  cadastrarPaciente,
  listarPacientes,
  removerPaciente,
  listarQuestionarios,
  listarQuestionariosMonitor
} = require('../controllers/AuthController');

router.post('/login', login);
router.post('/usuarios', cadastrarUsuario);
router.get('/coordenadores', contarCoordenadores);
router.delete('/usuarios/:cpf', removerUsuario); 
router.get('/usuarios/monitor', listarMonitores);
router.post('/pacientes', cadastrarPaciente);
router.get('/pacientes', listarPacientes);
router.delete('/pacientes/:cpf', removerPaciente);
router.get("/questionarios", listarQuestionarios);
router.get('/questionarios/monitor/:cpf', listarQuestionariosMonitor);


module.exports = router;
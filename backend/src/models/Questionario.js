//TO-DO: ALTERAR O SCHEMA BASEADO NA ESTRUTURA DO SEED
const mongoose = require('mongoose');

const perguntaSchema = new mongoose.Schema({
    idInterno: String,
    escopo: String,
    tipo: String,
    logica: String,
    contexto: String,
    configuracao: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

const blocoSchema = new mongoose.Schema({
    idInterno: String,
    titulo: String,
    tipo: String,
    primeiro: String,
    perguntas: [perguntaSchema]
})

const questionarioSchema = new mongoose.Schema({
    titulo: String,
    idInterno: String,
    descricao: String,
    criadoPor: String,
    primeiro: String,
    blocos: [blocoSchema]
})

const Questionario = mongoose.model('Questionario', questionarioSchema);
module.exports = Questionario;
//TO-DO: ALTERAR O SCHEMA BASEADO NA ESTRUTURA DO SEED
const mongoose = require('mongoose');

const perguntaSchema = new mongoose.Schema({
    uid: String,
    idInterno: String,
    escopo: String,
    tipo: String,
    contexto: String,
    proximo: mongoose.Schema.Types.Mixed,
    equacao: String,
    variaveis: [mongoose.Schema.Types.Mixed],
    configuracao: mongoose.Schema.Types.Mixed
    
});

const blocoSchema = new mongoose.Schema({
    uid: String,
    idInterno: String,
    titulo: String,
    tipo: String,
    primeiro: String,
    calculoPeso: mongoose.Schema.Types.Mixed,
    perguntas: [perguntaSchema]
})

const questionarioSchema = new mongoose.Schema({
    titulo: String,
    idInterno: String,
    descricao: String,
    criadoPor: String,
    primeiro: String,
    blocos: [blocoSchema],
    vinculos: [{
        idCoordenador: { type: String, required: true },
        idPlanilha: { type: String, required: true }
    }]
})

const Questionario = mongoose.model('Questionario', questionarioSchema);
module.exports = Questionario;
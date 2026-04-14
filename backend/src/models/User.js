const mongoose = require('mongoose');

 const userSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true,
        unique: true
    },
    senha: {
        type: password,
        required: true,
        select: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    nome: {
        type: String,
        required: true
    },
    especialidade: {
        type: String
    },
    questionariosFavoritos: {
        type: Array
    }
 });

 const User = mongoose.model('User', userSchema);
 module.exports = User;
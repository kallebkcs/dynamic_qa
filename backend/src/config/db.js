const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/questionarios';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URL);
        console.log('Conexão à database efetuada com sucesso: ', conn.connection.host)
    } catch (err) {
        console.error('Erro ao conectar: ', err.message);
        process.exit(1);
    }
}

module.exports = connectDB
const express = require('express')
const cors = require('cors')

const PORT = 3000;
const app = express();
const path = require('path');
const QuestionarioRoutes = require('./routes/QuestionarioRoutes');
const connectDB = require('./config/db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/public')));
connectDB();

// usamos routes para deslocar a parte do roteamento pra outro arquivo
app.use('/api/questionarios', QuestionarioRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
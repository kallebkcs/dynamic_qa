const express = require('express')
const cors = require('cors')

const PORT = 3000;
const app = express();
const path = require('path');
const QuestionarioRoutes = require('./routes/QuestionarioRoutes');
const {connectDB} = require('./config/db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/questionarios', QuestionarioRoutes);
connectDB().catch(err => console.error("Erro ao iniciar SQLite:", err));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

let dbInstance = null;

const seedDatabase = async (db) => {
  // Se já tem dado no questionário, não precisamos disso
  const { count } = await db.get(`SELECT COUNT(*) as count FROM Questionarios`);
  if (count > 0) return; 

  // Se não tem, injetamos a seed
  const seedPath = path.join(__dirname, '../../data/seeds');  
  if (!fs.existsSync(seedPath)) {
     console.log('Pasta de seeds não encontrada. Prosseguindo sem questionários...');
     return;
  }

  const files = fs.readdirSync(seedPath).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(seedPath, file), 'utf-8');
    try {
      const q = JSON.parse(raw);
      delete q._id;
      q.vinculos = [];

      await db.run(
        `INSERT INTO Questionarios (idInterno, titulo, documento) VALUES (?, ?, ?)`,
        [q.idInterno, q.titulo, JSON.stringify(q)]
      );
    } catch (e) {
      console.error(`Erro ao ler seed do arquivo ${file}:`, e.message);
    }
  }
};

const connectDB = async () => {
  if (dbInstance) return dbInstance;
  
  const dbPath = process.env.DB_PATH || './data/database.sqlite';
  dbInstance = await open({
    filename: dbPath, 
    driver: sqlite3.Database
  });

  // Cria a tabela caso necessário
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS Questionarios (
      idInterno TEXT PRIMARY KEY,
      titulo TEXT,
      documento TEXT
    )
  `);
  // Vamos armazenar as respostas dos pacientes no banco de dados agora (como é local, dificilmente será empecilho)
  await dbInstance.exec(`
  CREATE TABLE IF NOT EXISTS Respostas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idQuestionario TEXT NOT NULL,
    dataSubmissao TEXT NOT NULL,
    conteudo TEXT NOT NULL
  )
`);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS Usuarios (
      cpf char(11) PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      perfil TEXT NOT NULL
    )
  `);

  /*await dbInstance.run(`
    DELETE FROM Usuarios;
`);*/

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS Pacientes (
      cpf TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      cep TEXT NOT NULL,
      estado TEXT NOT NULL,
      monitorCpf TEXT,
      cadastradoPor TEXT NOT NULL,
      FOREIGN KEY (monitorCpf) REFERENCES Usuarios(cpf)
    )
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS MonitorQuestionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitorCpf TEXT NOT NULL,
      questionarioId TEXT NOT NULL,

      FOREIGN KEY (monitorCpf)
      REFERENCES Usuarios(cpf),

      FOREIGN KEY (questionarioId)
      REFERENCES Questionarios(idInterno)
      )
    `);

// Insere sementes caso necessário
await seedDatabase(dbInstance);

return dbInstance;
};

const getDB = () => {
  if (!dbInstance) throw new Error("Banco não inicializado!");
  return dbInstance;
};

module.exports = { connectDB, getDB };
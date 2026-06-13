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

  // Insere sementes caso necessário
  await seedDatabase(dbInstance);
  return dbInstance;
};

const getDB = () => {
  if (!dbInstance) throw new Error("Banco não inicializado!");
  return dbInstance;
};

module.exports = { connectDB, getDB };
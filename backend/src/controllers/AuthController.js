const { getDB } = require('../config/db');

const login = async (req, res) => {
  try {
    const { cpf } = req.body;

    const db = getDB();

    const usuario = await db.get(
      'SELECT * FROM Usuarios WHERE cpf = ?',
      [cpf]
    );

    if (!usuario) {
      return res.status(401).json({
        erro: 'CPF ou perfil inválido.'
      });
    }

    return res.json({
      cpf: usuario.cpf,
      perfil: usuario.perfil,
      nome: usuario.nome,
      email: usuario.email,
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro interno.'
    });
  }
};

const cadastrarUsuario = async (req, res) => {
  try {

    const { cpf, nome, email, perfil, questionarios} = req.body;

    const db = getDB();

    const existente = await db.get(
      `
      SELECT *
      FROM Usuarios
      WHERE cpf = ?
      `,
      [cpf]
    );

    if (existente) {
      return res.status(400).json({
        erro: 'CPF já cadastrado.'
      });
    }

    await db.run(
      `
      INSERT INTO Usuarios
      (cpf, nome, email, perfil)
      VALUES (?, ?, ?, ?)
      `,
      [cpf, nome, email, perfil]
    );

    if (
      perfil === "monitor" &&
      Array.isArray(questionarios)
    ) {
      for (const questionarioId of questionarios) {
        await db.run(
          `
          INSERT INTO MonitorQuestionarios
          (monitorCpf, questionarioId)
          VALUES (?, ?)
          `,
          [cpf, questionarioId]
        );
      }
    }

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.'
    });

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao cadastrar usuário.'
    });
  }
};

const contarCoordenadores = async (req, res) => {

  try{
    const db = getDB();

    const coordenadores = await db.all(
      `
      SELECT COUNT(*) as total
      FROM Usuarios
      WHERE perfil = 'coordenador'
      `
    );

    res.json({existe: coordenadores[0].total > 0});

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao listar coordenadores.'
    });
  }

};

const removerUsuario = async (req, res) => {
  try {
    const { cpf} = req.params;

    const db = getDB();

    const resultado = await db.run(
      'DELETE FROM Usuarios WHERE cpf = ? ',
      [cpf]
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.json({
      mensagem: 'Usuário removido com sucesso.'
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao remover usuário.'
    });
  }
};

const listarMonitores = async (req, res) => {
  try {

    const db = getDB();

    const monitores = await db.all(`
      SELECT
        u.cpf,
        u.nome,
        u.email,
        GROUP_CONCAT(q.titulo, ', ') AS questionarios
      FROM Usuarios u

      LEFT JOIN MonitorQuestionarios mq
        ON u.cpf = mq.monitorCpf

      LEFT JOIN Questionarios q
        ON q.idInterno = mq.questionarioId

      WHERE u.perfil = 'monitor'

      GROUP BY
        u.cpf,
        u.nome,
        u.email

      ORDER BY u.nome
    `);

    res.json(monitores);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao listar monitores.'
    });

  }
};

const cadastrarPaciente = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      cep,
      estado,
      monitorCpf,
      cadastradoPor
    } = req.body;

    const db = getDB();

    const existente = await db.get(
      'SELECT * FROM Pacientes WHERE cpf = ?',
      [cpf]
    );

    if (existente) {
      return res.status(400).json({
        erro: 'Paciente já cadastrado.'
      });
    }

    await db.run(
      `
      INSERT INTO Pacientes
      (cpf, nome, cep, estado, monitorCpf, cadastradoPor)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        cpf,
        nome,
        cep,
        estado,
        monitorCpf || null,
        cadastradoPor
      ]
    );

    return res.status(201).json({
      mensagem: 'Paciente cadastrado com sucesso.'
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao cadastrar paciente.'
    });
  }
};

const listarPacientes = async (req, res) => {
  try {
    const db = getDB();

    const pacientes = await db.all(`
      SELECT
        p.*,
        u.nome AS nomeCadastrador
      FROM Pacientes p
      LEFT JOIN Usuarios u
        ON p.cadastradoPor = u.cpf
    `);

    res.json(pacientes);

  } catch (erro) {
    res.status(500).json({
      erro: 'Erro ao listar pacientes.'
    });
  }
};

const removerPaciente = async (req, res) => {

  try {
    const { cpf } = req.params;
    const db = getDB();

    const resultado = await db.run(
      'DELETE FROM Pacientes WHERE cpf = ?',
      [cpf]
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado.'
      });
    }

    res.json({
      mensagem: 'Paciente removido com sucesso.'
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao remover paciente.'
    });
  }
};

const listarQuestionarios = async (req, res) => {
  try {

    const db = getDB();

    const questionarios = await db.all(`
      SELECT
        idInterno,
        titulo
      FROM Questionarios
      ORDER BY titulo
    `);

    res.json(questionarios);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao listar questionários.'
    });

  }
};

const listarQuestionariosMonitor = async (req, res) => {
  try {

    const { cpf } = req.params;

    const db = getDB();

    const questionarios = await db.all(
      `
      SELECT q.*
      FROM Questionarios q
      INNER JOIN MonitorQuestionarios mq
        ON q.idInterno = mq.questionarioId
      WHERE mq.monitorCpf = ?
      `,
      [cpf]
    );

    res.json(questionarios);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: 'Erro ao buscar questionários do monitor.'
    });
  }
};

module.exports = {
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
};

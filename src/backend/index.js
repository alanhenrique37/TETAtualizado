const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Conexão com banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'projetoLogin',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

// Rota POST para cadastro de usuários
app.post('/logins', (req, res) => {
  const { nome, email, senha, telefone, foto_perfil, tipo } = req.body;

  if (!nome || !email || !senha || !telefone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const query = 'INSERT INTO logins (nome, email, senha, telefone, foto_perfil, tipo) VALUES (?, ?, ?, ?, ?, ?)';
  const fotoBuffer = foto_perfil ? Buffer.from(foto_perfil, 'base64') : null;
  const tipoUsuario = tipo || 'usuario';

  db.query(query, [nome, email, senha, telefone, fotoBuffer, tipoUsuario], (error, results) => {
    if (error) {
      console.error('Erro ao inserir no MySQL:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar cliente.' });
    }
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
  });
});

// Rota POST para login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const query = 'SELECT nome, email, telefone FROM logins WHERE email = ? AND senha = ? LIMIT 1';

  db.query(query, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao consultar MySQL:', err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const user = results[0];
    return res.json({ user });
  });
});

// Rota PUT para atualizar informações do usuário
app.put('/logins/:emailAntigo', (req, res) => {
  const { emailAntigo } = req.params;
  const { nome, email, senha, telefone } = req.body;

  if (!nome || !email || !senha || !telefone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const query = `
    UPDATE logins
    SET nome = ?, email = ?, senha = ?, telefone = ?
    WHERE email = ?
  `;

  db.query(query, [nome, email, senha, telefone, emailAntigo], (error, results) => {
    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário atualizado com sucesso!' });
  });
});

// Rota POST para cadastrar projeto (com email_autor e integridade com tabela logins)
app.post('/cadastrar-projeto', (req, res) => {
  const {
    nome,
    descricao,
    valor,
    telefone,
    numeroPessoas,
    email_autor, // novo campo
  } = req.body;

  if (!nome || !descricao || !valor || !telefone || !email_autor) {
    return res.status(400).json({ message: 'Campos obrigatórios estão faltando.' });
  }

  const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
  const qtdPessoas = parseInt(numeroPessoas || '1');

  const query = `
    INSERT INTO projetos (
      nome_projeto,
      descricao,
      valor,
      data_criacao,
      telefone,
      qtd_pessoas,
      email_autor
    ) VALUES (?, ?, ?, NOW(), ?, ?, ?)
  `;

  db.query(
    query,
    [nome, descricao, valorNumerico, telefone, qtdPessoas, email_autor],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir projeto:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar projeto.' });
      }

      res.status(201).json({ message: 'Projeto cadastrado com sucesso!' });
    }
  );
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

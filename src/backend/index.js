const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // aceitar payload maior, importante para imagens base64

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

// Cadastrar novo usuário
app.post('/logins', (req, res) => {
  const { nome, email, senha, telefone, foto_perfil, tipo } = req.body;

  if (!nome || !email || !senha || !telefone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const query = 'INSERT INTO logins (nome, email, senha, telefone, foto_perfil, tipo) VALUES (?, ?, ?, ?, ?, ?)';
  const fotoBuffer = foto_perfil ? Buffer.from(foto_perfil, 'base64') : null;
  const tipoUsuario = tipo || 'usuario';

  db.query(query, [nome, email, senha, telefone, fotoBuffer, tipoUsuario], (error) => {
    if (error) {
      console.error('Erro ao inserir no MySQL:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar cliente.' });
    }
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
  });
});

// Login
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

// Atualizar informações do usuário
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

// Cadastrar novo projeto
app.post('/cadastrar-projeto', (req, res) => {
  const { nome, descricao, valor, telefone, numeroPessoas, email_autor } = req.body;

  if (!nome || !descricao || !valor || !telefone || !email_autor) {
    return res.status(400).json({ message: 'Campos obrigatórios estão faltando.' });
  }

  const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
  const qtdPessoas = parseInt(numeroPessoas || '1');

  const query = `
    INSERT INTO projetos (
      nome_projeto, descricao, valor, data_criacao, telefone, qtd_pessoas, email_autor
    ) VALUES (?, ?, ?, NOW(), ?, ?, ?)
  `;

  db.query(query, [nome, descricao, valorNumerico, telefone, qtdPessoas, email_autor], (err, result) => {
    if (err) {
      console.error('Erro ao inserir projeto:', err);
      return res.status(500).json({ message: 'Erro ao cadastrar projeto.' });
    }

    res.status(201).json({
      message: 'Projeto cadastrado com sucesso!',
      id: result.insertId,
    });
  });
});

// Listar todos os projetos com nome e imagem do autor
app.get('/projetos', (req, res) => {
  const query = `
    SELECT
      p.id,
      p.nome_projeto,
      p.descricao,
      p.valor,
      p.qtd_pessoas,
      p.telefone,
      p.email_autor,
      l.nome AS nome_autor,
      TO_BASE64(l.foto_perfil) AS foto_perfil
    FROM projetos p
    INNER JOIN logins l ON p.email_autor = l.email
    ORDER BY p.data_criacao DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar projetos:', err);
      return res.status(500).json({ message: 'Erro ao buscar projetos.' });
    }

    res.json(results);
  });
});

// Rota de contato (opcional)
app.get('/contato/:email', (req, res) => {
  const email = req.params.email;
  const query = 'SELECT nome, email, telefone FROM logins WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar contato:', err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(results[0]);
  });
});

// Deletar projeto por ID
app.delete('/projetos/:id', (req, res) => {
  const id = req.params.id;

  const query = 'DELETE FROM projetos WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao deletar projeto:', err);
      return res.status(500).json({ message: 'Erro ao excluir projeto.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }

    res.json({ message: 'Projeto excluído com sucesso.' });
  });
});

// Editar projeto
app.put('/editar-projeto/:id', (req, res) => {
  const { id } = req.params;
  const { valor, numeroPessoas, telefone } = req.body;

  if (!valor || !telefone) {
    return res.status(400).json({ message: 'Valor e telefone são obrigatórios.' });
  }

  const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
  const qtdPessoas = parseInt(numeroPessoas || '1');

  const query = `
    UPDATE projetos
    SET valor = ?, qtd_pessoas = ?, telefone = ?
    WHERE id = ?
  `;

  db.query(query, [valorNumerico, qtdPessoas, telefone, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar projeto:', err);
      return res.status(500).json({ message: 'Erro ao atualizar projeto.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }

    res.json({ message: 'Projeto atualizado com sucesso!' });
  });
});

// Rota para upload de foto de perfil (salva no banco como base64)
app.post('/upload-foto', (req, res) => {
  try {
    const { email, foto_base64 } = req.body;

    if (!email || !foto_base64) {
      return res.status(400).json({ message: 'Email e foto são obrigatórios.' });
    }

    // Remove prefixo base64 (ex: data:image/jpeg;base64,)
    const base64Data = foto_base64.replace(/^data:image\/\w+;base64,/, '');

    // Converte base64 para buffer
    const fotoBuffer = Buffer.from(base64Data, 'base64');

    // Atualiza no banco de dados
    const query = 'UPDATE logins SET foto_perfil = ? WHERE email = ?';

    db.query(query, [fotoBuffer, email], (error, results) => {
      if (error) {
        console.error('Erro ao atualizar foto:', error);
        return res.status(500).json({ message: 'Erro ao atualizar foto.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      res.json({
        message: 'Foto atualizada com sucesso!',
        fotoUrl: foto_base64, // retorna o base64 para o cliente já mostrar direto
      });
    });
  } catch (error) {
    console.error('Erro no upload de foto:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Rota para obter foto do usuário (retorna base64 para cliente mostrar)
app.get('/get-foto', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }

  const query = 'SELECT foto_perfil FROM logins WHERE email = ? LIMIT 1';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar foto:', err);
      return res.status(500).json({ message: 'Erro ao buscar foto.' });
    }

    if (results.length === 0 || !results[0].foto_perfil) {
      return res.status(404).json({ message: 'Foto não encontrada.' });
    }

    // Converte o buffer para base64
    const fotoBuffer = results[0].foto_perfil;
    const base64Image = fotoBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    res.json({ fotoUrl: dataUrl });
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

import { useSQLiteContext } from 'expo-sqlite';

export type ClienteDataBase = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  telefone: string; // <- novo campo
};

export function useClienteDataBase() {
  const dataBase = useSQLiteContext();

  // Cria a tabela e adiciona a coluna telefone se necessário
  async function criarTabela() {
    // Cria a tabela se ainda não existir
    await dataBase.execAsync(`
      CREATE TABLE IF NOT EXISTS login (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
      );
    `);

    // Adiciona a coluna telefone, se ainda não existir
    try {
      await dataBase.execAsync(`
        ALTER TABLE logins ADD COLUMN telefone TEXT NOT NULL DEFAULT ''
      `);
    } catch (err: any) {
      if (!String(err).includes('duplicate column name')) {
        console.error('Erro ao adicionar coluna telefone:', err);
      }
    }
  }

  // Inserir novo cliente
  async function create(data: Omit<ClienteDataBase, 'id'>) {
    await criarTabela(); // Garante que a tabela e a coluna existem

    const statement = await dataBase.prepareAsync(
      'INSERT INTO logins (email, nome, senha, telefone) VALUES ($email, $nome, $senha, $telefone)'
    );

    try {
      const result = await statement.executeAsync({
        $email: data.email,
        $nome: data.nome,
        $senha: data.senha,
        $telefone: data.telefone,
      });

      const insertedRowId = result.lastInsertRowId.toString();
      return { insertedRowId };
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  // Buscar cliente por e-mail
  async function getByEmail(email: string): Promise<ClienteDataBase | null> {
    const result = await dataBase.getAllAsync<ClienteDataBase>(
      'SELECT * FROM login WHERE email = ?',
      [email]
    );
    return result.length > 0 ? result[0] : null;
  }

  // Autenticação de login
  async function findByEmailAndSenha(email: string, senha: string): Promise<ClienteDataBase | null> {
    const result = await dataBase.getAllAsync<ClienteDataBase>(
      'SELECT * FROM login WHERE email = ? AND senha = ?',
      [email, senha]
    );
    return result.length > 0 ? result[0] : null;
  }

  return {
    create,
    getByEmail,
    findByEmailAndSenha,
    criarTabela,
  };
}

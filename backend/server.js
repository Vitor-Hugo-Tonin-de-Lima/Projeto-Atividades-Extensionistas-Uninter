const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

// --- Debug ---
console.log("Tentando ler o arquivo .env...");
console.log("Caminho do arquivo:", path.resolve(__dirname, './.env'));
console.log("Valor de MONGO_URI:", process.env.MONGO_URI ? "Carregado com sucesso!" : "NÃO ENCONTRADO (undefined)");
// -------------

const app = express();
app.use(cors());
app.use(express.json());

// --- Conexão MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Conectado!'))
    .catch(err => console.error('❌ Erro Mongo:', err));

// --- Modelo do Professor ---
const ProfessorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true }
});

const Professor = mongoose.model('Professor', ProfessorSchema);

// --- ROTAS DE AUTENTICAÇÃO ---

// 1. Rota de Registro (Cria o Professor)
app.post('/api/auth/registro', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verifica se já existe
        const usuarioExiste = await Professor.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ msg: 'Email já cadastrado!' });
        }

        // Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // Cria o usuário
        const novoProfessor = new Professor({
            nome,
            email,
            senha: senhaHash
        });

        await novoProfessor.save();
        res.status(201).json({ msg: 'Professor cadastrado com sucesso!' });

    } catch (error) {
        res.status(500).json({ msg: 'Erro no servidor', erro: error.message });
    }
});

// 2. Rota de Login (Verifica e devolve o Token)
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Busca o usuário
        const professor = await Professor.findOne({ email });
        if (!professor) {
            return res.status(400).json({ msg: 'Usuário não encontrado' });
        }

        // Verifica a senha (compara a senha digitada com a criptografada)
        const senhaValida = await bcrypt.compare(senha, professor.senha);
        if (!senhaValida) {
            return res.status(400).json({ msg: 'Senha incorreta' });
        }

        // Gera o Token (O "Crachá")
        // 'segredo123' deveria estar no .env, mas deixaremos aqui para facilitar seu teste hoje
        const token = jwt.sign({ id: professor._id }, 'segredo123', { expiresIn: '1h' });

        res.json({ token, msg: 'Logado com sucesso!' });

    } catch (error) {
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

// Rota SIMULADA de recuperação de senha
app.post('/api/auth/esqueci-senha', (req, res) => {
    const { email } = req.body;
    // Aqui viria a lógica real de enviar e-mail com NodeMailer
    console.log(`[SIMULAÇÃO] Enviando email de recuperação para: ${email}`);
    
    // Respondemos para o frontend que "deu certo"
    res.json({ msg: 'Instruções enviadas para o email.' });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
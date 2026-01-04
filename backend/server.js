import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import activityRoutes from './routes/activities.js';

// --- Configuração de Ambiente (ESM) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

// --- Debug ---
console.log("Iniciando servidor...");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Definido" : "NÃO DEFINIDO");

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Conexão MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Conectado!'))
    .catch(err => console.error('❌ Erro Mongo:', err));

// --- Rotas ---
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);

// Rota padrão para teste
app.get('/', (req, res) => {
    res.json({ msg: 'API Backend funcionando corretamente.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
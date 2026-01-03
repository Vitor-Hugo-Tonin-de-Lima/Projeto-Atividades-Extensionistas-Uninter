import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Função para gerar JWT Token
const signToken = (userId, role) => {
  return jwt.sign(
    { userId, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Função para enviar token e resposta
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  // Remove a senha do output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1) Verificar se todos os campos foram fornecidos
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça nome, email, senha e role'
      });
    }

    // 2) Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um usuário com este email'
      });
    }

    // 3) Criar novo usuário
    const newUser = await User.create({
      name,
      email,
      password,
      role
    });

    // 4) Logar o usuário automaticamente após registro
    createSendToken(newUser, 201, res);

  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message);
      return res.status(400).json({
        success: false,
        error: `Dados inválidos: ${errors.join(', ')}`
      });
    }

    // Erro de duplicata (email único)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um usuário com este email'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor. Tente novamente.'
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Verificar se email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça email e senha'
      });
    }

    // 2) Verificar se usuário existe e senha está correta
    // .select('+password') porque definimos select: false no model
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    // 3) Se tudo ok, enviar token para o cliente
    createSendToken(user, 200, res);

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor. Tente novamente.'
    });
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do usuário'
    });
  }
};

// @desc    Atualizar dados do usuário
// @route   PUT /api/auth/update
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { 
        new: true, // Retorna o documento atualizado
        runValidators: true // Executa validações do schema
      }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um usuário com este email'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar dados do usuário'
    });
  }
};
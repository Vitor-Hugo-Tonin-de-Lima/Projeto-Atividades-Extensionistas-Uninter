import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Verificar e validar JWT token
// @access  Private
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // 1) Verificar se o token existe no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Acesso negado. Token não fornecido.'
      });
    }

    // 2) Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar se usuário ainda existe
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não existe mais.'
      });
    }

    // 4) Anexar usuário à request
    req.user = {
      userId: currentUser._id,
      role: currentUser.role
    };

    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado.'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Falha na autenticação.'
    });
  }
};

// @desc    Autorizar baseado no role
// @access  Private
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado. Role ${req.user.role} não tem permissão para esta ação.`
      });
    }
    next();
  };
};

// Atalhos para roles específicos
export const requireTeacher = authorize('teacher');
export const requireStudent = authorize('student');
export const requireTeacherOrStudent = authorize('teacher', 'student');
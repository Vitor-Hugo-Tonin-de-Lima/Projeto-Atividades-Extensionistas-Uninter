import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateUser 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rotas protegidas
router.get('/me', authenticate, getMe);
router.put('/update', authenticate, updateUser);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Auth API está funcionando!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      getMe: 'GET /api/auth/me (protected)',
      update: 'PUT /api/auth/update (protected)'
    }
  });
});

export default router;
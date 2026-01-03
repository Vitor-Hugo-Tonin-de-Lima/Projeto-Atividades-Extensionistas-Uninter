import express from 'express';
import { authenticate, requireTeacher } from '../middleware/auth.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// Criar atividade (apenas professores)
router.post('/', authenticate, requireTeacher, async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      createdBy: req.user._id
    });

    await activity.save();
    await activity.populate('createdBy', 'name email');
    
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar atividade.' });
  }
});

// Listar atividades do usuário
router.get('/', authenticate, async (req, res) => {
  try {
    let activities;
    
    if (req.user.role === 'teacher') {
      // Professor vê atividades que criou
      activities = await Activity.find({ createdBy: req.user._id })
        .populate('students', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Aluno vê atividades atribuídas a ele
      activities = await Activity.find({ students: req.user._id })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atividades.' });
  }
});

// Obter atividade específica
router.get('/:id', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('students', 'name email');

    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada.' });
    }

    // Verificar se usuário tem acesso
    if (req.user.role === 'student' && 
        !activity.students.some(s => s._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Acesso negado a esta atividade.' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atividade.' });
  }
});

// Adicionar aluno à atividade (professor)
router.post('/:id/students', authenticate, requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.body;
    const activity = await Activity.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada.' });
    }

    // Evitar duplicatas
    if (!activity.students.includes(studentId)) {
      activity.students.push(studentId);
      await activity.save();
    }

    await activity.populate('students', 'name email');
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar aluno.' });
  }
});

export default router;
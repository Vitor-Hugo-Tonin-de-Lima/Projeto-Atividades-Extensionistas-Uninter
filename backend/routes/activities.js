import express from 'express';
import { authenticate, requireTeacher } from '../middleware/auth.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// Criar atividade (apenas professores)
router.post('/', authenticate, requireTeacher, async (req, res) => {
  try {
    console.log("Tentativa de criação de atividade.");
    // req.user vem do middleware 'authenticate' e tem a estrutura: { userId, role }
    console.log("Usuário autenticado:", req.user);
    console.log("Payload recebido:", req.body);

    const activity = new Activity({
      ...req.body,
      createdBy: req.user.userId
    });

    await activity.save();

    // Populate user details for response if needed
    // await activity.populate('createdBy', 'name email'); 
    // note: populate might fail if createdBy is just ID string in memory before refetch, but usually ok.

    res.status(201).json(activity);
  } catch (error) {
    console.error("Erro no POST /activities:", error);
    res.status(500).json({ error: 'Erro ao criar atividade.' });
  }
});

// Listar atividades do usuário
router.get('/', authenticate, async (req, res) => {
  try {
    let activities;

    if (req.user.role === 'teacher') {
      // Professor vê atividades que criou
      activities = await Activity.find({ createdBy: req.user.userId })
        .populate('students', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Aluno vê atividades atribuídas a ele
      activities = await Activity.find({ students: req.user.userId })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(activities);
  } catch (error) {
    console.error("Erro no GET /activities:", error);
    res.status(500).json({ error: 'Erro ao buscar atividades.' });
  }
});

// Obter atividade específica (PÚBLICO para visualização via link)
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada.' });
    }

    res.json(activity);
  } catch (error) {
    console.error("Erro no GET /activities/:id", error);
    res.status(500).json({ error: 'Erro ao buscar atividade.' });
  }
});

// Atualizar atividade (apenas professor criador)
router.put('/:id', authenticate, requireTeacher, async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, createdBy: req.user.userId });
    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada ou sem permissão.' });
    }

    // Atualiza campos
    const { title, description, content, steps } = req.body;
    if (title) activity.title = title;
    if (description) activity.description = description;
    if (content) activity.content = content;
    if (steps) activity.steps = steps;

    await activity.save();
    res.json(activity);
  } catch (error) {
    console.error("Erro no PUT /activities/:id", error);
    res.status(500).json({ error: 'Erro ao atualizar atividade.' });
  }
});

// Deletar atividade (apenas professor criador)
router.delete('/:id', authenticate, requireTeacher, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, createdBy: req.user.userId });
    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada ou sem permissão.' });
    }
    res.json({ message: 'Atividade excluída com sucesso.' });
  } catch (error) {
    console.error("Erro no DELETE /activities/:id", error);
    res.status(500).json({ error: 'Erro ao deletar atividade.' });
  }
});

// Adicionar aluno à atividade (professor)
router.post('/:id/students', authenticate, requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.body;
    const activity = await Activity.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
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
    console.error("Erro no POST /activities/:id/students", error);
    res.status(500).json({ error: 'Erro ao adicionar aluno.' });
  }
});

export default router;
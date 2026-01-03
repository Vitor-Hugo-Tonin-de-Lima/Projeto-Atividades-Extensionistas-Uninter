import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cadastro from './pages/Cadastro';
import Recuperarsenha from './pages/Recuperarsenha';
import Atividades from './pages/Atividades';
import EditarAtividade from './pages/EditarAtividade';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<Recuperarsenha />} />
        <Route path="/editar-atividade/:id" element={<EditarAtividade />} />
        <Route path="/atividades" element={<Atividades />} />
        
      </Routes>
    </Router>
  );
}

export default App;
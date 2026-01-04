import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

import Cadastro from './pages/Cadastro';
import Recuperarsenha from './pages/Recuperarsenha';
import Atividades from './pages/Atividades';
import EditarAtividade from './pages/EditarAtividade';
import VisualizarAtividade from './pages/VisualizarAtividade';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<Recuperarsenha />} />
        <Route path="/atividade/editar/:id" element={<EditarAtividade />} />
        <Route path="/atividade/visualizar/:id" element={<VisualizarAtividade />} />
        <Route path="/atividades" element={<Atividades />} />


      </Routes>
    </Router>
  );
}

export default App;
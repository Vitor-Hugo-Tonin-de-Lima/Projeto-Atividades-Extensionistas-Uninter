import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate();

  // Função para Sair (Logout)
  const handleLogout = () => {
    localStorage.removeItem('token'); // Apaga o "crachá"
    navigate('/'); // Manda de volta pro login
  };

  // Verificação de Segurança ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Se não tiver token, não pode ficar aqui!
      alert("Você precisa estar logado!");
      navigate('/');
    }
  }, [navigate]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>Painel do Professor</h1>
        <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>
          Sair
        </button>
      </header>

      <main style={{ marginTop: '20px' }}>
        <h2>Bem-vindo ao AtivaMente!</h2>
        <p>Aqui você poderá criar e gerenciar seus roteiros de estudo.</p>
        
        {/* Futuramente aqui entrará a lista de roteiros */}
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p>Nenhum roteiro criado ainda.</p>
          <Link to="/atividades">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow transition duration-200 flex items-center gap-2">
              <span>+</span> Gerenciar Atividades
            </button>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
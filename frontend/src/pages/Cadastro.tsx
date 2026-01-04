import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/registro`, {
        nome,
        email,
        senha
      });
      alert("Cadastro realizado com sucesso! Faça login.");
      navigate('/'); // Manda para o login
    } catch (error: any) {
      alert(error.response?.data?.msg || "Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Crie sua Conta</h2>

        <form onSubmit={handleCadastro} className="flex flex-col gap-4">
          <input
            type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
            disabled={carregando}
          />
          <input
            type="email" placeholder="Seu E-mail" value={email} onChange={e => setEmail(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
            disabled={carregando}
          />
          <input
            type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
            disabled={carregando}
          />

          <button
            type="submit"
            disabled={carregando}
            className={`p-3 rounded-md font-bold transition flex justify-center items-center ${carregando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {carregando ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "CADASTRAR"}
          </button>
        </form>


        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-500 hover:underline">Já tem conta? Faça Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;
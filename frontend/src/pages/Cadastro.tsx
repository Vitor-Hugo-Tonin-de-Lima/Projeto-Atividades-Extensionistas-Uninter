import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
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
          />
          <input
            type="email" placeholder="Seu E-mail" value={email} onChange={e => setEmail(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
          />
          <input
            type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
          />

          <button type="submit" className="bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-700 transition">
            CADASTRAR
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
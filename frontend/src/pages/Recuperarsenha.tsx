import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Vamos criar essa rota no backend no Passo 5
      await axios.post('http://localhost:5000/api/auth/esqueci-senha', { email });
      setMensagem("Se o e-mail existir, enviamos as instruções para ele!");
    } catch (error) {
      setMensagem("Erro ao tentar recuperar senha.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Recuperar Senha</h2>
        <p className="text-gray-600 text-center mb-6">Digite seu e-mail para receber as instruções.</p>
        
        <form onSubmit={handleRecuperar} className="flex flex-col gap-4">
          <input 
            type="email" placeholder="E-mail cadastrado" value={email} onChange={e => setEmail(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
          />
          
          <button type="submit" className="bg-yellow-500 text-white p-3 rounded-md font-bold hover:bg-yellow-600 transition">
            ENVIAR INSTRUÇÕES
          </button>
        </form>

        {mensagem && <p className="mt-4 text-center text-green-600 font-medium">{mensagem}</p>}

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:underline">Voltar para o Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
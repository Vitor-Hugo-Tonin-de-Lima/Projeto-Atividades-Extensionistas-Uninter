// frontend/src/pages/Login.tsx
import { useState } from 'react';
import axios from 'axios'; // Importamos o tipo de erro

import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Login() {
  // O TypeScript infere que é string, mas podemos ser explícitos
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  const navigate = useNavigate();

  // Tipamos o evento como um evento de formulário HTML
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    try {
      // Definimos o que esperamos receber de resposta (opcional, mas boa prática)
      interface LoginResponse {
        token: string;
        msg: string;
      }

      const resposta = await axios.post<LoginResponse>('http://localhost:5000/api/auth/login', {
        email: email,
        senha: senha
      });

      console.log("Login sucesso!", resposta.data);

      localStorage.setItem('token', resposta.data.token);

      navigate('/dashboard');

    } catch (error) {
      // No TypeScript, o erro no catch é 'unknown'. Precisamos verificar se é do Axios.
      if (axios.isAxiosError(error)) {
        // Agora o TS sabe que 'error' tem a propriedade 'response'
        setErro(error.response?.data?.msg || "Erro ao conectar com o servidor.");
      } else {
        setErro("Erro desconhecido.");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">AtivaMente</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email" placeholder="Seu E-mail" value={email} onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
          />
          <input
            type="password" placeholder="Sua Senha" value={senha} onChange={(e) => setSenha(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
          />

          <div className="text-right">
            <Link to="/recuperar-senha" className="text-sm text-blue-500 hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <button type="submit" className="bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-700 transition">
            ENTRAR
          </button>
        </form>

        {erro && <p className="mt-4 text-center text-red-500">{erro}</p>}

        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600">Não tem uma conta?</p>
          <Link to="/cadastro" className="text-blue-600 font-bold hover:underline">
            Crie sua conta agora
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
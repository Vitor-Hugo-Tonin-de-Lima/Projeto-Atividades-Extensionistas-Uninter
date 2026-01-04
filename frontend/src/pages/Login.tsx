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

  const [carregando, setCarregando] = useState(false);

  // Tipamos o evento como um evento de formulário HTML
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Definimos o que esperamos receber de resposta (opcional, mas boa prática)
      interface LoginResponse {
        token: string;
        msg: string;
      }

      const resposta = await axios.post<LoginResponse>(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: email,
        senha: senha
      });

      console.log("Login sucesso!", resposta.data);

      localStorage.setItem('token', resposta.data.token);

      navigate('/atividades');


    } catch (error) {
      // No TypeScript, o erro no catch é 'unknown'. Precisamos verificar se é do Axios.
      if (axios.isAxiosError(error)) {
        // Agora o TS sabe que 'error' tem a propriedade 'response'
        setErro(error.response?.data?.msg || "Erro ao conectar com o servidor.");
      } else {
        setErro("Erro desconhecido.");
        console.error(error);
      }
    } finally {
      setCarregando(false);
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
            disabled={carregando}
          />
          <input
            type="password" placeholder="Sua Senha" value={senha} onChange={(e) => setSenha(e.target.value)}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required
            disabled={carregando}
          />

          <div className="text-right">
            <Link to="/recuperar-senha" className="text-sm text-blue-500 hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

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
            ) : "ENTRAR"}
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
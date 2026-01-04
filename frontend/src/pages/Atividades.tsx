import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
}

import axios from 'axios';

function Atividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const carregarAtividades = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/activities`, getAuthHeader());
      // Mapeia do formato do Backend (steps) para o Frontend (Atividade)
      // O backend retorna: { _id, title, description, createdAt, ... }
      const listaMapeada = response.data.map((item: any) => ({
        id: item._id, // MongoDB string
        titulo: item.title,
        descricao: item.description,
        dataCriacao: new Date(item.createdAt).toLocaleDateString('pt-BR')
      }));
      setAtividades(listaMapeada);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
      // Se erro 401, redirecionar login?
    }
  };

  useEffect(() => {
    carregarAtividades();
  }, []);

  const criarNovaAtividade = async () => {
    try {
      const novaAtividadePre = {
        title: "Nova Atividade",
        description: "Descrição da atividade...",
        content: "Conteúdo principal",
        steps: [
          { title: "Introdução", instructions: "Comece a editar aqui..." }
        ]
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/activities`,
        novaAtividadePre,
        getAuthHeader()
      );

      const novoId = response.data._id;
      navigate(`/atividade/editar/${novoId}`);
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      alert("Erro ao criar nova atividade.");
    }
  };

  const excluirAtividade = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta atividade?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/activities/${id}`, getAuthHeader());
        // Recarrega lista
        carregarAtividades();
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir atividade.");
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* Cabeçalho Simples */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Minhas Atividades</h1>
          <div className="text-gray-500">Logado</div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Botão de Criar Nova Atividade */}
        <div className="flex justify-end mb-6">
          <button
            onClick={criarNovaAtividade}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition duration-200 flex items-center gap-2">
            <span className="text-xl">+</span> Criar Nova Atividade
          </button>
        </div>

        {/* Listagem das Atividades */}
        <div className="grid gap-4">
          {atividades.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Nenhuma atividade encontrada. Clique em "Criar Nova Atividade".</p>
          ) : (
            atividades.map((atividade) => (
              <div key={atividade.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition duration-200 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{atividade.titulo}</h3>
                    <p className="text-gray-600 mt-1">{atividade.descricao}</p>
                    <p className="text-sm text-gray-400 mt-2">Criado em: {atividade.dataCriacao}</p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 items-center">

                    {/* Botão de Visualizar */}
                    <Link to={`/atividade/visualizar/${atividade.id}`}>
                      <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium">
                        Visualizar
                      </button>
                    </Link>

                    {/* Botão de Compartilhar */}
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/atividade/visualizar/${atividade.id}`;
                        navigator.clipboard.writeText(url);
                        alert("Link copiado para a área de transferência!");
                      }}
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded text-sm font-medium"
                      title="Copiar link para alunos"
                    >
                      Compartilhar
                    </button>

                    {/* Botão de Editar */}
                    <Link to={`/atividade/editar/${atividade.id}`}>
                      <button className="text-blue-500 hover:text-blue-700 font-medium text-sm px-2">
                        Editar
                      </button>
                    </Link>


                    {/* Botão de Excluir */}
                    <button
                      onClick={() => excluirAtividade(atividade.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm px-2">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}

export default Atividades;
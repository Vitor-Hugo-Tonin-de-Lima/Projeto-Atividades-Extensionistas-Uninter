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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);


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

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
    } catch (error: any) {
      console.error("Erro ao criar atividade:", error);
      const msg = error.response?.data?.error || error.response?.data?.msg || error.message;
      showNotification(`Erro ao criar: ${msg}`, 'error');
    }
  };

  const confirmarExclusao = (id: number) => {
    setActivityToDelete(id);
    setShowDeleteModal(true);
  };

  const executarExclusao = async () => {
    if (!activityToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/activities/${activityToDelete}`, getAuthHeader());
      carregarAtividades();
      showNotification("Atividade excluída com sucesso!", 'success');
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showNotification("Erro ao excluir atividade.", 'error');
    } finally {
      setShowDeleteModal(false);
      setActivityToDelete(null);
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
                        showNotification("Link copiado para a área de transferência!", 'success');
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
                      onClick={() => confirmarExclusao(atividade.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm px-2">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
              <p className="mb-6 text-gray-600">Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={executarExclusao}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notificação Toast */}
        {notification && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white font-bold transition-all transform ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.msg}
          </div>
        )}

      </main>
    </div>
  );

}

export default Atividades;
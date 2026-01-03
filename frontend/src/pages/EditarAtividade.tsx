import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Topico {
  id: number;
  subtitulo: string;
  conteudo: string;
  imagemUrl?: string;
}

function EditarAtividade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tituloAtividade, setTituloAtividade] = useState('');
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [carregando, setCarregando] = useState(true); // Novo estado de carregamento

  useEffect(() => {
    // Simulando um tempo de carregamento para você ver que funciona
    setTimeout(() => {
      setTituloAtividade("Atividade Nova (Exemplo)");
      setTopicos([
        { id: 1, subtitulo: "Tópico 1", conteudo: "Conteúdo inicial...", imagemUrl: "" }
      ]);
      setCarregando(false); // Dados chegaram!
    }, 500);
  }, [id]);

  const adicionarTopico = () => {
    const novoId = topicos.length + 1;
    setTopicos([...topicos, { id: novoId, subtitulo: "Novo Tópico", conteudo: "", imagemUrl: "" }]);
    setAbaAtiva(topicos.length);
  };

  const atualizarTopico = (campo: keyof Topico, valor: string) => {
    const novosTopicos = [...topicos];
    // @ts-ignore
    novosTopicos[abaAtiva][campo] = valor;
    setTopicos(novosTopicos);
  };

  const salvarAlteracoes = () => {
    alert("Salvo!");
    navigate('/atividades');
  };

  // --- AQUI ESTÁ A PROTEÇÃO ---
  if (carregando) {
    return <div className="p-10 text-center">Carregando editor...</div>;
  }

  // Se carregou mas a lista está vazia (caso raro, mas possível)
  if (topicos.length === 0) {
    return <div className="p-10 text-center">Erro: A atividade não possui tópicos. <button onClick={adicionarTopico}>Adicionar Tópico</button></div>;
  }

  // Só renderiza o resto se tiver certeza que topicos[abaAtiva] existe
  const topicoAtual = topicos[abaAtiva]; 

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <label className="text-xs text-gray-500 font-bold uppercase">Título</label>
        <input 
          type="text" 
          value={tituloAtividade} 
          onChange={(e) => setTituloAtividade(e.target.value)}
          className="w-full text-xl font-bold text-blue-800 bg-transparent border-b border-gray-300 outline-none"
        />
      </header>

      <div className="bg-blue-600 overflow-x-auto whitespace-nowrap p-2">
        <div className="flex gap-2">
          {topicos.map((topico, index) => (
            <button
              key={topico.id}
              onClick={() => setAbaAtiva(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                abaAtiva === index ? 'bg-white text-blue-700' : 'bg-blue-700 text-blue-100'
              }`}
            >
              {index + 1}. {topico.subtitulo || "Sem título"}
            </button>
          ))}
          <button onClick={adicionarTopico} className="px-3 py-2 rounded-full bg-blue-800 text-white font-bold">+</button>
        </div>
      </div>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full overflow-y-auto mb-20">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700">Subtítulo</label>
            <input 
              type="text" 
              value={topicoAtual.subtitulo}
              onChange={(e) => atualizarTopico('subtitulo', e.target.value)}
              className="w-full p-2 border rounded bg-gray-50"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700">Texto</label>
              <textarea 
                rows={8}
                value={topicoAtual.conteudo}
                onChange={(e) => atualizarTopico('conteudo', e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 resize-none"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-gray-700">Imagem (URL)</label>
               <input 
                  type="text" 
                  value={topicoAtual.imagemUrl || ''}
                  onChange={(e) => atualizarTopico('imagemUrl', e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 text-xs mb-2"
                  placeholder="http://..."
                />
               {topicoAtual.imagemUrl && <img src={topicoAtual.imagemUrl} className="w-full rounded" />}
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={() => navigate('/atividades')} className="text-gray-500">Cancelar</button>
        <button onClick={salvarAlteracoes} className="bg-green-600 text-white px-6 py-2 rounded-full font-bold">Salvar</button>
      </footer>
    </div>
  );
}

export default EditarAtividade;
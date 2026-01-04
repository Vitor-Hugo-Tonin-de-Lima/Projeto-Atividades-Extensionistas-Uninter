import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Topico {
  id: number;
  subtitulo: string;
  conteudo: string;
  imagemUrl?: string;
}

interface Atividade {
  id: number;
  titulo: string;
  descricao?: string;
  topicos: Topico[];
}

function EditarAtividade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Carrega do DB centralizado
    const db = localStorage.getItem('atividades_db');
    if (db) {
      const lista: Atividade[] = JSON.parse(db);
      const alvo = lista.find(a => a.id === Number(id));
      if (alvo) {
        setAtividade(alvo);
        setCarregando(false);
        return;
      }
    }
    // Se não achar, não faz nada (ou poderia redirecionar)
    setCarregando(false);
  }, [id]);

  const adicionarTopico = () => {
    if (!atividade) return;
    const novosTopicos = [...atividade.topicos, {
      id: Date.now(),
      subtitulo: "Novo Tópico",
      conteudo: "",
      imagemUrl: ""
    }];
    setAtividade({ ...atividade, topicos: novosTopicos });
    setAbaAtiva(atividade.topicos.length); // Vai para o novo
  };

  const atualizarTopico = (campo: keyof Topico, valor: string) => {
    if (!atividade) return;
    const novosTopicos = [...atividade.topicos];
    // @ts-ignore
    novosTopicos[abaAtiva][campo] = valor;
    setAtividade({ ...atividade, topicos: novosTopicos });
  };

  const atualizarTitulo = (novoTitulo: string) => {
    if (atividade) {
      setAtividade({ ...atividade, titulo: novoTitulo });
    }
  }

  const salvarAlteracoes = () => {
    if (!atividade) return;

    // Atualiza no DB centralizado
    const db = localStorage.getItem('atividades_db');
    if (db) {
      const lista: Atividade[] = JSON.parse(db);
      const index = lista.findIndex(a => a.id === Number(id));

      if (index !== -1) {
        lista[index] = atividade;
        localStorage.setItem('atividades_db', JSON.stringify(lista));
        alert("Atividade salva com sucesso!");
        navigate('/atividades');
      } else {
        alert("Erro: Atividade original não encontrada.");
      }
    }
  };

  if (carregando) return <div className="p-10 text-center">Carregando editor...</div>;
  if (!atividade) return <div className="p-10 text-center text-red-500">Erro: Atividade não encontrada no banco de dados.</div>;

  // Renderiza tópicos se houver
  const topicoAtual = atividade.topicos[abaAtiva];

  if (!topicoAtual && atividade.topicos.length > 0) {
    // Correção caso abaAtiva esteja fora de índice
    setAbaAtiva(0);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <label className="text-xs text-gray-500 font-bold uppercase">Título da Atividade</label>
        <input
          type="text"
          value={atividade.titulo}
          onChange={(e) => atualizarTitulo(e.target.value)}
          className="w-full text-xl font-bold text-blue-800 bg-transparent border-b border-gray-300 outline-none"
        />
      </header>

      <div className="bg-blue-600 overflow-x-auto whitespace-nowrap p-2">
        <div className="flex gap-2">
          {atividade.topicos.map((topico, index) => (
            <button
              key={topico.id}
              onClick={() => setAbaAtiva(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${abaAtiva === index ? 'bg-white text-blue-700' : 'bg-blue-700 text-blue-100'
                }`}
            >
              {index + 1}. {topico.subtitulo || "Sem título"}
            </button>
          ))}
          <button onClick={adicionarTopico} className="px-3 py-2 rounded-full bg-blue-800 text-white font-bold">+</button>
        </div>
      </div>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full overflow-y-auto mb-20">
        {atividade.topicos.length === 0 ? (
          <div className="text-center p-10 text-gray-500">
            Nenhum tópico criado. Clique no "+" acima.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700">Subtítulo do Tópico</label>
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
                  className="w-full p-2 border rounded bg-gray-50 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-bold">Dica:</span> Para criar um glossário interativo, use o formato
                  <code className="bg-gray-100 px-1 rounded text-blue-600 mx-1">{'{{Termo::Descrição}}'}</code>.
                  Exemplo: <i>O <code className="bg-gray-100 px-1 rounded text-blue-600">{'{{DNA::Ácido Desoxirribonucleico}}'}</code> é essencial...</i>
                </p>
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
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={() => navigate('/atividades')} className="text-gray-500">Cancelar</button>
        <button onClick={salvarAlteracoes} className="bg-green-600 text-white px-6 py-2 rounded-full font-bold">Salvar Alterações</button>
      </footer>
    </div>
  );
}

export default EditarAtividade;
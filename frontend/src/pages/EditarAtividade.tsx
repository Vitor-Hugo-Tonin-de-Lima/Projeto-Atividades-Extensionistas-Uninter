import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Topico {
  id: number | string;
  subtitulo: string;
  conteudo: string;
  imagemUrl?: string;
  pairs?: Pair[];
}

interface PairItem {
  type: 'text' | 'image';
  content: string;
}

interface Pair {
  id: number;
  itemA: PairItem;
  itemB: PairItem;
}

interface Atividade {
  id: string;
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
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/activities/${id}`, getAuthHeader());
        const dados = response.data;

        const atividadeMapeada: Atividade = {
          id: dados._id,
          titulo: dados.title,
          descricao: dados.description,
          topicos: dados.steps ? dados.steps.map((s: any, idx: number) => ({
            id: s._id || idx,
            subtitulo: s.title,
            conteudo: s.instructions,
            imagemUrl: s.imageUrl,
            pairs: s.pairs ? s.pairs.map((p: any, pIdx: number) => ({
              id: pIdx,
              itemA: { type: p.itemA?.type || 'text', content: p.itemA?.content || p.itemA || '' },
              itemB: { type: p.itemB?.type || 'text', content: p.itemB?.content || p.itemB || '' }
            })) : []
          })) : []
        };
        setAtividade(atividadeMapeada);
        setCarregando(false);
      } catch (error) {
        console.error("Erro ao carregar:", error);
        setCarregando(false);
      }
    };
    if (id) carregar();
  }, [id]);

  const adicionarTopico = () => {
    if (!atividade) return;
    const novosTopicos = [...atividade.topicos, {
      id: Date.now(),
      subtitulo: "Novo Tópico",
      conteudo: "",
      imagemUrl: "",
      pairs: []
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

  const removerTopico = (index: number) => {
    if (!atividade) return;
    const novosTopicos = atividade.topicos.filter((_, i) => i !== index);
    setAtividade({ ...atividade, topicos: novosTopicos });
    if (abaAtiva >= novosTopicos.length) {
      setAbaAtiva(Math.max(0, novosTopicos.length - 1));
    }
  };

  const adicionarPar = () => {
    if (!atividade) return;
    const novosTopicos = [...atividade.topicos];
    const topico = novosTopicos[abaAtiva];
    if (!topico.pairs) topico.pairs = [];

    topico.pairs.push({
      id: Date.now(),
      itemA: { type: 'text', content: '' },
      itemB: { type: 'text', content: '' }
    });

    setAtividade({ ...atividade, topicos: novosTopicos });
  };

  const removerPar = (pairIndex: number) => {
    if (!atividade) return;
    const novosTopicos = [...atividade.topicos];
    if (!novosTopicos[abaAtiva].pairs) return;

    novosTopicos[abaAtiva].pairs = novosTopicos[abaAtiva].pairs!.filter((_, i) => i !== pairIndex);
    setAtividade({ ...atividade, topicos: novosTopicos });
  };

  const atualizarPar = (pairIndex: number, side: 'itemA' | 'itemB', field: 'type' | 'content', value: string) => {
    if (!atividade) return;
    const novosTopicos = [...atividade.topicos];
    const topico = novosTopicos[abaAtiva];
    if (!topico.pairs) return;

    const pair = topico.pairs[pairIndex];
    // @ts-ignore
    pair[side][field] = value;

    setAtividade({ ...atividade, topicos: novosTopicos });
  };

  const salvarAlteracoes = async () => {
    if (!atividade) return;

    // Validação de tópicos vazios
    const temTopicosVazios = atividade.topicos.some(t => !t.subtitulo.trim() || !t.conteudo.trim());
    if (temTopicosVazios) {
      showNotification("Existem tópicos sem nenhum conteúdo (título ou texto).", 'error');
      return;
    }

    try {
      const payload = {
        title: atividade.titulo,
        description: atividade.descricao || "Descrição automática",
        steps: atividade.topicos.map(t => ({
          title: t.subtitulo,
          instructions: t.conteudo,
          imageUrl: t.imagemUrl,
          pairs: t.pairs ? t.pairs.map(p => ({
            itemA: p.itemA,
            itemB: p.itemB
          })) : []
        }))
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/activities/${id}`, payload, getAuthHeader());
      showNotification("Atividade salva com sucesso!", 'success');
      setTimeout(() => navigate('/atividades'), 1000); // Pequeno delay para ler a msg
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showNotification("Erro ao salvar atividade.", 'error');
    }
  };

  if (carregando) return <div className="p-10 text-center">Carregando editor...</div>;
  if (!atividade) return <div className="p-10 text-center text-red-500">Erro: Atividade não encontrada.</div>;

  const topicoAtual = atividade.topicos[abaAtiva];

  if (!topicoAtual && atividade.topicos.length > 0) {
    setAbaAtiva(0);
    return null;
  }


  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* ... Header and other UI ... */}

      {/* ... Main content ... */}

      {/* Render existing UI until footer */}
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
            <div className="flex justify-between items-end mb-4">
              <div className="w-full mr-4">
                <label className="block text-sm font-bold text-gray-700">Subtítulo do Tópico</label>
                <input
                  type="text"
                  value={topicoAtual.subtitulo}
                  onChange={(e) => atualizarTopico('subtitulo', e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50"
                />
              </div>
              <button
                onClick={() => removerTopico(abaAtiva)}
                className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded font-medium text-sm h-10 mb-0.5"
                title="Excluir este tópico"
              >
                Excluir
              </button>
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

            {/* Seção do Jogo de Associação */}
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-900">Jogo de Associação (Opcional)</h3>
                  <p className="text-sm text-gray-500">Crie pares de cartas que o aluno deve associar. Pode ser Texto ou Imagem.</p>
                </div>
                <button
                  onClick={adicionarPar}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-200"
                >
                  + Adicionar Par
                </button>
              </div>

              {topicoAtual.pairs && topicoAtual.pairs.length > 0 ? (
                <div className="space-y-4">
                  {topicoAtual.pairs.map((par, idx) => (
                    <div key={par.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-start relative">
                      <button
                        onClick={() => removerPar(idx)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold"
                        title="Remover Par"
                      >
                        x
                      </button>

                      {/* Lado A */}
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Lado A</label>
                          <select
                            value={par.itemA.type}
                            onChange={(e) => atualizarPar(idx, 'itemA', 'type', e.target.value)}
                            className="text-xs border rounded p-1"
                          >
                            <option value="text">Texto</option>
                            <option value="image">Imagem</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={par.itemA.content}
                          onChange={(e) => atualizarPar(idx, 'itemA', 'content', e.target.value)}
                          placeholder={par.itemA.type === 'image' ? 'URL da imagem...' : 'Texto...'}
                          className="w-full p-2 border rounded bg-white text-sm"
                        />
                        {par.itemA.type === 'image' && par.itemA.content && (
                          <img src={par.itemA.content} className="h-20 mt-2 rounded object-cover border" />
                        )}
                      </div>

                      <div className="hidden md:flex items-center justify-center self-center text-gray-300">
                        ↔
                      </div>

                      {/* Lado B */}
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Lado B</label>
                          <select
                            value={par.itemB.type}
                            onChange={(e) => atualizarPar(idx, 'itemB', 'type', e.target.value)}
                            className="text-xs border rounded p-1"
                          >
                            <option value="text">Texto</option>
                            <option value="image">Imagem</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={par.itemB.content}
                          onChange={(e) => atualizarPar(idx, 'itemB', 'content', e.target.value)}
                          placeholder={par.itemB.type === 'image' ? 'URL da imagem...' : 'Texto...'}
                          className="w-full p-2 border rounded bg-white text-sm"
                        />
                        {par.itemB.type === 'image' && par.itemB.content && (
                          <img src={par.itemB.content} className="h-20 mt-2 rounded object-cover border" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400">
                  Nenhum jogo criado neste tópico. Clique em "Adicionar Par" para começar.
                </div>
              )}
            </div>
          </div>
        )
        }
      </main >

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <button onClick={() => navigate('/atividades')} className="text-gray-500">Cancelar</button>
        <button onClick={salvarAlteracoes} className="bg-green-600 text-white px-6 py-2 rounded-full font-bold">Salvar Alterações</button>
      </footer>

      {/* Notificação Toast */}
      {
        notification && (
          <div className={`fixed bottom-20 right-4 px-6 py-3 rounded shadow-lg text-white font-bold transition-all transform z-50 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.msg}
          </div>
        )
      }
    </div >
  );

}

export default EditarAtividade;
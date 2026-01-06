import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GlossaryText from '../components/GlossaryText';
import AssociationGame from '../components/AssociationGame';


interface Topico {
    id: number;
    subtitulo: string;
    conteudo: string;
    imagemUrl?: string;
    pairs?: any[];
}

interface Atividade {
    id: number;
    titulo: string;
    topicos: Topico[];
}

function VisualizarAtividade() {
    const { id } = useParams();
    const [atividade, setAtividade] = useState<Atividade | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [topicoAtivo, setTopicoAtivo] = useState(0);

    useEffect(() => {
        const carregarAtividade = async () => {
            try {
                // Busca do Backend via API (pública ou privada)
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/activities/${id}`);
                const dados = response.data;

                // Mapeia do formato do Backend (steps) para o Frontend (topicos)
                const atividadeFormatada: Atividade = {
                    id: dados._id,
                    titulo: dados.title,
                    topicos: dados.steps.map((step: any, index: number) => ({
                        id: index, // O ID do step no backend é _id, mas aqui usamos index simples para seleção de aba
                        subtitulo: step.title,
                        conteudo: step.instructions,
                        imagemUrl: step.imageUrl,
                        pairs: step.pairs ? step.pairs.map((p: any) => ({
                            itemA: { type: p.itemA?.type || 'text', content: p.itemA?.content || p.itemA || '' },
                            itemB: { type: p.itemB?.type || 'text', content: p.itemB?.content || p.itemB || '' }
                        })) : []
                    }))
                };

                setAtividade(atividadeFormatada);
                setCarregando(false);
            } catch (error) {
                console.error("Erro ao carregar atividade:", error);
                setCarregando(false);
            }
        };

        carregarAtividade();
    }, [id]);


    if (carregando) return <div className="p-10 text-center text-gray-500">Carregando atividade...</div>;
    if (!atividade) return <div className="p-10 text-center text-red-500">Atividade não encontrada.</div>;

    const topicoAtual = atividade.topicos[topicoAtivo];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* Header do Aluno */}
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">{atividade.titulo}</h1>
                    {localStorage.getItem('token') && (
                        <Link to="/atividades" className="text-blue-100 hover:text-white text-sm">Voltar</Link>
                    )}

                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 md:p-8">
                {/* Navegação entre tópicos (abas simples) */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b">
                    {atividade.topicos.map((topico, idx) => (
                        <button
                            key={topico.id}
                            onClick={() => setTopicoAtivo(idx)}
                            className={`px-4 py-3 min-w-[120px] rounded-md text-sm font-bold transition-all shadow-sm ${topicoAtivo === idx
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow'
                                }`}
                        >
                            {idx + 1}. {topico.subtitulo}
                        </button>
                    ))}
                </div>


                {/* Conteúdo do Tópico */}
                <div className="animate-fade-in space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">{topicoAtual.subtitulo || "Sem subtítulo"}</h2>

                    {topicoAtual.imagemUrl && (
                        <div className="flex justify-center bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <img
                                src={topicoAtual.imagemUrl}
                                alt={topicoAtual.subtitulo}
                                className="max-w-full h-auto max-h-[600px] object-contain rounded shadow-sm"
                            />
                        </div>
                    )}


                    <div className="prose prose-lg max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        {/* Aqui usamos o nosso componente mágico */}
                        <GlossaryText content={topicoAtual.conteudo} />
                    </div>

                    {/* Jogo de Associação */}
                    {topicoAtual.pairs && topicoAtual.pairs.length > 0 && (
                        <AssociationGame pairs={topicoAtual.pairs} />
                    )}
                </div>
            </main>
        </div>
    );
}

export default VisualizarAtividade;

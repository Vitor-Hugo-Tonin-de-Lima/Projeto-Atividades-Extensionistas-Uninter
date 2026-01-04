import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import GlossaryText from '../components/GlossaryText';

interface Topico {
    id: number;
    subtitulo: string;
    conteudo: string;
    imagemUrl?: string;
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

        // Se não achar (e não for erro de carregamento), apenas finaliza carregamento
        setCarregando(false);
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
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${topicoAtivo === idx
                                ? 'bg-blue-100 text-blue-800 border-blue-200 border'
                                : 'text-gray-500 hover:bg-gray-100'
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
                        <img
                            src={topicoAtual.imagemUrl}
                            alt={topicoAtual.subtitulo}
                            className="w-full h-64 object-cover rounded-xl shadow-sm"
                        />
                    )}

                    <div className="prose prose-lg max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        {/* Aqui usamos o nosso componente mágico */}
                        <GlossaryText content={topicoAtual.conteudo} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default VisualizarAtividade;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios'; // Descomente quando tivermos a rota no backend

// Tipo de dados para uma atividade (interface TypeScript)
interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
}

function Atividades() {
  // Estado para guardar a lista de atividades
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  // Simulação de busca de dados (depois trocaremos pelo axios.get)
  useEffect(() => {
    // AQUI VIRIA: const response = await axios.get('...');
    // Por enquanto, usamos dados falsos para testar o layout:
    const dadosFalsos: Atividade[] = [
      { id: 1, titulo: "Aula de História - Revolução Francesa", descricao: "Roteiro sobre a Queda da Bastilha.", dataCriacao: "10/10/2023" },
      { id: 2, titulo: "Matemática - Geometria Básica", descricao: "Exercícios práticos de triângulos.", dataCriacao: "12/10/2023" },
      { id: 3, titulo: "Ciências - O Ciclo da Água", descricao: "Experimento prático com evaporação.", dataCriacao: "15/10/2023" },
    ];
    setAtividades(dadosFalsos);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* Cabeçalho Simples */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Minhas Atividades</h1>
          <Link to="/dashboard" className="text-gray-500 hover:text-blue-600">Voltar ao Painel</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Botão de Criar Nova Atividade */}
        <div className="flex justify-end mb-6">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition duration-200 flex items-center gap-2">
            <span className="text-xl">+</span> Criar Nova Atividade
          </button>
        </div>

        {/* Listagem das Atividades */}
        <div className="grid gap-4">
          {atividades.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Nenhuma atividade encontrada.</p>
          ) : (
            atividades.map((atividade) => (
              <div key={atividade.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition duration-200 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{atividade.titulo}</h3>
                    <p className="text-gray-600 mt-1">{atividade.descricao}</p>
                    <p className="text-sm text-gray-400 mt-2">Criado em: {atividade.dataCriacao}</p>
                  </div>
                  
                  {/* Botões de Ação (Editar/Excluir) */}
                  <div className="flex gap-2">
                    
                    {/* Link para a página de edição passando o ID da atividade */}
                    <Link to={`/atividade/editar/${atividade.id}`}>
                      <button className="text-blue-500 hover:text-blue-700 font-medium text-sm">
                          Editar
                      </button>
                    </Link>
                    
                    <button className="text-red-500 hover:text-red-700 font-medium text-sm">Excluir</button>
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
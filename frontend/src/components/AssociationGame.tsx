import { useState, useEffect } from 'react';

interface PairItem {
    type: 'text' | 'image';
    content: string;
}

interface Pair {
    _id?: string;
    itemA: PairItem;
    itemB: PairItem;
}

interface GameItem {
    id: string;
    pairId: string;
    content: string;
    type: 'text' | 'image';
    isMatched: boolean;
}

interface AssociationGameProps {
    pairs: Pair[];
}

const AssociationGame = ({ pairs }: AssociationGameProps) => {
    const [leftItems, setLeftItems] = useState<GameItem[]>([]);
    const [rightItems, setRightItems] = useState<GameItem[]>([]);

    // IDs of selected items
    const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
    const [selectedRightId, setSelectedRightId] = useState<string | null>(null);

    // Status of the current selection attempt
    const [matchStatus, setMatchStatus] = useState<'none' | 'success' | 'error'>('none');
    const [gameCompleted, setGameCompleted] = useState(false);

    useEffect(() => {
        initializeGame();
    }, [pairs]);

    // Check for game completion
    useEffect(() => {
        if (leftItems.length > 0 && leftItems.every(i => i.isMatched)) {
            setGameCompleted(true);
        }
    }, [leftItems]);

    const initializeGame = () => {
        if (!pairs || pairs.length === 0) return;

        const lItems: GameItem[] = pairs.map((p, idx) => ({
            id: `left-${idx}`,
            pairId: p._id || `pair-${idx}`,
            content: p.itemA.content,
            type: p.itemA.type,
            isMatched: false
        }));

        const rItems: GameItem[] = pairs.map((p, idx) => ({
            id: `right-${idx}`,
            pairId: p._id || `pair-${idx}`,
            content: p.itemB.content,
            type: p.itemB.type,
            isMatched: false
        }));

        // Shuffle independently
        setLeftItems(lItems.sort(() => Math.random() - 0.5));
        setRightItems(rItems.sort(() => Math.random() - 0.5));

        setSelectedLeftId(null);
        setSelectedRightId(null);
        setMatchStatus('none');
        setGameCompleted(false);
    };

    const handleItemClick = (side: 'left' | 'right', item: GameItem) => {
        if (item.isMatched || matchStatus !== 'none') return;

        if (side === 'left') {
            if (selectedLeftId === item.id) {
                setSelectedLeftId(null); // Deselect
                return;
            }
            setSelectedLeftId(item.id);
            if (selectedRightId) {
                checkMatch(item.id, selectedRightId);
            }
        } else {
            if (selectedRightId === item.id) {
                setSelectedRightId(null); // Deselect
                return;
            }
            setSelectedRightId(item.id);
            if (selectedLeftId) {
                checkMatch(selectedLeftId, item.id);
            }
        }
    };

    const checkMatch = (leftId: string, rightId: string) => {
        // Find items to verify logic (though we have pairIDs)
        const left = leftItems.find(i => i.id === leftId);
        const right = rightItems.find(i => i.id === rightId);

        if (left && right && left.pairId === right.pairId) {
            setMatchStatus('success');
            // Delay to show success state before removing/disabling
            setTimeout(() => {
                setLeftItems(prev => prev.map(i => i.id === leftId ? { ...i, isMatched: true } : i));
                setRightItems(prev => prev.map(i => i.id === rightId ? { ...i, isMatched: true } : i));
                setSelectedLeftId(null);
                setSelectedRightId(null);
                setMatchStatus('none');
            }, 600);
        } else {
            setMatchStatus('error');
            // Delay to show error state before resetting selection
            setTimeout(() => {
                setSelectedLeftId(null);
                setSelectedRightId(null);
                setMatchStatus('none');
            }, 1000);
        }
    };

    const getItemStyle = (item: GameItem, isSelected: boolean) => {
        const base = "w-full p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-center min-h-[100px] shadow-sm ";

        if (item.isMatched) {
            return base + "bg-green-50 border-green-200 opacity-60 grayscale cursor-default transform scale-95";
        }

        if (isSelected) {
            if (matchStatus === 'success') {
                return base + "bg-green-100 border-green-500 shadow-md transform scale-105 z-10";
            }
            if (matchStatus === 'error') {
                return base + "bg-red-100 border-red-500 animate-pulse";
            }
            return base + "bg-blue-50 border-blue-500 shadow-md transform scale-105 z-10 ring-2 ring-blue-200";
        }

        return base + "bg-white border-gray-100 hover:border-blue-300 hover:shadow-md hover:-translate-y-1";
    };

    if (!pairs || pairs.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 shadow-sm my-8">
            <div className="flex justify-between items-center mb-8 border-b border-blue-200 pb-4">
                <div>
                    <h3 className="text-2xl font-bold text-blue-900">Associe as Colunas</h3>
                    <p className="text-blue-600 text-sm mt-1">Selecione um item da esquerda e seu par na direita.</p>
                </div>
                <button
                    onClick={initializeGame}
                    className="flex items-center gap-2 text-sm bg-white text-blue-700 px-4 py-2 rounded-full font-bold shadow-sm hover:shadow hover:bg-blue-50 transition border border-blue-100"
                >
                    <span className="text-lg">↻</span> Reiniciar
                </button>
            </div>

            {gameCompleted ? (
                <div className="text-center py-16 animate-fade-in bg-white/50 rounded-xl border border-white backdrop-blur-sm">
                    <div className="text-7xl mb-6 animate-bounce">🎉</div>
                    <h4 className="text-3xl font-bold text-green-600 mb-3">Parabéns!</h4>
                    <p className="text-gray-600 text-lg">Você completou todas as associações com sucesso!</p>
                    <button
                        onClick={initializeGame}
                        className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
                    >
                        Jogar Novamente
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-8 relative">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <h4 className="text-center font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">Coluna A</h4>
                        {leftItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick('left', item)}
                                className={getItemStyle(item, selectedLeftId === item.id)}
                            >
                                {item.type === 'image' ? (
                                    <img src={item.content} alt="Item" className="max-w-full max-h-24 object-contain rounded" />
                                ) : (
                                    <span className="text-gray-800 font-medium text-center leading-tight">{item.content}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <h4 className="text-center font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">Coluna B</h4>
                        {rightItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick('right', item)}
                                className={getItemStyle(item, selectedRightId === item.id)}
                            >
                                {item.type === 'image' ? (
                                    <img src={item.content} alt="Item" className="max-w-full max-h-24 object-contain rounded" />
                                ) : (
                                    <span className="text-gray-800 font-medium text-center leading-tight">{item.content}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Connect line visualization could go here with SVG but it's complex for responsive grid. 
                        We rely on highlighting selection state. */}
                </div>
            )}
        </div>
    );
};

export default AssociationGame;

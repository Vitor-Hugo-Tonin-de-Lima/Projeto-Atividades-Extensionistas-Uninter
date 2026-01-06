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

interface Card {
    id: string;
    content: string;
    type: 'text' | 'image';
    pairId: string; // The ID of the pair this card belongs to
    isFlipped: boolean;
    isMatched: boolean;
}

interface AssociationGameProps {
    pairs: Pair[];
}

const AssociationGame = ({ pairs }: AssociationGameProps) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);

    useEffect(() => {
        initializeGame();
    }, [pairs]);

    const initializeGame = () => {
        if (!pairs || pairs.length === 0) return;

        const newCards: Card[] = [];

        pairs.forEach((pair, index) => {
            const pairId = pair._id || `pair-${index}`;

            // Card A
            newCards.push({
                id: `card-${index}-A`,
                content: pair.itemA.content,
                type: pair.itemA.type,
                pairId: pairId,
                isFlipped: false,
                isMatched: false
            });

            // Card B
            newCards.push({
                id: `card-${index}-B`,
                content: pair.itemB.content,
                type: pair.itemB.type,
                pairId: pairId,
                isFlipped: false,
                isMatched: false
            });
        });

        // Shuffle cards
        const shuffled = newCards.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setGameCompleted(false);
        setSelectedCards([]);
    };

    const handleCardClick = (clickedCard: Card) => {
        if (isProcessing || clickedCard.isMatched || clickedCard.isFlipped) return;

        // Flip the card
        const updatedCards = cards.map(c =>
            c.id === clickedCard.id ? { ...c, isFlipped: true } : c
        );
        setCards(updatedCards);

        const newSelected = [...selectedCards, clickedCard];
        setSelectedCards(newSelected);

        // If 2 cards are selected, check for match
        if (newSelected.length === 2) {
            setIsProcessing(true);
            checkForMatch(newSelected[0], newSelected[1], updatedCards);
        }
    };

    const checkForMatch = (card1: Card, card2: Card, currentCards: Card[]) => {
        const isMatch = card1.pairId === card2.pairId;

        if (isMatch) {
            // It's a match!
            setTimeout(() => {
                const matchedCards = currentCards.map(c =>
                    (c.id === card1.id || c.id === card2.id)
                        ? { ...c, isMatched: true, isFlipped: true }
                        : c
                );
                setCards(matchedCards);
                setSelectedCards([]);
                setIsProcessing(false);

                // Check if game is over
                if (matchedCards.every(c => c.isMatched)) {
                    setGameCompleted(true);
                }
            }, 500);
        } else {
            // Not a match
            setTimeout(() => {
                const resetCards = currentCards.map(c =>
                    (c.id === card1.id || c.id === card2.id)
                        ? { ...c, isFlipped: false }
                        : c
                );
                setCards(resetCards);
                setSelectedCards([]);
                setIsProcessing(false);
            }, 1000);
        }
    };

    if (!pairs || pairs.length === 0) return null;

    return (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-900">Jogo de Associação</h3>
                <button
                    onClick={initializeGame}
                    className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded hover:bg-blue-300 transition"
                >
                    Reiniciar Jogo
                </button>
            </div>

            {gameCompleted ? (
                <div className="text-center py-10 animate-fade-in">
                    <div className="text-6xl mb-4">🎉</div>
                    <h4 className="text-2xl font-bold text-green-600 mb-2">Parabéns!</h4>
                    <p className="text-gray-600">Você completou todas as associações.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cards.map(card => (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(card)}
                            disabled={card.isMatched}
                            className={`
                aspect-[4/3] rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform
                ${card.isMatched ? 'bg-green-100 border-2 border-green-400 opacity-50 scale-95' : ''}
                ${!card.isMatched && card.isFlipped ? 'bg-white border-2 border-blue-500 shadow-lg scale-100' : ''}
                ${!card.isMatched && !card.isFlipped ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : ''}
              `}
                        >
                            {(card.isFlipped || card.isMatched) ? (
                                <div className="animate-flip-in w-full h-full flex items-center justify-center overflow-hidden">
                                    {card.type === 'image' ? (
                                        <img src={card.content} alt="Card" className="max-w-full max-h-full object-contain rounded" />
                                    ) : (
                                        <span className="text-gray-800 font-bold text-sm md:text-base">{card.content}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-white text-3xl font-bold opacity-20">?</div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssociationGame;

import { useState, useRef, useEffect } from 'react';

interface GlossaryTextProps {
    content: string;
}

const GlossaryText = ({ content }: GlossaryTextProps) => {
    // Normalize newlines to \n to ensure consistent behavior
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Regex to match {{term::description}} - support multiline and ensure accents are handled
    const regex = /\{\{([\s\S]*?)::([\s\S]*?)\}\}/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(normalizedContent)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: normalizedContent.slice(lastIndex, match.index),
            });
        }

        parts.push({
            type: 'glossary',
            term: match[1].trim(),
            description: match[2].trim(),
        });

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < normalizedContent.length) {
        parts.push({
            type: 'text',
            content: normalizedContent.slice(lastIndex),
        });
    }

    return (
        <div className="leading-relaxed break-words text-gray-800">
            {parts.map((part, index) => {
                if (part.type === 'text') {
                    // Split text by newlines and render with <br/> to guarantee line breaks work
                    const lines = part.content!.split('\n');
                    return (
                        <span key={`text-${index}-${part.content!.substring(0, 10)}`}>
                            {lines.map((line, lineIdx) => (
                                <span key={lineIdx}>
                                    {line}
                                    {lineIdx < lines.length - 1 && <br />}
                                </span>
                            ))}
                        </span>
                    );
                } else {
                    return (
                        <GlossaryItem
                            key={`glossary-${index}-${part.term}`}
                            term={part.term!}
                            description={part.description!}
                        />
                    );
                }
            })}
        </div>
    );
};

const GlossaryItem = ({ term, description }: { term: string; description: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const togglePopup = () => {
        if (!isOpen && triggerRef.current) {
            // Calculate position (simple version - can be improved for edge cases)
            // This is relative to the viewport or closest positioned ancestor
            // For simplicity in this iteration, we'll use a CSS absolute approach within a relative container if possible,
            // but popping out of flow usually requires fixed/absolute positioning logic.
            // Let's rely on standard CSS grouping first.
        }
        setIsOpen(!isOpen);
    };

    return (
        <span className="relative inline-block">
            <span
                ref={triggerRef}
                onClick={togglePopup}
                className="text-blue-600 border-b-2 border-blue-300 border-dotted cursor-pointer hover:bg-blue-50 transition-colors duration-200 font-medium"
                title="Clique para ver o significado"
            >
                {term}
            </span>

            {isOpen && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-4 bg-white rounded-lg shadow-xl border border-gray-200 text-sm text-gray-700 animate-fade-in">
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-8 border-transparent border-t-white"></div>

                    <h4 className="font-bold text-gray-900 mb-1 border-b pb-1">{term}</h4>
                    <p>{description}</p>
                </div>
            )}
        </span>
    );
};

export default GlossaryText;

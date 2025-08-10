import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Part {
  text: string;
  start: number;
  end: number;
  children: PhraseData[];
}

interface PhraseData {
  phrase: string;
  parts: Part[];
}

interface PhraseComponentProps {
  data: PhraseData;
  level?: number;
}

const PhraseComponent: React.FC<PhraseComponentProps> = ({ data, level = 0 }) => {
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set());
  const [hoveredPart, setHoveredPart] = useState<number | null>(null);

  const toggleExpansion = (partIndex: number) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partIndex)) {
      newExpanded.delete(partIndex);
    } else {
      newExpanded.add(partIndex);
    }
    setExpandedParts(newExpanded);
  };

  const renderPhrase = () => {
    const { phrase, parts } = data;
    let renderedText = [];
    let currentIndex = 0;

    parts.forEach((part, partIndex) => {
      // Add text before the part
      if (part.start > currentIndex) {
        renderedText.push(
          <span key={`text-${currentIndex}`}>
            {phrase.slice(currentIndex, part.start)}
          </span>
        );
      }

      // Add the highlightable part
      renderedText.push(
        <span
          key={`part-${partIndex}`}
          className={`highlightable-part ${hoveredPart === partIndex ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredPart(partIndex)}
          onMouseLeave={() => setHoveredPart(null)}
          onClick={() => toggleExpansion(partIndex)}
        >
          {part.text}
        </span>
      );

      currentIndex = part.end;
    });

    // Add remaining text
    if (currentIndex < phrase.length) {
      renderedText.push(
        <span key={`text-${currentIndex}`}>
          {phrase.slice(currentIndex)}
        </span>
      );
    }

    return renderedText;
  };

  return (
    <div className={`phrase-container level-${level}`}>
      <div className="phrase-text">
        {renderPhrase()}
      </div>
      
      <AnimatePresence>
        {data.parts.map((part, partIndex) => 
          expandedParts.has(partIndex) && (
            <motion.div
              key={`expansion-${partIndex}`}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="expansion-container"
            >
              {part.children.map((childPhrase, childIndex) => (
                <PhraseComponent
                  key={childIndex}
                  data={childPhrase}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhraseComponent;
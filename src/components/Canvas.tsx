import React, { useState } from 'react';

interface CanvasPosition {
  x: number;
  y: number;
}

interface Connection {
  parentId: string;
  parentPosition: CanvasPosition;
}

interface Part {
  id: string;
  text: string;
  start: number;
  end: number;
  children: PhraseNode[];
}

interface PhraseNode {
  id: string;
  phrase: string;
  position: CanvasPosition;
  connection?: Connection;
  parts: Part[];
}

interface CanvasData {
  rootPhrase: PhraseNode;
}

interface CanvasProps {
  data: CanvasData;
  debugMode: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ data, debugMode }) => {
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderConnections = (node: PhraseNode): React.ReactElement[] => {
    const connections: React.ReactElement[] = [];
    
    node.parts.forEach(part => {
      part.children.forEach(child => {
        if (expandedNodes.has(child.id) && child.connection) {
          connections.push(
            <line
              key={`connection-${child.id}`}
              x1={node.position.x}
              y1={node.position.y}
              x2={child.position.x}
              y2={child.position.y}
              stroke="#4682b4"
              strokeWidth="2"
              opacity="0.6"
            />
          );
          connections.push(...renderConnections(child));
        }
      });
    });

    return connections;
  };

  const renderPhraseNode = (node: PhraseNode): React.ReactElement => {
    const renderPhrase = () => {
      const { phrase, parts } = node;
      let renderedText = [];
      let currentIndex = 0;

      parts.forEach((part, partIndex) => {
        if (part.start > currentIndex) {
          renderedText.push(
            <tspan key={`text-${currentIndex}`}>
              {phrase.slice(currentIndex, part.start)}
            </tspan>
          );
        }

        renderedText.push(
          <tspan
            key={`part-${partIndex}`}
            className="highlightable-part-svg"
            onClick={() => {
              part.children.forEach(child => {
                toggleNodeExpansion(child.id);
              });
            }}
          >
            {part.text}
          </tspan>
        );

        currentIndex = part.end;
      });

      if (currentIndex < phrase.length) {
        renderedText.push(
          <tspan key={`text-${currentIndex}`}>
            {phrase.slice(currentIndex)}
          </tspan>
        );
      }

      return renderedText;
    };


    return (
      <g key={node.id}>
        <text
          x={node.position.x}
          y={node.position.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="phrase-text-svg"
        >
          {renderPhrase()}
        </text>
        
        {node.parts.map(part =>
          part.children.filter(child => expandedNodes.has(child.id)).map(child =>
            renderPhraseNode(child)
          )
        )}
      </g>
    );
  };

  const renderDebugGrid = () => {
    if (!debugMode) return null;

    const gridElements = [];
    const gridSize = 100;
    const gridRange = 2000; // Show grid from -2000 to +2000

    // Grid lines
    for (let i = -gridRange; i <= gridRange; i += gridSize) {
      // Vertical lines
      gridElements.push(
        <line
          key={`v-${i}`}
          x1={i}
          y1={-gridRange}
          x2={i}
          y2={gridRange}
          stroke={i === 0 ? "black" : "#cccccc"}
          strokeWidth={i === 0 ? "2" : "1"}
        />
      );
      
      // Horizontal lines
      gridElements.push(
        <line
          key={`h-${i}`}
          x1={-gridRange}
          y1={i}
          x2={gridRange}
          y2={i}
          stroke={i === 0 ? "black" : "#cccccc"}
          strokeWidth={i === 0 ? "2" : "1"}
        />
      );
    }

    // Coordinate labels
    for (let i = -gridRange; i <= gridRange; i += gridSize) {
      if (i !== 0) {
        // X-axis labels
        gridElements.push(
          <text
            key={`x-label-${i}`}
            x={i}
            y={15}
            textAnchor="middle"
            fontSize="12"
            fill="black"
            fontFamily="Courier New, monospace"
          >
            {i}
          </text>
        );

        // Y-axis labels
        gridElements.push(
          <text
            key={`y-label-${i}`}
            x={-15}
            y={i}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="black"
            fontFamily="Courier New, monospace"
          >
            {-i}
          </text>
        );
      }
    }

    // Origin label
    gridElements.push(
      <text
        key="origin"
        x={-15}
        y={15}
        textAnchor="middle"
        fontSize="12"
        fill="black"
        fontFamily="Courier New, monospace"
        fontWeight="bold"
      >
        0,0
      </text>
    );

    return gridElements;
  };

  return (
    <div 
      className="canvas-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        width="100vw"
        height="100vh"
        viewBox={`${-window.innerWidth/2 - viewOffset.x} ${-window.innerHeight/2 - viewOffset.y} ${window.innerWidth} ${window.innerHeight}`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f0f0f0" strokeWidth="1" opacity="0.3"/>
          </pattern>
        </defs>
        
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />
        
        {renderDebugGrid()}
        {renderConnections(data.rootPhrase)}
        {renderPhraseNode(data.rootPhrase)}
      </svg>
    </div>
  );
};

export default Canvas;
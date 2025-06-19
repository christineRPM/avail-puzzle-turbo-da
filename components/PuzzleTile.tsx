'use client';

import React from 'react';
import { Tile, Position } from '@/types/puzzle';

interface PuzzleTileProps {
  tile: Tile;
  size: number;
  imageUrl: string;
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  isComplete: boolean;
  isDragging?: boolean;
  isSliding?: boolean;
  isMovable?: boolean;
  dragPosition?: { x: number; y: number } | null;
  originalPosition?: { x: number; y: number } | null;
}

const PuzzleTile: React.FC<PuzzleTileProps> = ({ 
  tile, 
  size, 
  imageUrl, 
  onClick, 
  onMouseDown,
  isComplete, 
  isDragging = false,
  isSliding = false,
  isMovable = false,
  dragPosition = null,
  originalPosition = null
}) => {
  const calculateBackgroundPosition = (position: Position): string => {
    const tileSize = 100 / size;
    const x = position.col * tileSize;
    const y = position.row * tileSize;
    return `${x}% ${y}%`;
  };

  const isInCorrectPosition = 
    tile.currentPosition.row === tile.correctPosition.row && 
    tile.currentPosition.col === tile.correctPosition.col;

  const getTileStyle = () => {
    const baseStyle = {
      width: '76px',
      height: '76px',
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${size * 100}%`,
      backgroundPosition: calculateBackgroundPosition(tile.correctPosition),
    };

    if (isDragging && dragPosition) {
      return {
        ...baseStyle,
        position: 'absolute' as const,
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        zIndex: 1000,
        transform: 'scale(1.05)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        transition: 'none',
      };
    }

    if (isSliding) {
      return {
        ...baseStyle,
        transition: 'all 0.3s ease-out',
      };
    }

    return baseStyle;
  };

  return (
    <div
      className={`
        relative rounded-md overflow-hidden
        ${isComplete ? 'opacity-100' : ''}
        ${isInCorrectPosition ? 'ring-[1px] ring-[#5FD39C]/70' : 'ring-[0.5px] ring-white/20'}
        ${isMovable && !isDragging ? 'shadow-lg z-10 cursor-grab hover:scale-105' : 'opacity-90 cursor-not-allowed'}
        ${isDragging ? 'cursor-grabbing' : ''}
        ${isSliding ? 'transition-all duration-300 ease-out' : ''}
      `}
      style={getTileStyle()}
      onClick={isMovable ? onClick : undefined}
      onMouseDown={isMovable ? onMouseDown : undefined}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-white/10 rounded-md flex items-center justify-center">
          <div className="text-white/60 text-xs font-semibold">Dragging</div>
        </div>
      )}

      {!isMovable && !isDragging && (
        <div className="absolute inset-0 bg-black/5 rounded-md" />
      )}
    </div>
  );
};

export default PuzzleTile; 
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tile, Position, GameState, PuzzleSize } from '@/types/puzzle';
import PuzzleTile from '@/components/PuzzleTile';
import PuzzleControls from '@/components/PuzzleControls';
import { shuffleTiles, isPuzzleComplete, getAdjacentPositions } from '@/utils/puzzleUtils';

interface SlidingPuzzleProps {
  size: PuzzleSize;
  imageUrl: string;
  onBackToMenu: () => void;
}

const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ size, imageUrl, onBackToMenu }) => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: [],
    size,
    isComplete: false,
    moves: 0,
    isShuffled: false,
  });

  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [draggedTile, setDraggedTile] = useState<Tile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [slidingTiles, setSlidingTiles] = useState<Set<number>>(new Set());
  const [movableTiles, setMovableTiles] = useState<Set<number>>(new Set());
  const [emptyPosition, setEmptyPosition] = useState<Position>({ row: size - 1, col: size - 1 });
  const boardRef = useRef<HTMLDivElement>(null);

  const createSolvedTiles = useCallback((): Tile[] => {
    const tiles: Tile[] = [];
    const totalTiles = size * size - 1;
    for (let i = 0; i < totalTiles; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      tiles.push({
        id: i,
        currentPosition: { row, col },
        correctPosition: { row, col }
      });
    }
    return tiles;
  }, [size]);

  const initializePuzzle = useCallback(() => {
    const tiles = createSolvedTiles();
    setGameState({
      tiles,
      size,
      isComplete: false,
      moves: 0,
      isShuffled: false,
    });
    setEmptyPosition({ row: size - 1, col: size - 1 });
    setStartTime(null);
    setCurrentTime(0);
    setDraggedTile(null);
    setIsDragging(false);
    setSlidingTiles(new Set());
    setMovableTiles(new Set());
  }, [size, createSolvedTiles]);

  const updateMovableTiles = useCallback(() => {
    const adjacentPositions = getAdjacentPositions(emptyPosition, size);
    const movable = new Set<number>();

    gameState.tiles.forEach(tile => {
      const isAdjacent = adjacentPositions.some(
        pos => pos.row === tile.currentPosition.row && pos.col === tile.currentPosition.col
      );
      if (isAdjacent) {
        movable.add(tile.id);
      }
    });

    setMovableTiles(movable);
  }, [gameState.tiles, emptyPosition, size]);

  // Initialize puzzle
  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !gameState.isComplete) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameState.isComplete]);

  // Update movable tiles whenever the game state changes
  useEffect(() => {
    updateMovableTiles();
  }, [updateMovableTiles]);

  const shufflePuzzle = useCallback(() => {
    const initialEmpty = { row: size - 1, col: size - 1 };
    const solvedTiles = createSolvedTiles();
    const { tiles: shuffledTiles, emptyPosition: shuffledEmpty } = shuffleTiles(
      solvedTiles,
      size,
      initialEmpty
    );
    setGameState(prev => ({
      ...prev,
      tiles: shuffledTiles,
      moves: 0,
      isComplete: false,
      isShuffled: true,
    }));
    setEmptyPosition(shuffledEmpty);
    setStartTime(Date.now());
  }, [size, createSolvedTiles]);

  const animateSlide = useCallback((tile: Tile) => {
    setSlidingTiles(prev => new Set([...prev, tile.id]));
    
    setTimeout(() => {
      setSlidingTiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(tile.id);
        return newSet;
      });
    }, 300); // Animation duration
  }, []);

  const moveTile = useCallback((tile: Tile) => {
    if (gameState.isComplete) return;

    const adjacentPositions = getAdjacentPositions(emptyPosition, size);
    const isAdjacent = adjacentPositions.some(
      (pos: Position) => pos.row === tile.currentPosition.row && pos.col === tile.currentPosition.col
    );

    if (!isAdjacent) return;

    // Animate the slide
    animateSlide(tile);

    // Update the game state with the new tile positions
    setGameState(prev => {
      const updatedTiles = prev.tiles.map(t => {
        if (t.id === tile.id) {
          return { ...t, currentPosition: emptyPosition };
        }
        return t;
      });

      const isComplete = isPuzzleComplete(updatedTiles);
      
      return {
        ...prev,
        tiles: updatedTiles,
        moves: prev.moves + 1,
        isComplete,
      };
    });

    // Update empty position
    setEmptyPosition(tile.currentPosition);
  }, [gameState.isComplete, emptyPosition, size, animateSlide]);

  const handleMouseDown = useCallback((e: React.MouseEvent, tile: Tile) => {
    if (gameState.isComplete) return;

    // Only allow dragging if the tile is movable (adjacent to empty space)
    if (!movableTiles.has(tile.id)) return;

    setIsDragging(true);
    setDraggedTile(tile);
    
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const tileSize = 80; // Size of each tile
    const originalX = tile.currentPosition.col * tileSize;
    const originalY = tile.currentPosition.row * tileSize;
    
    setDragPosition({ x: originalX, y: originalY });
  }, [gameState.isComplete, movableTiles]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedTile) return;

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const tileSize = 80; // Size of each tile
    const mouseX = e.clientX - boardRect.left;
    const mouseY = e.clientY - boardRect.top;

    // Calculate the drag position relative to the original position
    const newX = mouseX - tileSize / 2;
    const newY = mouseY - tileSize / 2;

    setDragPosition({ x: newX, y: newY });
  }, [isDragging, draggedTile]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !draggedTile) return;

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const tileSize = 80; // Size of each tile
    const emptyX = emptyPosition.col * tileSize;
    const emptyY = emptyPosition.row * tileSize;

    // Check if the dragged tile is close enough to the empty space
    const distanceX = Math.abs(dragPosition.x - emptyX);
    const distanceY = Math.abs(dragPosition.y - emptyY);
    const threshold = tileSize * 0.6; // 60% of tile size for easier snapping

    if (distanceX < threshold && distanceY < threshold) {
      // Trigger the slide - this will update the game state
      moveTile(draggedTile);
    }

    // Always reset drag state
    setIsDragging(false);
    setDraggedTile(null);
    setDragPosition({ x: 0, y: 0 });
  }, [isDragging, draggedTile, emptyPosition, dragPosition, moveTile]);

  const resetPuzzle = useCallback(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-[40px] font-bold text-white">Avail Sliding Puzzle</h1>
        <p className="text-lg text-white/40">Slide the tiles to recreate the Avail logo</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <button
            onClick={onBackToMenu}
            className="bg-white/10 text-white/80 px-6 py-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">←</span>
            <span>Back to Menu</span>
          </button>
        </div>
        
        <PuzzleControls
          onShuffle={shufflePuzzle}
          onReset={resetPuzzle}
          moves={gameState.moves}
          time={formatTime(currentTime)}
          isComplete={gameState.isComplete}
          isShuffled={gameState.isShuffled}
        />
      </div>

      <div 
        ref={boardRef}
        className="grid gap-1 bg-white/5 p-2 rounded-lg relative overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          width: `${size * 80 + 10}px`,
          height: `${size * 80 + 10}px`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {Array.from({ length: size }).map((_, row) =>
          Array.from({ length: size }).map((_, col) => {
            if (emptyPosition.row === row && emptyPosition.col === col) {
              return (
                <div
                  key={`empty-${row}-${col}`}
                  className={`border-2 border-dashed rounded-md flex items-center justify-center ${
                    isDragging ? 'border-white/30 bg-white/5' : 'border-white/20 bg-white/5'
                  }`}
                  style={{ width: '76px', height: '76px' }}
                >
                  <span className={`text-sm ${isDragging ? 'text-white/60' : 'text-white/40'}`}>
                    {isDragging ? 'Drop Here' : 'Drop Zone'}
                  </span>
                </div>
              );
            }
            const tile = gameState.tiles.find(
              t => t.currentPosition.row === row && t.currentPosition.col === col
            );
            if (!tile) return null;
            return (
              <PuzzleTile
                key={tile.id}
                tile={tile}
                size={size}
                imageUrl={imageUrl}
                onClick={() => moveTile(tile)}
                onMouseDown={(e) => handleMouseDown(e, tile)}
                isComplete={gameState.isComplete}
                isDragging={false}
                isSliding={slidingTiles.has(tile.id)}
                isMovable={movableTiles.has(tile.id)}
                dragPosition={null}
              />
            );
          })
        )}
        {/* Floating tile follows mouse while dragging */}
        {isDragging && draggedTile && (
          <PuzzleTile
            key={`floating-${draggedTile.id}`}
            tile={draggedTile}
            size={size}
            imageUrl={imageUrl}
            onClick={() => {}}
            isComplete={gameState.isComplete}
            isDragging={true}
            isSliding={false}
            isMovable={true}
            dragPosition={dragPosition}
          />
        )}
      </div>

      {gameState.isComplete && (
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <h2 className="text-xl font-bold text-white/80 mb-2">🎉 Puzzle Complete!</h2>
          <p className="text-white/60">
            You solved it in {gameState.moves} moves and {formatTime(currentTime)}!
          </p>
        </div>
      )}
    </div>
  );
};

export default SlidingPuzzle; 
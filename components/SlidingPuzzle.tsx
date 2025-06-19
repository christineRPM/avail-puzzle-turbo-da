'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tile, Position, GameState, PuzzleSize } from '@/types/puzzle';
import PuzzleTile from '@/components/PuzzleTile';
import PuzzleControls from '@/components/PuzzleControls';
import { shuffleTiles, isPuzzleComplete, getAdjacentPositions } from '@/utils/puzzleUtils';
import { submitRawData } from '@/utils/turboDA';

interface SlidingPuzzleProps {
  size: PuzzleSize;
  imageUrl: string;
  onSizeChange: (size: PuzzleSize) => void;
}

interface TurboDALogEntry {
  id: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'finalized' | 'error';
  color: string;
  submissionId?: string;
  responseTime?: number;
}

interface RateLimitError extends Error {
  isRateLimit: boolean;
  retryAfter: number;
}

const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ size, imageUrl, onSizeChange }) => {
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
  const [turboDALogs, setTurboDALogs] = useState<TurboDALogEntry[]>([]);
  const [tileSize, setTileSize] = useState(76);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateTileSize = () => {
      if (boardRef.current) {
        const boardContainer = boardRef.current;
        const computedStyle = getComputedStyle(boardContainer);
        const containerWidth = boardContainer.offsetWidth;
        const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        
        // Tailwind's `gap-1` is 0.25rem (4px if 1rem=16px) by default
        const gap = 4;
        
        const contentWidth = containerWidth - paddingX;
        const totalGapWidth = (size - 1) * gap;
        const newTileSize = (contentWidth - totalGapWidth) / size;
        
        setTileSize(newTileSize);
      }
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateTileSize, 100);
    };

    calculateTileSize();
    window.addEventListener('resize', debouncedHandler);

    return () => {
      window.removeEventListener('resize', debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [size]);

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

  const shufflePuzzle = useCallback(async () => {
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

    // Submit game start data to Turbo DA
    try {
      const startTime = Date.now();
      const gameStartData = {
        action: 'game_started',
        puzzleSize: size,
        timestamp: new Date().toISOString(),
        gameType: 'avail-sliding-puzzle',
        message: `Started ${size}×${size} puzzle game`
      };

      // Add log entry for data submission
      const sendLogId = `send-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setTurboDALogs(prev => [...prev, {
        id: sendLogId,
        message: `Data sent to Turbo DA: ${gameStartData.message}`,
        timestamp: new Date(),
        status: 'pending',
        color: '#44D5DE'
      }]);

      const submission = await submitRawData(JSON.stringify(gameStartData));
      const responseTime = Date.now() - startTime;

      // Add separate log entry for response
      const responseLogId = `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setTurboDALogs(prev => [...prev, {
        id: responseLogId,
        message: `Response received: Submission ID ${submission.submission_id} (${responseTime}ms)`,
        timestamp: new Date(),
        status: 'finalized',
        color: '#5FD39C',
        submissionId: submission.submission_id,
        responseTime
      }]);

    } catch (error) {
      console.error('Error submitting to Turbo DA:', error);
      
      // Check if it's a rate limit error
      if (error instanceof Error && (error as RateLimitError).isRateLimit) {
        const rateLimitError = error as RateLimitError;
        const retryAfter = rateLimitError.retryAfter || 60;
        setTurboDALogs(prev => [...prev, {
          id: `rate-limit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: `Rate limit hit - try again in ${retryAfter} seconds`,
          timestamp: new Date(),
          status: 'pending',
          color: '#EDC7FC'
        }]);
      } else {
        setTurboDALogs(prev => [...prev, {
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: `Error: Failed to submit to Turbo DA`,
          timestamp: new Date(),
          status: 'error',
          color: '#ff6b6b'
        }]);
      }
    }
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

  // Prevent default touch behavior to stop scrolling
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    // Add the event listener with passive: false to allow preventDefault
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isDragging]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, tile: Tile) => {
    if (gameState.isComplete) return;
    if (!movableTiles.has(tile.id)) return;

    // Prevent default behavior
    e.preventDefault();

    setIsDragging(true);
    setDraggedTile(tile);
    
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    // Use dynamic tile size
    const originalX = tile.currentPosition.col * (tileSize + 4); // Add gap
    const originalY = tile.currentPosition.row * (tileSize + 4); // Add gap
    
    setDragPosition({ x: originalX, y: originalY });
  }, [gameState.isComplete, movableTiles, tileSize]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggedTile || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    
    // Get coordinates based on event type
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate new position
    const mouseX = clientX - boardRect.left;
    const mouseY = clientY - boardRect.top;

    const newX = Math.max(0, Math.min(mouseX - tileSize / 2, boardRect.width - tileSize));
    const newY = Math.max(0, Math.min(mouseY - tileSize / 2, boardRect.height - tileSize));

    setDragPosition({ x: newX, y: newY });
  }, [isDragging, draggedTile, tileSize]);

  const handleDragEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggedTile || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    
    // Use dynamic tile size
    const gap = 4; // gap-1
    const emptyX = emptyPosition.col * (tileSize + gap);
    const emptyY = emptyPosition.row * (tileSize + gap);

    // Check if the dragged tile is close enough to the empty space
    const distanceX = Math.abs(dragPosition.x - emptyX);
    const distanceY = Math.abs(dragPosition.y - emptyY);
    const threshold = tileSize * 0.6; // 60% of tile size for easier snapping

    if (distanceX < threshold && distanceY < threshold) {
      moveTile(draggedTile);
    }

    // Reset drag state
    setIsDragging(false);
    setDraggedTile(null);
    setDragPosition({ x: 0, y: 0 });
  }, [isDragging, draggedTile, emptyPosition, dragPosition, moveTile, tileSize]);

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
          <div className="flex gap-3 justify-center">
            <button
              onClick={shufflePuzzle}
              disabled={gameState.isComplete}
              className={`
                cursor-pointer rounded-full text-md font-semibold text-white pt-px shadow-primary-button 
                bg-[linear-gradient(90deg,#3ca3fc_3.81%,#2677c8_92.61%)] px-6 py-2 hover:opacity-90
                disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2
              `}
            >
              <span className="text-lg">🎮</span>
              <span className="hidden md:inline">{gameState.isShuffled ? 'Shuffle Again' : 'Start Game'}</span>
              <span className="md:hidden">{gameState.isShuffled ? 'Shuffle' : 'Start'}</span>
            </button>
            
            <button
              onClick={resetPuzzle}
              className="bg-white/10 text-white/80 px-6 py-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">🔄</span>
              <span className="hidden md:inline">Reset Puzzle</span>
              <span className="md:hidden">Reset</span>
            </button>
          </div>
        </div>
        
        <PuzzleControls
          moves={gameState.moves}
          time={formatTime(currentTime)}
          isComplete={gameState.isComplete}
          isShuffled={gameState.isShuffled}
          selectedSize={size}
          onSizeChange={onSizeChange}
          turboDALogs={turboDALogs}
        />
      </div>

      <div 
        ref={boardRef}
        className="grid gap-1 bg-white/5 p-2 rounded-lg relative overflow-hidden w-full max-w-lg aspect-square touch-none"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
        }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
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
                  style={{ width: `${tileSize}px`, height: `${tileSize}px` }}
                >
                  <span className={`text-[10px] md:text-sm ${isDragging ? 'text-white/60' : 'text-white/40'}`}>
                    {isDragging ? (
                      <>
                        <span className="hidden md:inline">Drop Here</span>
                        <span className="md:hidden">Drop</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden md:inline">Drop Zone</span>
                        <span className="md:hidden">•••</span>
                      </>
                    )}
                  </span>
                </div>
              );
            }
            const tile = gameState.tiles.find(
              t => t.currentPosition.row === row && t.currentPosition.col === col
            );
            if (!tile) return null;

            const isSourceOfDrag = isDragging && draggedTile?.id === tile.id;

            return (
              <PuzzleTile
                key={tile.id}
                tile={tile}
                size={size}
                tileSize={tileSize}
                imageUrl={imageUrl}
                onClick={() => moveTile(tile)}
                onMouseDown={(e) => handleDragStart(e, tile)}
                onTouchStart={(e) => handleDragStart(e, tile)}
                isComplete={gameState.isComplete}
                isDragging={false}
                isSliding={slidingTiles.has(tile.id)}
                isMovable={movableTiles.has(tile.id)}
                dragPosition={null}
                isSourceOfDrag={isSourceOfDrag}
              />
            );
          })
        )}
        {isDragging && draggedTile && (
          <PuzzleTile
            key={`floating-${draggedTile.id}`}
            tile={draggedTile}
            size={size}
            tileSize={tileSize}
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
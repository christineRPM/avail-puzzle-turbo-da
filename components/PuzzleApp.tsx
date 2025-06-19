'use client';

import React, { useState } from 'react';
import { PuzzleSize } from '@/types/puzzle';
import SlidingPuzzle from '@/components/SlidingPuzzle';

const PuzzleApp: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<PuzzleSize>(3);
  const [gameStarted, setGameStarted] = useState(false);

  const puzzleSizes: PuzzleSize[] = [3, 4, 5, 6];

  const handleSizeSelect = (size: PuzzleSize) => {
    setSelectedSize(size);
    setGameStarted(false);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {!gameStarted ? (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">Avail Sliding Puzzle</h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Challenge yourself with this sliding tile puzzle featuring the Avail logo. 
                Choose your difficulty level and slide the tiles to recreate the complete image.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-6">Select Puzzle Size</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {puzzleSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`
                      p-6 rounded-lg border-2 transition-all duration-200 font-semibold
                      ${selectedSize === size
                        ? 'border-brand-blue-500 bg-brand-blue-500/20 text-white shadow-md'
                        : 'border-gray-500/50 bg-white/5 text-gray-300 hover:border-gray-400 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="text-2xl font-bold mb-2">{size}×{size}</div>
                    <div className="text-sm">
                      {size === 3 && 'Easy'}
                      {size === 4 && 'Medium'}
                      {size === 5 && 'Hard'}
                      {size === 6 && 'Expert'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="bg-brand-blue-500/10 rounded-lg p-4">
                  <h3 className="font-semibold text-brand-blue-300 mb-2">How to Play:</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Click &quot;Start Game&quot; to shuffle the puzzle</li>
                    <li>• Click or drag tiles adjacent to the empty space to move them</li>
                    <li>• Arrange all tiles to recreate the Avail logo</li>
                    <li>• Try to complete it in as few moves as possible!</li>
                  </ul>
                </div>

                <button
                  onClick={startGame}
                  className="cursor-pointer rounded-full text-md font-semibold text-white pt-px shadow-primary-button bg-[linear-gradient(90deg,#3ca3fc_3.81%,#2677c8_92.61%)] w-[137px] h-10 hover:opacity-90"
                >
                  Start {selectedSize}×{selectedSize} Puzzle
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <SlidingPuzzle 
              size={selectedSize} 
              imageUrl="/avail-logo.svg" 
              onBackToMenu={resetGame}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleApp; 
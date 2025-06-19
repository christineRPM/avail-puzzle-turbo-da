'use client';

import React from 'react';

interface PuzzleControlsProps {
  onShuffle: () => void;
  onReset: () => void;
  moves: number;
  time: string;
  isComplete: boolean;
  isShuffled: boolean;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  onShuffle,
  onReset,
  moves,
  time,
  isComplete,
  isShuffled,
}) => {
  return (
    <div className="flex items-center justify-between gap-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl w-full max-w-md">
      <div className="flex gap-8">
        <div className="text-center">
          <p className="text-white/60 mb-1">Moves</p>
          <p className="text-[32px] font-bold text-[#3CA3FC]">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 mb-1">Time</p>
          <p className="text-[32px] font-mono text-[#5FD39C] tabular-nums">{time}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onShuffle}
          disabled={isComplete}
          className={`
            cursor-pointer rounded-full text-md font-semibold text-white pt-px shadow-primary-button 
            bg-[linear-gradient(90deg,#3ca3fc_3.81%,#2677c8_92.61%)] w-[137px] h-10 hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isShuffled ? 'Shuffle Again' : 'Start Game'}
        </button>
        
        <button
          onClick={onReset}
          className="bg-[#6B7280] text-white rounded-full w-[137px] h-10 font-semibold hover:opacity-90"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PuzzleControls; 
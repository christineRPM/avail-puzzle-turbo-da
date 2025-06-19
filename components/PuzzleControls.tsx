'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PuzzleSize } from '@/types/puzzle';

interface TurboDALogEntry {
  id: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'finalized' | 'error';
  color: string;
  submissionId?: string;
  responseTime?: number;
}

interface PuzzleControlsProps {
  moves: number;
  time: string;
  isComplete: boolean;
  isShuffled: boolean;
  selectedSize: PuzzleSize;
  onSizeChange: (size: PuzzleSize) => void;
  turboDALogs: TurboDALogEntry[];
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  moves,
  time,
  isComplete,
  isShuffled,
  selectedSize,
  onSizeChange,
  turboDALogs,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileIsOpen, setMobileIsOpen] = useState(true);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  const puzzleSizes: PuzzleSize[] = [3, 4, 5, 6];

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    currentY.current = e.touches[0].clientY;
    
    const diff = currentY.current - startY.current;
    
    if ((diff > 0 && mobileIsOpen) || (diff < 0 && !mobileIsOpen)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (startY.current === null || currentY.current === null) return;
    
    const diff = currentY.current - startY.current;
    const threshold = 50;
    
    if (diff < -threshold && !mobileIsOpen) {
      setMobileIsOpen(true);
    }
    
    if (diff > threshold && mobileIsOpen) {
      setMobileIsOpen(false);
    }
    
    startY.current = null;
    currentY.current = null;
  };

  // Add event listener to collapse mobile dashboard when clicking outside
  useEffect(() => {
    const handleCanvasClick = (e: MouseEvent) => {
      if (mobileSheetRef.current && !mobileSheetRef.current.contains(e.target as Node)) {
        setMobileIsOpen(false);
      }
    };

    document.addEventListener('click', handleCanvasClick);
    return () => {
      document.removeEventListener('click', handleCanvasClick);
    };
  }, []);

  return (
    <>
      {/* Desktop Dashboard Panel */}
      <div 
        className={`hidden md:block fixed top-0 left-0 h-full z-20 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-[-280px]'
        }`}
      >
        {/* Visible Edge When Collapsed */}
        <div className="absolute right-0 top-0 h-full w-[20px] bg-gray-900/90 backdrop-blur-md border-r border-gray-800" />
        
        <div className="h-full w-[320px] bg-gray-900/90 backdrop-blur-md border-r border-gray-800">
          <div className="p-0 overflow-y-auto flex flex-col h-full">
            {/* Dashboard Header */}
            <div className={`flex items-center justify-between ${isOpen ? 'p-6' : 'p-0'}`}>
              <div className="flex-1 mr-4">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Dashboard
                </h2>
                <p className="text-gray-400 text-sm">
                  Game Statistics & Controls
                </p>
              </div>
              <button
                className={`bg-gray-900/90 backdrop-blur-md hover:bg-gray-800/90 p-2 rounded-lg ${isOpen ? 'border border-gray-800' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>

            <div className="border-t border-gray-800" />

            {/* Game Stats Section */}
            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Moves</p>
                  <p className="text-2xl font-semibold text-[#3CA3FC]">
                    {moves}
                  </p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="text-2xl font-mono font-semibold text-[#5FD39C] tabular-nums">
                    {time}
                  </p>
                </div>
              </div>

              {/* Game Status */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">Game Status</p>
                <p className="text-lg font-semibold text-white mb-3">
                  {isComplete ? '🎉 Complete!' : isShuffled ? 'In Progress' : 'Ready to Start'}
                </p>
                
                {/* Turbo DA Transaction Log */}
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-sm text-gray-400 mb-2">Turbo DA Log</p>
                  <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
                    {turboDALogs.length === 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#44D5DE] rounded-full"></div>
                          <span className="text-gray-300">Transaction pending...</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#5FD39C] rounded-full"></div>
                          <span className="text-gray-300">Block confirmed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#EDC7FC] rounded-full"></div>
                          <span className="text-gray-300">Data availability verified</span>
                        </div>
                      </div>
                    ) : (
                      [...turboDALogs].reverse().map((log) => (
                        <div key={log.id} className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: log.color }}
                          ></div>
                          <span className="text-gray-300">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-sm text-white">{isComplete ? '100%' : '0%'}</p>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#44D5DE] to-[#3CA3FC] transition-all duration-300" 
                    style={{ width: isComplete ? '100%' : '0%' }}
                  />
                </div>
              </div>

              {/* Puzzle Size Selection */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Puzzle Size</h3>
                <div className="grid grid-cols-2 gap-2">
                  {puzzleSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => onSizeChange(size)}
                      disabled={isShuffled && !isComplete}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200 font-semibold text-sm
                        ${selectedSize === size
                          ? 'border-[#3CA3FC] bg-[#3CA3FC]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                        }
                        ${isShuffled && !isComplete ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="text-lg font-bold">{size}×{size}</div>
                      <div className="text-xs">
                        {size === 3 && 'Easy'}
                        {size === 4 && 'Medium'}
                        {size === 5 && 'Hard'}
                        {size === 6 && 'Expert'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Dashboard */}
      <div 
        ref={mobileSheetRef}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out touch-none ${
          mobileIsOpen ? 'translate-y-0' : 'translate-y-[calc(100%-55px)]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="rounded-t-xl bg-gray-900/90 backdrop-blur-md border-t border-x border-gray-800 max-h-[80vh] overflow-hidden">
          {/* Drag Handle */}
          <div 
            className="h-8 flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setMobileIsOpen(!mobileIsOpen);
            }}
          >
            <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
            {/* Mobile Avail Tag */}
            <div className="absolute top-2 right-3 px-2 py-1 rounded-full bg-gray-900/70 backdrop-blur-sm">
              <span className="text-xs font-medium bg-gradient-to-r from-[#44D5DE] to-[#EDC7FC] text-transparent bg-clip-text">
                Built by Avail
              </span>
            </div>
          </div>
          
          {/* Mobile Dashboard Header */}
          <div className="px-4 pb-2 text-center relative">
            <div>
              <p className="text-gray-400 text-xs mb-1">
                Game Statistics & Controls
              </p>
              <h2 className="text-lg font-semibold text-white">
                Avail Puzzle Dashboard
              </h2>
            </div>
          </div>

          <div className="border-t border-gray-800" />
          
          {/* Mobile Dashboard Content */}
          <div className="overflow-y-auto p-0">
            <div className="px-4 py-3 space-y-3 bg-gray-800/20">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-xs text-gray-400">Moves</p>
                  <p className="text-base font-semibold text-[#3CA3FC]">
                    {moves}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-base font-mono font-semibold text-[#5FD39C] tabular-nums">
                    {time}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-base font-semibold text-white">
                    {isComplete ? 'Complete!' : isShuffled ? 'In Progress' : 'Ready'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-base font-semibold text-white">
                    {isComplete ? '100%' : '0%'}
                  </p>
                </div>
              </div>

              {/* Mobile Game Status with Turbo DA Log */}
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-white">Game Status</h3>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-sm font-semibold text-white mb-2">
                    {isComplete ? '🎉 Complete!' : isShuffled ? 'In Progress' : 'Ready'}
                  </p>
                  
                  {/* Mobile Turbo DA Log */}
                  <div className="border-t border-gray-700 pt-2">
                    <p className="text-xs text-gray-400 mb-1">Turbo DA Log</p>
                    <div className="space-y-1 text-xs max-h-24 overflow-y-auto">
                      {turboDALogs.length === 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#44D5DE] rounded-full"></div>
                            <span className="text-gray-300 text-xs">Transaction pending...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#5FD39C] rounded-full"></div>
                            <span className="text-gray-300 text-xs">Block confirmed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#EDC7FC] rounded-full"></div>
                            <span className="text-gray-300 text-xs">Data availability verified</span>
                          </div>
                        </div>
                      ) : (
                        [...turboDALogs].reverse().map((log) => (
                          <div key={log.id} className="flex items-center gap-2">
                            <div 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: log.color }}
                            ></div>
                            <span className="text-gray-300 text-xs">{log.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Puzzle Size Selection */}
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-white">Puzzle Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {puzzleSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => onSizeChange(size)}
                      disabled={isShuffled && !isComplete}
                      className={`
                        p-2 rounded-lg border-2 transition-all duration-200 font-semibold text-xs
                        ${selectedSize === size
                          ? 'border-[#3CA3FC] bg-[#3CA3FC]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                        }
                        ${isShuffled && !isComplete ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PuzzleControls; 
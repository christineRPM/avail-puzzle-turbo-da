'use client';

import React, { useState, useEffect } from 'react';
import { PuzzleSize } from '@/types/puzzle';
import SlidingPuzzle from '@/components/SlidingPuzzle';
import { getRandomPuzzleImage } from '@/utils/puzzleImages';

export default function Home() {
  const [selectedSize, setSelectedSize] = useState<PuzzleSize>(3);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Set a random image when the component mounts
  useEffect(() => {
    setSelectedImage(getRandomPuzzleImage());
  }, []);

  const handleSizeChange = (size: PuzzleSize) => {
    setSelectedSize(size);
  };

  // Don't render until we have an image
  if (!selectedImage) {
    return (
      <main className="min-h-screen bg-[linear-gradient(89deg,#091b2b_22.12%,#100c14_99.08%)] py-8">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading puzzle...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(89deg,#091b2b_22.12%,#100c14_99.08%)] py-8">
      <SlidingPuzzle 
        size={selectedSize} 
        imageUrl={selectedImage}
        onSizeChange={handleSizeChange}
      />
    </main>
  );
}
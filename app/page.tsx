'use client';

import React, { useState } from 'react';
import { PuzzleSize } from '@/types/puzzle';
import SlidingPuzzle from '@/components/SlidingPuzzle';

export default function Home() {
  const [selectedSize, setSelectedSize] = useState<PuzzleSize>(3);

  const handleSizeChange = (size: PuzzleSize) => {
    setSelectedSize(size);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(89deg,#091b2b_22.12%,#100c14_99.08%)] py-8">
      <SlidingPuzzle 
        size={selectedSize} 
        imageUrl="/avail-logo.svg" 
        onSizeChange={handleSizeChange}
      />
    </main>
  );
}
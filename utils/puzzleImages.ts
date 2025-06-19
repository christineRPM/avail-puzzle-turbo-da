// List of available puzzle images
export const PUZZLE_IMAGES = [
  '/puzzle-images/avail-logo.svg',
  // Add more images here as they become available
  // '/puzzle-images/image2.svg',
  // '/puzzle-images/image3.svg',
];

/**
 * Get a random puzzle image from the available options
 */
export function getRandomPuzzleImage(): string {
  const randomIndex = Math.floor(Math.random() * PUZZLE_IMAGES.length);
  return PUZZLE_IMAGES[randomIndex];
}

/**
 * Get all available puzzle images
 */
export function getAllPuzzleImages(): string[] {
  return [...PUZZLE_IMAGES];
}

/**
 * Get the number of available puzzle images
 */
export function getPuzzleImageCount(): number {
  return PUZZLE_IMAGES.length;
} 
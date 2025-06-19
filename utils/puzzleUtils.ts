import { Tile, Position } from '@/types/puzzle';

function arePositionsUnique(tiles: Tile[], size: number, emptyPosition: Position): boolean {
  const seen = new Set<string>();
  for (const tile of tiles) {
    const key = `${tile.currentPosition.row},${tile.currentPosition.col}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  // Check that the empty position is not occupied by a tile
  const emptyKey = `${emptyPosition.row},${emptyPosition.col}`;
  return !seen.has(emptyKey) && seen.size === size * size - 1;
}

export const shuffleTiles = (
  tiles: Tile[],
  size: number,
  initialEmptyPosition: Position
): { tiles: Tile[]; emptyPosition: Position } => {
  let shuffled: Tile[];
  let emptyPosition: Position;
  let attempts = 0;
  do {
    shuffled = tiles.map(tile => ({ ...tile, currentPosition: { ...tile.currentPosition } }));
    emptyPosition = { ...initialEmptyPosition };
    const shuffleMoves = size * size * 20;
    for (let i = 0; i < shuffleMoves; i++) {
      const adjacentPositions = getAdjacentPositions(emptyPosition, size);
      const randomAdjacent = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
      const tileToMove = shuffled.find(
        t => t.currentPosition.row === randomAdjacent.row && t.currentPosition.col === randomAdjacent.col
      );
      if (tileToMove) {
        const temp = { ...tileToMove.currentPosition };
        tileToMove.currentPosition = { ...emptyPosition };
        emptyPosition = temp;
      }
    }
    attempts++;
    // If after 10 attempts we still fail, break to avoid infinite loop
    if (attempts > 10) break;
  } while (!arePositionsUnique(shuffled, size, emptyPosition));
  return { tiles: shuffled, emptyPosition };
};

export const isPuzzleComplete = (tiles: Tile[]): boolean => {
  return tiles.every(tile =>
    tile.currentPosition.row === tile.correctPosition.row &&
    tile.currentPosition.col === tile.correctPosition.col
  );
};

export const getAdjacentPositions = (position: Position, size: number): Position[] => {
  const adjacent: Position[] = [];
  const { row, col } = position;

  // Check all four directions
  const directions = [
    { row: row - 1, col }, // Up
    { row: row + 1, col }, // Down
    { row, col: col - 1 }, // Left
    { row, col: col + 1 }, // Right
  ];

  directions.forEach(dir => {
    if (dir.row >= 0 && dir.row < size && dir.col >= 0 && dir.col < size) {
      adjacent.push(dir);
    }
  });

  return adjacent;
};

export const isValidMove = (tile: Tile, emptyPosition: Position): boolean => {
  const { row, col } = tile.currentPosition;
  const { row: emptyRow, col: emptyCol } = emptyPosition;

  // Check if tiles are adjacent (horizontally or vertically)
  return (
    (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
    (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  );
}; 
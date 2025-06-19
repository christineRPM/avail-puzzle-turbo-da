export interface Tile {
  id: number;
  currentPosition: Position;
  correctPosition: Position;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  tiles: Tile[];
  size: number;
  isComplete: boolean;
  moves: number;
  isShuffled: boolean;
}

export type PuzzleSize = 3 | 4 | 5 | 6;

export interface PuzzleConfig {
  size: PuzzleSize;
  imageUrl: string;
}

export interface GameStats {
  moves: number;
  timeElapsed: number;
  isComplete: boolean;
} 
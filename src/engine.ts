// Core types and logic for Nonogram puzzle engine

export enum CellState {
  UNMARKED = 0,
  FILLED = 1,
  EMPTY = 2,
  PENCIL = 3,
}

export type Grid = CellState[][];

export interface NonogramPuzzle {
  id: string;
  size: number;
  rowClues: number[][];
  colClues: number[][];
  solution: Grid;
  difficulty?: string;
  category?: string;
}

// Calculate clues for a given solution grid
export function calculateClues(grid: Grid): { rowClues: number[][]; colClues: number[][] } {
  const size = grid.length;
  const rowClues = grid.map(row => getCluesForLine(row));
  const colClues = Array.from({ length: size }, (_, colIdx) =>
    getCluesForLine(grid.map(row => row[colIdx]))
  );
  return { rowClues, colClues };
}

function getCluesForLine(line: CellState[]): number[] {
  const clues: number[] = [];
  let count = 0;
  for (const cell of line) {
    if (cell === CellState.FILLED) {
      count++;
    } else if (count > 0) {
      clues.push(count);
      count = 0;
    }
  }
  if (count > 0) clues.push(count);
  return clues.length ? clues : [0];
}

// Check if a player's grid matches the solution
export function validateSolution(playerGrid: Grid, solution: Grid): boolean {
  if (playerGrid.length !== solution.length) return false;
  for (let i = 0; i < playerGrid.length; i++) {
    for (let j = 0; j < playerGrid[i].length; j++) {
      if (playerGrid[i][j] === CellState.FILLED && solution[i][j] !== CellState.FILLED) return false;
      if (playerGrid[i][j] !== CellState.FILLED && solution[i][j] === CellState.FILLED) return false;
    }
  }
  return true;
}

// 10x10 pixel art cat (1 = filled, 0 = empty)
export const catGrid: Grid = [
  [0,0,1,1,0,0,0,1,1,0],
  [0,1,1,1,1,0,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,0,1,1,1,1,0,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,1,1,0,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,0,0,0,1,1,0,0],
  [1,1,0,0,0,0,0,1,1,0],
];

// Color map for the cat (same shape as catGrid, null for empty)
export const catColors: (string|null)[][] = [
  [null,null,'#333','#333',null,null,null,'#333','#333',null],
  [null,'#333','#f9c16a','#f9c16a','#333',null,'#333','#f9c16a','#333',null],
  ['#333','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#333'],
  ['#333','#f9c16a',null,'#333','#f9c16a','#f9c16a','#333',null,'#f9c16a','#333'],
  ['#333','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#333'],
  ['#333','#f9c16a','#f9c16a',null,'#333','#333',null,'#f9c16a','#f9c16a','#333'],
  [null,'#333','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#333',null],
  [null,null,'#333','#f9c16a','#f9c16a','#f9c16a','#f9c16a','#333',null,null],
  [null,'#333','#333',null,null,null,'#333','#333',null,null],
  ['#333','#333',null,null,null,null,null,'#333','#333',null],
];

// 10x10 pixel art heart
export const heartGrid: Grid = [
  [0,1,1,0,0,0,0,1,1,0],
  [1,1,1,1,0,0,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
];

export const heartColors: (string|null)[][] = [
  [null,'#e63946','#e63946',null,null,null,null,'#e63946','#e63946',null],
  ['#e63946','#e63946','#e63946','#e63946',null,null,'#e63946','#e63946','#e63946','#e63946'],
  ['#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946'],
  ['#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946'],
  [null,'#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946','#e63946',null],
  [null,null,'#e63946','#e63946','#e63946','#e63946','#e63946','#e63946',null,null],
  [null,null,null,'#e63946','#e63946','#e63946','#e63946',null,null,null],
  [null,null,null,null,'#e63946','#e63946',null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null],
];

// 10x10 pixel art pine tree
export const pineTreeGrid: Grid = [
  [0,0,0,0,1,0,0,0,0,0],
  [0,0,0,1,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0],
];

export const pineTreeColors: (string|null)[][] = [
  [null,null,null,null,'#388e3c',null,null,null,null,null],
  [null,null,null,'#388e3c','#388e3c','#388e3c',null,null,null,null],
  [null,null,'#388e3c','#388e3c','#388e3c','#388e3c','#388e3c',null,null,null],
  [null,'#388e3c','#388e3c','#388e3c','#388e3c','#388e3c','#388e3c','#388e3c',null,null],
  ['#388e3c','#388e3c','#388e3c','#388e3c','#388e3c','#388e3c','#388e3c','#388e3c','#388e3c',null],
  [null,null,null,'#388e3c','#388e3c','#388e3c',null,null,null,null],
  [null,null,null,'#388e3c','#388e3c','#388e3c',null,null,null,null],
  [null,null,null,'#388e3c','#388e3c','#388e3c',null,null,null,null],
  [null,null,null,null,'#8d5524',null,null,null,null,null],
  [null,null,null,null,'#8d5524',null,null,null,null,null],
];

// Puzzle list
export const puzzles = [
  { id: 'cat', name: 'Cat', grid: catGrid, colors: catColors },
  { id: 'heart', name: 'Heart', grid: heartGrid, colors: heartColors },
  { id: 'pinetree', name: 'Pine Tree', grid: pineTreeGrid, colors: pineTreeColors },
]; 
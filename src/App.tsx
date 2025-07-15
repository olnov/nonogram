import React, { useState } from "react";
import {
  CellState,
  calculateClues,
  validateSolution,
  puzzles,
} from "./engine";
import type { Grid } from "./engine";
import "./App.css";

type Tool = "fill" | "x";
const MAX_LIVES = 3;

function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () =>
    Array(size).fill(CellState.UNMARKED)
  );
}

function getMistakes(player: Grid, solution: Grid): boolean[][] {
  return player.map((row, i) =>
    row.map((cell, j) =>
      (cell === CellState.FILLED && solution[i][j] !== CellState.FILLED) ||
      (cell !== CellState.FILLED && solution[i][j] === CellState.FILLED)
    )
  );
}

function App() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = puzzles[puzzleIdx];
  const size = puzzle.grid.length;
  const [playerGrid, setPlayerGrid] = useState<Grid>(createEmptyGrid(size));
  const [isSolved, setIsSolved] = useState(false);
  const [mistakes, setMistakes] = useState<boolean[][] | null>(null);
  const [tool, setTool] = useState<Tool>("fill");
  const [lives, setLives] = useState(MAX_LIVES);
  const [permanentMistakes, setPermanentMistakes] = useState<boolean[][]>(
    createEmptyGrid(size).map(row => row.map(() => false))
  );
  const [gameOver, setGameOver] = useState(false);

  const { rowClues, colClues } = calculateClues(puzzle.grid);

  const handleCellClick = (row: number, col: number) => {
    if (isSolved || gameOver || permanentMistakes[row][col]) return;
    let newState = playerGrid[row][col];
    if (tool === "fill") {
      newState = newState === CellState.FILLED ? CellState.UNMARKED : CellState.FILLED;
    } else if (tool === "x") {
      newState = newState === CellState.EMPTY ? CellState.UNMARKED : CellState.EMPTY;
    }
    // Autocheck logic
    let isMistake = false;
    if (newState === CellState.FILLED && puzzle.grid[row][col] !== CellState.FILLED) {
      isMistake = true;
    } else if (newState === CellState.EMPTY && puzzle.grid[row][col] === CellState.FILLED) {
      isMistake = true;
    }
    if (isMistake) {
      // Combine all updates in one go
      setPlayerGrid((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = CellState.EMPTY;
        return next;
      });
      setPermanentMistakes((prevMistakes) => {
        const updated = prevMistakes.map((r) => [...r]);
        updated[row][col] = true;
        return updated;
      });
      setLives((l) => {
        const newLives = l - 1;
        if (newLives <= 0) setGameOver(true);
        return newLives;
      });
    } else {
      setPlayerGrid((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = newState;
        return next;
      });
    }
    setMistakes(null); // Clear mistakes on any cell change
  };

  const handleCheck = () => {
    setIsSolved(validateSolution(playerGrid, puzzle.grid));
    setMistakes(getMistakes(playerGrid, puzzle.grid));
  };

  const handleReset = () => {
    setPlayerGrid(createEmptyGrid(size));
    setIsSolved(false);
    setMistakes(null);
    setLives(MAX_LIVES);
    setPermanentMistakes(createEmptyGrid(size).map(row => row.map(() => false)));
    setGameOver(false);
  };

  const handlePuzzleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setPuzzleIdx(idx);
    setPlayerGrid(createEmptyGrid(puzzles[idx].grid.length));
    setIsSolved(false);
    setMistakes(null);
    setLives(MAX_LIVES);
    setPermanentMistakes(createEmptyGrid(puzzles[idx].grid.length).map(row => row.map(() => false)));
    setGameOver(false);
  };

  // Find the max number of clues in any row/col for alignment
  const maxRowClues = Math.max(...rowClues.map((c) => c.length));
  const maxColClues = Math.max(...colClues.map((c) => c.length));

  return (
    <div className="App">
      <h1>Nonogram Puzzles</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="puzzle-select">Puzzle: </label>
        <select id="puzzle-select" value={puzzleIdx} onChange={handlePuzzleChange}>
          {puzzles.map((p, i) => (
            <option key={p.id} value={i}>{p.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
        Lives: {Array.from({ length: lives }).map((_, i) => <span key={i} style={{ color: "#e63946", fontSize: "1.5rem", marginRight: 2 }}>&#10084;&#65039;</span>)}
        {gameOver && <span style={{ color: '#e63946', fontWeight: 'bold', marginLeft: 8 }}>Game Over!</span>}
      </div>
      <div className="nonogram-outer-grid" style={{position:'relative', display:'grid', gridTemplateColumns: `repeat(${maxRowClues}, 2.1rem) repeat(${size}, 2.1rem)`, gridTemplateRows: `repeat(${maxColClues}, 2.1rem) repeat(${size}, 2.1rem)`}}>
        {/* Top-left spacer */}
        <div className="corner-spacer" style={{ gridRow: `1 / span ${maxColClues}`, gridColumn: `1 / span ${maxRowClues}` }} />
        {/* Column clue ribbons */}
        {colClues.map((clue, colIdx) => (
          <div
            key={`colribbon-${colIdx}`}
            className="clue-ribbon col-ribbon"
            style={{
              gridRow: `1 / span ${maxColClues}`,
              gridColumn: colIdx + maxRowClues + 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: `calc(${maxColClues} * 2.1rem)`
            }}
          >
            {clue.map((num, i) => (
              <span key={i} className="clue-number">{num}</span>
            ))}
          </div>
        ))}
        {/* Row clue ribbons */}
        {rowClues.map((clue, rowIdx) => (
          <div
            key={`rowribbon-${rowIdx}`}
            className="clue-ribbon row-ribbon"
            style={{
              gridRow: rowIdx + maxColClues + 1,
              gridColumn: `1 / span ${maxRowClues}`,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: `calc(${maxRowClues} * 2.1rem)`
            }}
          >
            {clue.map((num, i) => (
              <span key={i} className="clue-number">{num}</span>
            ))}
          </div>
        ))}
        {/* Puzzle grid */}
        {playerGrid.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isMistake = mistakes?.[rowIdx]?.[colIdx];
            const isPermanentMistake = permanentMistakes[rowIdx][colIdx];
            let cellContent: React.ReactNode = "";
            if (isPermanentMistake) cellContent = <span style={{color:'#e63946', fontWeight:'bold', fontSize:'1.7rem'}}>✕</span>;
            else if (cell === CellState.EMPTY) cellContent = "✕";
            else if (cell === CellState.FILLED) cellContent = "";
            return (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className={`cell state-${cell}${isMistake ? " mistake" : ""}${isPermanentMistake ? " permanent-mistake" : ""}`}
                style={{
                  gridRow: rowIdx + maxColClues + 1,
                  gridColumn: colIdx + maxRowClues + 1,
                  position: "relative",
                  cursor: isPermanentMistake || isSolved || gameOver ? 'not-allowed' : 'pointer',
                }}
                onClick={() => handleCellClick(rowIdx, colIdx)}
              >
                {cellContent}
                {isSolved && puzzle.colors[rowIdx][colIdx] && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      background: puzzle.colors[rowIdx][colIdx] || "transparent",
                      borderRadius: puzzle.colors[rowIdx][colIdx] ? "4px" : undefined,
                      opacity: 1,
                      zIndex: 2,
                      pointerEvents: "none",
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="controls">
        <button onClick={handleCheck} disabled={isSolved || gameOver}>Check</button>
        <button onClick={handleReset}>Reset</button>
        {isSolved && <span className="solved">🎉 Solved!</span>}
      </div>
      <div className="bottom-bar">
        <button
          className={`action-btn${tool === "fill" ? " selected" : ""}`}
          onClick={() => setTool("fill")}
          aria-label="Fill"
          disabled={isSolved || gameOver}
        >
          ■
        </button>
        <button
          className={`action-btn${tool === "x" ? " selected" : ""}`}
          onClick={() => setTool("x")}
          aria-label="X"
          disabled={isSolved || gameOver}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default App;

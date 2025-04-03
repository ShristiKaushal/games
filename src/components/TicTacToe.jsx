import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

const TicTacToe = ({ onBackToMenu }) => {
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [winningLine, setWinningLine] = useState(null);
  
  // Score tracking
  const [scores, setScores] = useState({
    x: 0,
    o: 0,
    draws: 0
  });
  
  // Game history for undo feature
  const [history, setHistory] = useState([{
    board: Array(9).fill(null),
    xIsNext: true
  }]);
  const [stepNumber, setStepNumber] = useState(0);

  // Handle square click
  const handleClick = (i) => {
    // If referring to a past move, truncate history
    const newHistory = history.slice(0, stepNumber + 1);
    const current = newHistory[newHistory.length - 1];
    const boardCopy = [...current.board];

    // Return if position is taken or game is over
    if (boardCopy[i] || gameOver) return;

    // Make move
    boardCopy[i] = xIsNext ? 'X' : 'O';
    
    // Update history and current state
    setHistory([...newHistory, {
      board: boardCopy,
      xIsNext: !xIsNext
    }]);
    setStepNumber(newHistory.length);
    setBoard(boardCopy);
    setXIsNext(!xIsNext);

    // Check for winner
    const result = calculateWinner(boardCopy);
    if (result) {
      setGameOver(true);
      setWinMessage(`Player ${result.winner} wins!`);
      setWinningLine(result.winningLine);
      
      // Update scores
      setScores(prevScores => ({
        ...prevScores,
        [result.winner.toLowerCase()]: prevScores[result.winner.toLowerCase()] + 1
      }));
    } else if (boardCopy.every(square => square)) {
      setGameOver(true);
      setWinMessage("It's a draw!");
      
      // Update draw count
      setScores(prevScores => ({
        ...prevScores,
        draws: prevScores.draws + 1
      }));
    }
  };

  // Jump to a specific move in history
  const jumpTo = (step) => {
    setStepNumber(step);
    const current = history[step];
    setBoard(current.board);
    setXIsNext(current.xIsNext);
    setGameOver(step === history.length - 1 && gameOver);
    setWinningLine(step === history.length - 1 ? winningLine : null);
  };

  // Undo last move
  const undoMove = () => {
    if (stepNumber > 0) {
      jumpTo(stepNumber - 1);
    }
  };

  // Reset the current game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setWinMessage('');
    setWinningLine(null);
    setHistory([{
      board: Array(9).fill(null),
      xIsNext: true
    }]);
    setStepNumber(0);
  };

  // Reset all scores
  const resetScores = () => {
    setScores({
      x: 0,
      o: 0,
      draws: 0
    });
  };

  // Render a square
  const renderSquare = (i) => {
    const isWinningSquare = winningLine && winningLine.includes(i);
    return (
      <button 
        className={`square 
          ${board[i] === 'X' ? 'x' : board[i] === 'O' ? 'o' : ''} 
          ${isWinningSquare ? 'winner' : ''}
        `} 
        onClick={() => handleClick(i)}
        aria-label={`Square ${i + 1}, ${board[i] || 'empty'}`}
      >
      </button>
    );
  };

  // Show game status
  let status;
  if (winMessage) {
    status = winMessage;
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBackToMenu}>Back to Menu</button>
      <h1>Tic-Tac-Toe</h1>
      
      {/* Score Board */}
      <div className="score-board">
        <div className="score-card player-x">
          <h3>Player X</h3>
          <div className="score-value">{scores.x}</div>
        </div>
        <div className="score-card draw">
          <h3>Draws</h3>
          <div className="score-value">{scores.draws}</div>
        </div>
        <div className="score-card player-o">
          <h3>Player O</h3>
          <div className="score-value">{scores.o}</div>
        </div>
      </div>
      
      <div className="status">{status}</div>
      
      {/* Game Board */}
      <div className="tictactoe-board">
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
      
      {/* Game Controls */}
      <div className="game-controls">
        <div>
          <button className="button reset-button" onClick={resetGame}>New Game</button>
          <button className="button back-button" onClick={undoMove} disabled={stepNumber === 0}>Undo Move</button>
        </div>
        <button className="button reset-button" onClick={resetScores} style={{marginTop: '10px'}}>Reset Scores</button>
      </div>
    </div>
  );
};

// Helper function to determine winner and winning line
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningLine: [a, b, c] };
    }
  }
  return null;
}

export default TicTacToe;
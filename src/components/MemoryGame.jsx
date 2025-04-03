import React, { useState, useEffect, useRef } from 'react';
import './MemoryGame.css';

const MemoryGame = ({ onBackToMenu }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameLevel, setGameLevel] = useState('easy');
  const [timer, setTimer] = useState(0);
  const [bestScore, setBestScore] = useState({
    easy: localStorage.getItem('memoryGameBestScoreEasy') || '-',
    medium: localStorage.getItem('memoryGameBestScoreMedium') || '-',
    hard: localStorage.getItem('memoryGameBestScoreHard') || '-'
  });
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const timerRef = useRef(null);

  // Different card symbols for different levels
  const gameLevels = {
    easy: {
      symbols: ['🍎', '🍌', '🍒', '🍓', '🍑', '🍍', '🥝', '🥥'],
      gridSize: '4x4'
    },
    medium: {
      symbols: ['🍎', '🍌', '🍒', '🍓', '🍑', '🍍', '🥝', '🥥', '🍊', '🍉', '🍇', '🍈'],
      gridSize: '4x6'
    },
    hard: {
      symbols: ['🍎', '🍌', '🍒', '🍓', '🍑', '🍍', '🥝', '🥥', '🍊', '🍉', '🍇', '🍈', '🍋', '🍐', '🍏', '🍆'],
      gridSize: '4x8'
    }
  };

  const initializeGame = () => {
    const currentLevelSymbols = gameLevels[gameLevel].symbols;
    
    const shuffledCards = [...currentLevelSymbols, ...currentLevelSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, i) => ({ id: i, symbol, flipped: false, solved: false }));

    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
    setMoves(0);
    setGameOver(false);
    setGameStarted(true);
    setTimer(0);
    setHintsUsed(0);
    
    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);
  };

  useEffect(() => {
    // Check if the game is over
    if (gameStarted && solved.length === gameLevels[gameLevel].symbols.length * 2) {
      setGameOver(true);
      
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Calculate score based on moves and time
      const score = calculateScore();
      
      // Check and update best score
      const currentBest = bestScore[gameLevel];
      if (currentBest === '-' || score > parseInt(currentBest)) {
        const newBestScore = {...bestScore};
        newBestScore[gameLevel] = score.toString();
        setBestScore(newBestScore);
        localStorage.setItem(`memoryGameBestScore${gameLevel.charAt(0).toUpperCase() + gameLevel.slice(1)}`, score.toString());
      }
    }
    
    // Clean up timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [solved, gameStarted, gameLevel]);

  const calculateScore = () => {
    // Base score calculation:
    // Higher score for fewer moves and faster completion
    // Penalty for using hints
    const basePoints = 1000;
    const movesFactor = gameLevels[gameLevel].symbols.length * 3; // Expected average moves
    const timeFactor = gameLevel === 'easy' ? 60 : gameLevel === 'medium' ? 120 : 180; // Expected completion time
    const hintPenalty = hintsUsed * 50;
    
    let score = basePoints - (moves - movesFactor) * 5 - (timer - timeFactor) * 2 - hintPenalty;
    return Math.max(score, 0); // Ensure score doesn't go negative
  };

  const handleCardClick = (id) => {
    // Don't allow flipping if game is disabled or card is already flipped/solved
    if (disabled || flipped.includes(id) || solved.includes(id)) return;

    // Can only flip two cards at a time
    const newFlipped = flipped.length === 1 ? [...flipped, id] : [id];
    setFlipped(newFlipped);

    // If we just flipped our second card
    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(moves + 1);
      
      const [firstCardId, secondCardId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      // Check if cards match
      if (firstCard.symbol === secondCard.symbol) {
        setSolved([...solved, firstCardId, secondCardId]);
        setFlipped([]);
        setDisabled(false);
      } else {
        // If cards don't match, flip them back
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  const showHintHandler = () => {
    if (solved.length === gameLevels[gameLevel].symbols.length * 2) return;
    
    setHintsUsed(hintsUsed + 1);
    setShowHint(true);
    setDisabled(true);
    
    // Show all cards briefly
    setTimeout(() => {
      setShowHint(false);
      setDisabled(false);
    }, 1000);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderCard = (card) => {
    const isFlipped = flipped.includes(card.id) || solved.includes(card.id) || showHint;
    return (
      <div
        key={card.id}
        className={`memory-card ${isFlipped ? 'flipped' : ''} ${solved.includes(card.id) ? 'solved' : ''}`}
        onClick={() => handleCardClick(card.id)}
        aria-label={`Card ${card.id}, ${isFlipped ? card.symbol : 'hidden'}`}
      >
        <div className="memory-card-inner">
          <div className="memory-card-front">
            <span>?</span>
          </div>
          <div className="memory-card-back">
            <span>{card.symbol}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="game-container memory-game-container">
      <button className="back-button" onClick={onBackToMenu}>
        <span className="back-icon">←</span> Back to Menu
      </button>
      <h1 className="game-title">Memory Card Game</h1>
      
      {!gameStarted ? (
        <div className="game-setup">
          <p className="memory-intro">Match pairs of cards with the same symbol</p>
          
          <div className="difficulty-selector">
            <h3>Select Difficulty:</h3>
            <div className="difficulty-buttons">
              <button 
                className={`difficulty-btn ${gameLevel === 'easy' ? 'active' : ''}`} 
                onClick={() => setGameLevel('easy')}
              >
                Easy
              </button>
              <button 
                className={`difficulty-btn ${gameLevel === 'medium' ? 'active' : ''}`} 
                onClick={() => setGameLevel('medium')}
              >
                Medium
              </button>
              <button 
                className={`difficulty-btn ${gameLevel === 'hard' ? 'active' : ''}`} 
                onClick={() => setGameLevel('hard')}
              >
                Hard
              </button>
            </div>
            <p className="difficulty-info">
              {gameLevel === 'easy' ? '8 pairs (4x4 grid)' : 
               gameLevel === 'medium' ? '12 pairs (4x6 grid)' : 
               '16 pairs (4x8 grid)'}
            </p>
          </div>
          
          <div className="best-scores">
            <h3>Best Scores:</h3>
            <div className="scores-list">
              <div className="score-item">
                <span>Easy:</span>
                <span>{bestScore.easy}</span>
              </div>
              <div className="score-item">
                <span>Medium:</span>
                <span>{bestScore.medium}</span>
              </div>
              <div className="score-item">
                <span>Hard:</span>
                <span>{bestScore.hard}</span>
              </div>
            </div>
          </div>
          
          <button className="start-button pulse-animation" onClick={initializeGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="game-controls">
            <div className="memory-stats">
              <div className="stat-item">
                <span className="stat-label">Moves:</span>
                <span className="stat-value">{moves}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time:</span>
                <span className="stat-value">{formatTime(timer)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Matches:</span>
                <span className="stat-value">{solved.length / 2} / {gameLevels[gameLevel].symbols.length}</span>
              </div>
            </div>
            
            <div className="game-buttons">
              <button className="hint-button" onClick={showHintHandler} disabled={disabled || gameOver}>
                Show Hint ({hintsUsed})
              </button>
              <button className="reset-button" onClick={initializeGame}>
                Restart
              </button>
            </div>
          </div>
          
          <div className={`memory-grid grid-${gameLevels[gameLevel].gridSize}`}>
            {cards.map(card => renderCard(card))}
          </div>
          
          {gameOver && (
            <div className="memory-game-over">
              <h2>Congratulations!</h2>
              <div className="results-container">
                <p>You completed the game in {moves} moves</p>
                <p>Time: {formatTime(timer)}</p>
                <p>Hints used: {hintsUsed}</p>
                <p className="score">Score: {calculateScore()}</p>
                {calculateScore() > parseInt(bestScore[gameLevel]) || bestScore[gameLevel] === '-' ? (
                  <p className="new-record">New Record! 🏆</p>
                ) : null}
              </div>
              <div className="game-over-actions">
                <button className="play-again-button" onClick={initializeGame}>
                  Play Again
                </button>
                <button className="change-difficulty-button" onClick={() => {
                  setGameStarted(false);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}>
                  Change Difficulty
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryGame;
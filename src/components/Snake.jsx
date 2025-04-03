import React, { useState, useEffect, useCallback, useRef } from "react";
import "./snake.css";

// Game constants
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;
const SPEED_INCREMENT = 5;

const Snake = ({ onBackToMenu }) => {
  // Game state
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(null);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("snakeHighScore");
    return saved ? parseInt(saved) : 0;
  });
  const [gameSpeed, setGameSpeed] = useState(GAME_SPEED);
  
  // Refs
  const gameLoopRef = useRef(null);
  const timerRef = useRef(null);

  // Generate food in a position not occupied by the snake
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  }, [snake]);

  // Initialize food position
  useEffect(() => {
    if (!food) {
      setFood(generateFood());
    }
  }, [food, generateFood]);

  // Handle keyboard controls
  const handleKeyPress = useCallback(
    (event) => {
      if (isGameOver) return;
      
      switch (event.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case " ": // Space bar to pause/resume
          setIsPaused(prev => !prev);
          break;
        case "r": // R key to restart
          if (isGameOver) restartGame();
          break;
        default:
          break;
      }
    },
    [direction, isGameOver]
  );

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Main game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y,
        };

        // Check for collision with walls or self
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setIsGameOver(true);
          
          // Update high score if needed
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("snakeHighScore", score.toString());
          }
          
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check if snake ate food
        if (food && newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood());
          setScore(prevScore => prevScore + 1);
          // Increase game speed slightly with each food eaten
          setGameSpeed(prevSpeed => Math.max(prevSpeed - SPEED_INCREMENT, 50));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameLoopRef.current);
  }, [direction, food, isGameOver, isPaused, score, highScore, gameSpeed, generateFood]);

  // Timer
  useEffect(() => {
    if (isGameOver || isPaused) return;
    
    timerRef.current = setInterval(() => setTime(prev => prev + 1), 1000);
    
    return () => clearInterval(timerRef.current);
  }, [isGameOver, isPaused]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Restart game function
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setScore(0);
    setTime(0);
    setGameSpeed(GAME_SPEED);
    setIsGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBackToMenu}>Back to Menu</button>
      
      <h1>🐍 Snake Game</h1>
      
      <div className="scoreboard">
        <div className="score-item">
          <span className="score-label">Score:</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-item">
          <span className="score-label">High Score:</span>
          <span className="score-value">{highScore}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Time:</span>
          <span className="score-value">{formatTime(time)}</span>
        </div>
      </div>
      
      {isPaused && !isGameOver && (
        <div className="pause-overlay">
          <p>PAUSED</p>
          <p className="hint">Press SPACE to resume</p>
        </div>
      )}
      
      <div className="grid">
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const isSnake = snake.some(segment => segment.x === col && segment.y === row);
            const isHead = snake[0].x === col && snake[0].y === row;
            const isFood = food && food.x === col && food.y === row;
            
            return (
              <div 
                key={`${row}-${col}`} 
                className={`cell ${isSnake ? (isHead ? "snake-head" : "snake") : ""} ${isFood ? "food" : ""}`}
              ></div>
            );
          })
        )}
      </div>
      
      <div className="controls-info">
        <p>Controls: Arrow Keys to move | SPACE to pause | R to restart</p>
      </div>
      
      {isGameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <p>Time Survived: {formatTime(time)}</p>
          {score === highScore && score > 0 && (
            <p className="new-record">New High Score! 🎉</p>
          )}
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default Snake;
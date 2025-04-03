import React, { useState, useEffect } from 'react';
import './App.css';
import TicTacToe from './components/TicTacToe';
import Snake from './components/Snake';
import MemoryGame from './components/MemoryGame';
import SettingsModal from './components/SettingsModal';
import Achievements from './components/Achievements';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('miniGameHubTheme');
    return savedTheme || 'dark';
  });
  const [difficulty, setDifficulty] = useState(() => {
    const savedDifficulty = localStorage.getItem('miniGameHubDifficulty');
    return savedDifficulty || 'medium';
  });
  const [playerName, setPlayerName] = useState(() => {
    const savedName = localStorage.getItem('miniGameHubPlayerName');
    return savedName || 'Player';
  });
  const [gameStats, setGameStats] = useState({
    tictactoe: { played: 0, won: 0, streak: 0, lastPlayed: null },
    snake: { played: 0, highScore: 0, totalScore: 0, lastPlayed: null },
    memory: { played: 0, bestTime: null, gamesCompleted: 0, lastPlayed: null }
  });
  const [achievements, setAchievements] = useState({
    gamesPlayed: { unlocked: false, progress: 0, target: 10, title: "Game Enthusiast" },
    tictactoeMaster: { unlocked: false, progress: 0, target: 5, title: "Tic-Tac-Toe Master" },
    snakeChampion: { unlocked: false, progress: 0, target: 100, title: "Snake Charmer" },
    memoryWizard: { unlocked: false, progress: 0, target: 60, title: "Memory Wizard" }
  });
  const [notification, setNotification] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('miniGameHubStats');
    const savedAchievements = localStorage.getItem('miniGameHubAchievements');
    
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('miniGameHubStats', JSON.stringify(gameStats));
    localStorage.setItem('miniGameHubAchievements', JSON.stringify(achievements));
    localStorage.setItem('miniGameHubTheme', theme);
    localStorage.setItem('miniGameHubDifficulty', difficulty);
    localStorage.setItem('miniGameHubPlayerName', playerName);
  }, [gameStats, achievements, theme, difficulty, playerName]);

  // Check achievements
  useEffect(() => {
    checkAchievements();
  }, [gameStats]);

  const checkAchievements = () => {
    const totalGamesPlayed = 
      gameStats.tictactoe.played + 
      gameStats.snake.played + 
      gameStats.memory.played;
    
    const newAchievements = { ...achievements };
    
    // Check total games played achievement
    if (!newAchievements.gamesPlayed.unlocked && totalGamesPlayed >= newAchievements.gamesPlayed.target) {
      newAchievements.gamesPlayed.unlocked = true;
      newAchievements.gamesPlayed.progress = totalGamesPlayed;
      showNotification("Achievement Unlocked: Game Enthusiast! 🎮");
    } else {
      newAchievements.gamesPlayed.progress = totalGamesPlayed;
    }
    
    // Check Tic-Tac-Toe wins achievement
    if (!newAchievements.tictactoeMaster.unlocked && gameStats.tictactoe.won >= newAchievements.tictactoeMaster.target) {
      newAchievements.tictactoeMaster.unlocked = true;
      newAchievements.tictactoeMaster.progress = gameStats.tictactoe.won;
      showNotification("Achievement Unlocked: Tic-Tac-Toe Master! ❌⭕");
    } else {
      newAchievements.tictactoeMaster.progress = gameStats.tictactoe.won;
    }
    
    // Check Snake high score achievement
    if (!newAchievements.snakeChampion.unlocked && gameStats.snake.highScore >= newAchievements.snakeChampion.target) {
      newAchievements.snakeChampion.unlocked = true;
      newAchievements.snakeChampion.progress = gameStats.snake.highScore;
      showNotification("Achievement Unlocked: Snake Charmer! 🐍");
    } else {
      newAchievements.snakeChampion.progress = gameStats.snake.highScore;
    }
    
    // Check Memory game best time achievement (under 60 seconds)
    if (!newAchievements.memoryWizard.unlocked && 
        gameStats.memory.bestTime && 
        gameStats.memory.bestTime <= newAchievements.memoryWizard.target) {
      newAchievements.memoryWizard.unlocked = true;
      newAchievements.memoryWizard.progress = gameStats.memory.bestTime;
      showNotification("Achievement Unlocked: Memory Wizard! 🧙‍♂️");
    } else if (gameStats.memory.bestTime) {
      newAchievements.memoryWizard.progress = gameStats.memory.bestTime;
    }
    
    setAchievements(newAchievements);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    
    // Update play count and last played time
    const now = new Date().toISOString();
    setGameStats(prevStats => ({
      ...prevStats,
      [game]: {
        ...prevStats[game],
        played: prevStats[game].played + 1,
        lastPlayed: now
      }
    }));
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  const updateGameStats = (game, stats) => {
    setGameStats(prevStats => ({
      ...prevStats,
      [game]: {
        ...prevStats[game],
        ...stats
      }
    }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.className = newTheme;
  };

  const renderSelectedGame = () => {
    switch (selectedGame) {
      case 'tictactoe':
        return (
          <TicTacToe 
            onBackToMenu={handleBackToMenu} 
            stats={gameStats.tictactoe}
            updateStats={(stats) => updateGameStats('tictactoe', stats)}
            difficulty={difficulty}
            playerName={playerName}
          />
        );
      case 'snake':
        return (
          <Snake 
            onBackToMenu={handleBackToMenu} 
            stats={gameStats.snake}
            updateStats={(stats) => updateGameStats('snake', stats)}
            difficulty={difficulty}
            playerName={playerName}
          />
        );
      case 'memory':
        return (
          <MemoryGame 
            onBackToMenu={handleBackToMenu} 
            stats={gameStats.memory}
            updateStats={(stats) => updateGameStats('memory', stats)}
            difficulty={difficulty}
            playerName={playerName}
          />
        );
      default:
        return null;
    }
  };

  const getGameIcon = (game) => {
    switch (game) {
      case 'tictactoe':
        return '❌⭕';
      case 'snake':
        return '🐍';
      case 'memory':
        return '🃏';
      default:
        return '';
    }
  };

  const getLastPlayedText = (lastPlayed) => {
    if (!lastPlayed) return 'Never played';
    
    const lastPlayedDate = new Date(lastPlayed);
    const now = new Date();
    const diffTime = Math.abs(now - lastPlayedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getTotalAchievements = () => {
    return Object.values(achievements).filter(achievement => achievement.unlocked).length;
  };

  return (
    <div className={`app ${theme}`}>
      {notification && (
        <div className="notification">
          <p>{notification}</p>
        </div>
      )}
      
      {showSettings && (
        <SettingsModal 
          theme={theme}
          difficulty={difficulty}
          playerName={playerName}
          onThemeChange={handleThemeChange}
          onDifficultyChange={setDifficulty}
          onPlayerNameChange={setPlayerName}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showAchievements && (
        <Achievements 
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
      
      {!selectedGame ? (
        <div className="game-selector">
          <div className="header">
            <h1>Mini Game Hub</h1>
            <div className="toolbar">
              <button className="icon-button" onClick={() => setShowAchievements(true)}>
                🏆 {getTotalAchievements()}/{Object.keys(achievements).length}
              </button>
              <button className="icon-button" onClick={() => setShowSettings(true)}>
                ⚙️
              </button>
            </div>
          </div>
          
          <p>Welcome, {playerName}! Select a game to play:</p>
          
          <div className="game-buttons">
            {['tictactoe', 'snake', 'memory'].map(game => (
              <button 
                key={game} 
                className="game-button" 
                onClick={() => handleGameSelect(game)}
              >
                <div className="game-icon">{getGameIcon(game)}</div>
                <div className="game-name">
                  {game === 'tictactoe' ? 'Tic-Tac-Toe' : 
                   game === 'snake' ? 'Snake' : 'Memory Cards'}
                </div>
                <div className="game-stats">
                  {game === 'tictactoe' ? 
                    `Played: ${gameStats.tictactoe.played} | Won: ${gameStats.tictactoe.won}` :
                   game === 'snake' ? 
                    `High Score: ${gameStats.snake.highScore}` :
                    `Best Time: ${gameStats.memory.bestTime ? `${gameStats.memory.bestTime}s` : 'N/A'}`
                  }
                </div>
                <div className="game-last-played">
                  {getLastPlayedText(gameStats[game].lastPlayed)}
                </div>
              </button>
            ))}
          </div>
          
          <div className="daily-challenge">
            <h3>Daily Challenge</h3>
            <p>Win 3 games of Tic-Tac-Toe today!</p>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${Math.min(gameStats.tictactoe.streak, 3) / 3 * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {renderSelectedGame()}
        </>
      )}
    </div>
  );
}

export default App;
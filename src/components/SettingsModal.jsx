import React from 'react';

const SettingsModal = ({ 
  theme, 
  difficulty, 
  playerName, 
  onThemeChange, 
  onDifficultyChange, 
  onPlayerNameChange, 
  onClose 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };
  
  return (
    <div className="modal-overlay">
      <div className={`modal ${theme}`}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="playerName">Player Name</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              maxLength={15}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme" 
              value={theme} 
              onChange={(e) => onThemeChange(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="neon">Neon</option>
              <option value="retro">Retro</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="difficulty">Game Difficulty</label>
            <select 
              id="difficulty" 
              value={difficulty} 
              onChange={(e) => onDifficultyChange(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="modal-footer">
            <button type="submit" className="save-button">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
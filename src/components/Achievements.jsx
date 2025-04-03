import React, { useState } from 'react';

const Achievements = ({ playerAchievements, theme }) => {
  const [filter, setFilter] = useState('all'); // all, completed, incomplete
  
  // Sample achievements data structure (for reference)
  // const playerAchievements = [
  //   { id: 1, title: 'First Victory', description: 'Win your first game', completed: true, completedDate: '2025-03-20', icon: '🏆' },
  //   { id: 2, title: 'Speed Demon', description: 'Complete a game in under 30 seconds', completed: false, progress: 0.6, icon: '⚡' }
  // ];
  
  const filteredAchievements = playerAchievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'completed') return achievement.completed;
    if (filter === 'incomplete') return !achievement.completed;
    return true;
  });
  
  return (
    <div className={`achievements-container ${theme}`}>
      <div className="achievements-header">
        <h2>Achievements</h2>
        <div className="filter-controls">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-button ${filter === 'incomplete' ? 'active' : ''}`}
            onClick={() => setFilter('incomplete')}
          >
            In Progress
          </button>
        </div>
      </div>
      
      <div className="achievements-list">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map(achievement => (
            <div key={achievement.id} className={`achievement-card ${achievement.completed ? 'completed' : ''}`}>
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-content">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                {achievement.completed ? (
                  <div className="completion-date">Completed on: {new Date(achievement.completedDate).toLocaleDateString()}</div>
                ) : (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(achievement.progress || 0) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-achievements">
            <p>No {filter !== 'all' ? filter : ''} achievements found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
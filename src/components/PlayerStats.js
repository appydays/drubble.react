import React from 'react';
import './css/PlayerStats.css';

const PlayerStats = ({ stats }) => {
    const {
        highest_scoring_word,
        highest_word_score,
        highest_game_score,
        games_played,
        average_score
    } = stats;

    const statItems = [
        { label: "🏆 Best Word", value: highest_scoring_word },
        { label: "💥 Best Word Score", value: highest_word_score },
        { label: "🎮 Best Game Score", value: highest_game_score },
        { label: "🧮 Games Played", value: games_played },
        { label: "📊 Avg Game Score", value: average_score },
    ];

    return (
        <div className="stats-grid">
            {statItems.map(({ label, value }) => (
                <div key={label} className="stat-card">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value ?? '—'}</div>
                </div>
            ))}
        </div>
    );
};

export default PlayerStats;

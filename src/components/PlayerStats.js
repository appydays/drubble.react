import React from 'react';
import './css/PlayerStats.css';
import { useTranslation } from 'react-i18next';

const PlayerStats = ({ stats }) => {
    const { t } = useTranslation();

    const {
        highest_scoring_word,
        highest_word_score,
        highest_game_score,
        games_played,
        average_score
    } = stats;

    const statItems = [
        { label: t('leaderboard.stats.record-stats.best-word'), value: highest_scoring_word },
        { label: t('leaderboard.stats.record-stats.best-word-score'), value: highest_word_score },
        { label: t('leaderboard.stats.record-stats.best-game-score'), value: highest_game_score },
        { label: t('leaderboard.stats.record-stats.games-played'), value: games_played },
        { label: t('leaderboard.stats.record-stats.average-score'), value: average_score },
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

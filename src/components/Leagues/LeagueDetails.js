import React, { useState, useEffect } from 'react';
import '../css/League.css';
import { useTranslation } from 'react-i18next';
import useApiRequest from '../useApiRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const LeagueDetails = ({ league, selectedDate, onDateChange, playerId, onOpenSettingsModal }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const { t } = useTranslation();
    const { makeRequest, loading, error } = useApiRequest(process.env.REACT_APP_API_URL + '/api');

    const fetchLeaderboard = async () => {
        try {
            // The API call now only fetches for the single selected date
            const response = await makeRequest(`/player/${playerId}/league/${league.id}?date=${selectedDate}`, 'GET');
            if (response.success) {
                setLeaderboard(response.leaderboard);
            } else {
                console.error("Failed to fetch leaderboard:", response.message);
                setLeaderboard([]);
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    useEffect(() => {
        if (league && selectedDate) {
            fetchLeaderboard();
        }
    }, [league, selectedDate]); // Refetch when league or selectedDate changes

    const isPlayerOwner = () => {
        // First, check if the league and pivot property exist
        if (!league || !league.pivot) {
            return false;
        }

        // Check if `pivot` is an array of players.
        // This case assumes each player object in the array has an `is_owner` property.
        if (Array.isArray(league.pivot)) {
            return league.pivot.some(player => {
                return parseInt(player.user_id) === parseInt(playerId) && player.is_owner === 1;
            });
        }
        // If `pivot` is a single object, check it directly
        else {
            return parseInt(league.pivot.user_id) === parseInt(playerId) && league.pivot.is_owner === 1;
        }
    };

    const isOwner = isPlayerOwner();

    // Generate today's and yesterday's dates
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

    return (
        <div className="league-details">
            <div className="league-details-title-container">
                <h2>{t('leagues.details.title', { leagueName: league.name })} {t('leaderboard.title')}</h2>
                {/* Show settings button only if a league is selected and the current user is the owner */}
                {isOwner && (
                    <div className="close-button">
                        <button
                            className="setting-button"
                            onClick={() => onOpenSettingsModal(league)}
                            aria-label="League settings"
                        >
                            <FontAwesomeIcon icon={faCog} className="mr-2" />
                        </button>
                    </div>
                )}
            </div>

            <div className="date-selection">
                <button
                    className={`special key ${selectedDate === today ? 'active' : ''}`}
                    onClick={() => onDateChange(today)}
                >{t('leaderboard.today')}</button>
                <button
                    className={`special key ${selectedDate === yesterday ? 'active' : ''}`}
                    onClick={() => onDateChange(yesterday)}
                >{t('leaderboard.yesterday')}</button>
                <div>
                    <label htmlFor="date-picker">{t('leagues.details.select-date')} </label>
                    <input
                        type="date"
                        id="date-picker"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        max={today} // Prevents selecting future dates
                        className="date-input"
                    />
                </div>
            </div>

            {loading && <p>{t('leaderboard.loading')}</p>}
            {error && <p style={{ color: 'red' }}>{t('leaderboard.loading-error')} {error}</p>}

            {!loading && !error && (
                <div className="tab-content">
                    {leaderboard && leaderboard.length > 0 ? (
                        <table style={{ width: '100%' }}>
                            <thead>
                            <tr>
                                <th className="rank">{t('leaderboard.stats.table.position')}</th>
                                <th className="name">{t('leaderboard.stats.table.nickname')}</th>
                                <th className="score">{t('leaderboard.stats.table.score')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaderboard.map((entry, index) => (
                                <tr key={entry.id ?? `league-${league.id}-${selectedDate}-${index}`}
                                    className={parseInt(entry.id) === parseInt(playerId) ? 'current-player' : ''}
                                >
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{entry.nickname}</td>
                                    <td className="score">{entry.score}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>{t('leaderboard.stats.table.no-data')}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeagueDetails;
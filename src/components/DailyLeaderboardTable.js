import React from 'react';
import { useTranslation } from 'react-i18next'; // Assuming you're using react-i18next for 't'

function DailyLeaderboardTable({ currentDailyData, playerId, selectedDailyView }) {
    const { t } = useTranslation(); // Initialize translation hook

    // Determine if the player's position needs to be shown outside the top 20
    const showPlayerPositionRow =
        currentDailyData?.playerPosition && currentDailyData.playerPosition.rank > 10;

    return (
        <div>
            {currentDailyData && currentDailyData.top20 && currentDailyData.top20.length > 0 ? (
                <table style={{ width: '100%' }}>
                    <thead>
                    <tr>
                        <th className="rank">{t('leaderboard.stats.table.position')}</th>
                        <th className="name">{t('leaderboard.stats.table.nickname')}</th>
                        <th className="score">{t('leaderboard.stats.table.score')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentDailyData.top20.map((player, index) => (
                        <tr
                            key={player.id ?? `daily-${selectedDailyView}-top20-${index}`}
                            className={
                                parseInt(player.id) === parseInt(playerId)
                                    ? 'current-player'
                                    : ''
                            }
                        >
                            <td className="rank">{index + 1}</td>
                            <td className="name">{player.nickname}</td>
                            <td className="score">{player.score}</td>
                        </tr>
                    ))}

                    {/* Conditionally render the player's row if rank > 10 */}
                    {showPlayerPositionRow && (
                        <>
                            {/* Optional: Add a separator row if desired */}
                            <tr className="separator-row">
                                <td>...</td>
                                <td>...</td>
                                <td>...</td>
                            </tr>
                            <tr
                                key={`daily-${selectedDailyView}-player-position`}
                                className="current-player" // Highlight the player's row
                            >
                                <td className="rank">{currentDailyData.playerPosition.rank}</td>
                                <td className="name">{currentDailyData.playerPosition.nickname}</td>
                                <td className="score">{currentDailyData.playerPosition.score}</td>
                            </tr>
                        </>
                    )}
                    </tbody>
                </table>
            ) : (
                <p>{t('leaderboard.stats.table.no-data')}</p>
            )}
        </div>
    );
}

export default DailyLeaderboardTable;
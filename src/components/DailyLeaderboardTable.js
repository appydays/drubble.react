import React, {useState} from 'react';
import { useTranslation } from 'react-i18next'; // Assuming you're using react-i18next for 't'
import Modal from './Modal';

function DailyLeaderboardTable({ currentDailyData, playerId, selectedDailyView, hasPlayedToday }) {
    const { t } = useTranslation(); // Initialize translation hook

    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Determine if the player's position needs to be shown outside the top 20
    const showPlayerPositionRow =
        currentDailyData?.playerPosition && currentDailyData.playerPosition.rank > 10;

    console.log("DailyLeaderboardModal : Has Played Today -> "+(hasPlayedToday?"Yes":"No"));

    return (
        <div>
            {currentDailyData && currentDailyData.top20 && currentDailyData.top20.length > 0 ? (
                <>
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
                            <td
                                className={`name ${hasPlayedToday ? "clickable" : ""}`}
                                onClick={() => {
                                    if (hasPlayedToday) {
                                        setSelectedPlayer(player);
                                    }
                                }}
                            >
                                {player.nickname}
                            </td>
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

                    {/* Words-used Modal */}
                    {selectedPlayer && (
                        <Modal isOpen={true} onClose={() => setSelectedPlayer(null)}>
                            <h3>{t('leaderboard.words_used',{playerName: selectedPlayer.nickname})}</h3>
                            <ul className="words-list">
                                {(() => {
                                    try {
                                        const words = JSON.parse(selectedPlayer.words_used);
                                        return words.map((word, idx) => (
                                            <li key={idx}>{word}</li>
                                        ));
                                    } catch (e) {
                                        // fallback in case parsing fails
                                        return <li>{t('leaderboard.no_words')}</li>;
                                    }
                                })()}
                            </ul>
                        </Modal>
                    )}
                </>
            ) : (
                <p>{t('leaderboard.stats.table.no-data')}</p>
            )}
        </div>
    );
}

export default DailyLeaderboardTable;

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './css/Leaderboard.css';
import WordLengthHistogram from './WordLengthHistogram'; // Adjust path if needed
import PlayerStats from "./PlayerStats";
import useApiRequest from './useApiRequest';
import TopStatTable from "./TopStatTable";
import Swal from 'sweetalert2';


function LeaderboardModal({ playerId, isOpen, onClose }) {
    const [dailyLeaderboardData, setDailyLeaderboardData] = useState([]);
    const [monthlyLeaderboardData, setMonthlyLeaderboardData] = useState([]);

    const [playerStatsData, setPlayerStatsData] = useState(null);
    const [isPlayerStatsLoading, setIsPlayerStatsLoading] = useState(false);
    const [playerStatsError, setPlayerStatsError] = useState(null);

    const [wordLengthData, setWordLengthData] = useState(null);
    const [isHistogramLoading, setIsHistogramLoading] = useState(false);
    const [histogramError, setHistogramError] = useState(null);

    const [recordStatsData, setRecordStatsData] = useState(null);
    const [isRecordStatsLoading, setIsRecordStatsLoading] = useState(false);
    const [recordStatsError, setRecordStatsError] = useState(null);

    const [activeTab, setActiveTab] = useState('daily');

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';

    const { makeRequest } = useApiRequest(apiUrl);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
                const response = await fetch(`${apiUrl}/leaderboard?date=${today}&player_id=${playerId}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setDailyLeaderboardData(data.daily);
                    setMonthlyLeaderboardData(data.monthly);
                } else {
                    Swal.fire('Error','Unable to load the leaderboard', 'error');
                }
            } catch (error) {
                Swal.fire('Error','Unexpected error occurred', 'error');
            }
        };

        if (isOpen) {
            fetchLeaderboard();
        }
    }, [isOpen, playerId, apiUrl]);

    useEffect(() => {
        const fetchWordLengthHistogram = async () => {
            // Only fetch if the 'player' tab is active AND modal is open AND playerId exists
            if (activeTab === 'player' && isOpen && playerId) {
                setIsHistogramLoading(true);
                setIsPlayerStatsLoading(true);
                setHistogramError(null); // Clear previous errors
                setPlayerStatsError(null);

                try {
                    // Assuming an API endpoint like /players/{playerId}/word-length-histogram for GET
                    // You might need to use `makeRequest` if you have it in scope, but for `fetch`, it's direct.
                    const response = await makeRequest(`/players/${playerId}/stats`, 'GET');

                    if (response.success) {
                        setPlayerStatsData(response.stats);
                        setWordLengthData(response.word_histogram);
                    } else {
                        const errorText = await response.message;
                        console.error("Error fetching word length histogram:", errorText);
                        setHistogramError(`Failed to fetch histogram data: ${errorText}`);
                    }
                } catch (err) {
                    console.error("Network error fetching word length histogram:", err);
                    setHistogramError(err.message || 'A network error occurred while loading histogram data.');
                } finally {
                    setIsHistogramLoading(false);
                    setIsPlayerStatsLoading(false);
                }
            } else if (activeTab !== 'player') {
                // Optionally clear histogram data if moving away from the player stats tab
                setWordLengthData(null);
                setPlayerStatsData(null);
                setHistogramError(null);
            }
        };

        fetchWordLengthHistogram();
    }, [activeTab, isOpen, playerId, apiUrl]); // Re-run when tab, modal state, player ID, or API URL changes

    useEffect(() => {
        const fetchRecordStatsData = async () => {
            // Only fetch if the 'player' tab is active AND modal is open AND playerId exists
            if (activeTab === 'global' && isOpen) {
                setIsRecordStatsLoading(true);
                setRecordStatsError(null); // Clear previous errors


                try {
                    // Assuming an API endpoint like /players/{playerId}/word-length-histogram for GET
                    // You might need to use `makeRequest` if you have it in scope, but for `fetch`, it's direct.
                    const response = await makeRequest(`/games/global-stats`, 'GET');

                    if (response.success) {
                        setRecordStatsData(response.data);
                    } else {
                        const errorText = await response.message;
                        console.error("Error fetching global record stats:", errorText);
                        setRecordStatsError(`Failed to fetch histogram data: ${errorText}`);
                    }
                } catch (err) {
                    console.error("Network error fetching record stats data:", err);
                    setRecordStatsError(err.message || 'A network error occurred while loading histogram data.');
                } finally {
                    setIsRecordStatsLoading(false);
                }
            } else if (activeTab !== 'global') {
                // Optionally clear histogram data if moving away from the player stats tab
                setRecordStatsData(null);
                setRecordStatsError(null);
            }
        };

        fetchRecordStatsData();
    }, [activeTab, isOpen, apiUrl]); // Re-run when tab, modal state, player ID, or API URL changes

    return (
        <Modal className="leaderboard" isOpen={isOpen} onClose={onClose}>
            <h2>Bwrdd arweinwyr</h2>
            {!playerId &&
                <div>
                    Allwch chi guro'r sgôr uchel? Cofrestrwch a Mewngofnodwch i herio'r arweinwyr.
                </div>
            }
            <div className="leaderboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
                    onClick={() => handleTabClick('daily')}
                >
                    Dyddiol
                </button>
                <button
                    className={`tab-button ${activeTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => handleTabClick('monthly')}
                >
                    Yn fisol
                </button>
                <button
                    className={`tab-button ${activeTab === 'player' ? 'active' : ''}`}
                    onClick={() => handleTabClick('player')}
                >
                    Eich ystadegau
                </button>
                <button
                    className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => handleTabClick('global')}
                >
                    Ystadegau Gorau
                </button>
            </div>

            {activeTab === 'daily' && (
                <div id="daily-leaderboard" className="tab-content">
                    {dailyLeaderboardData && dailyLeaderboardData.top20 && dailyLeaderboardData.top20.length > 0 ? (
                        <table style={{width: '100%'}}>
                            <thead>
                            <tr>
                                <th className="rank">Position</th>
                                <th className="name">Nickname</th>
                                <th className="score">Score</th>
                            </tr>
                            </thead>
                            <tbody>
                            {dailyLeaderboardData.top20.map((player, index) => (
                                <tr key={player.id ?? `daily-${index}`}
                                    className={(parseInt(player.id) === parseInt(playerId)) ? 'current-player' : ''}>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{player.nickname}</td>
                                    <td className="score">{player.score}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Loading daily leaderboard...</p>
                    )}
                </div>
            )}

            {activeTab === 'monthly' && (
                <div id="monthly-leaderboard" className="tab-content">
                    {monthlyLeaderboardData && monthlyLeaderboardData.top20 && monthlyLeaderboardData.top20.length > 0 ? (
                        <table style={{width: '100%'}}>
                            <thead>
                            <tr>
                                <th className="rank">Position</th>
                                <th className="name">Nickname</th>
                                <th className="score">Score</th>
                            </tr>
                            </thead>
                            <tbody>
                            {monthlyLeaderboardData.top20.map((player, index) => (
                                <tr key={player.id ?? `monthly-${index}`}
                                    className={player.id === playerId ? 'current-player' : ''}>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{player.nickname}</td>
                                    <td className="score">{player.score}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Loading monthly leaderboard...</p>
                    )}
                </div>

            )}

            {activeTab === 'player' && (
                <div id="player-statistics" className="tab-content">
                    {/* Conditional rendering for histogram */}
                    <h3>Your Drubble Stats</h3>
                    {!playerId ? (
                        <p>Log in to see your word statistics.</p>
                    ) : (
                        <>
                            {isPlayerStatsLoading && <p>Loading your game stats...</p>}
                            {playerStatsError &&
                                <p style={{color: 'red'}}>Error loading statistics: {playerStatsError}</p>}
                            {playerStatsData && <PlayerStats stats={playerStatsData}/>}
                            {!isPlayerStatsLoading && !playerStatsError && !playerStatsData &&
                                <p>No word length data available yet. Play some games!</p>}
                        </>
                    )}
                    {!playerId ? (
                        <p>Log in to see your word statistics.</p>
                    ) : (
                        <>
                            {isHistogramLoading && <p>Loading word length histogram data...</p>}
                            {histogramError &&
                                <p style={{color: 'red'}}>Error loading statistics: {histogramError}</p>}
                            {wordLengthData && <WordLengthHistogram data={wordLengthData}/>}
                            {!isHistogramLoading && !histogramError && !wordLengthData &&
                                <p>No word length data available yet. Play some games!</p>}
                        </>
                    )}
                </div>

            )}
            {activeTab === 'global' && (
                <div id="global-statistics" className="tab-content">
                    <>
                        {isRecordStatsLoading && <p>Loading global record stats...</p>}
                        {recordStatsError &&
                            <p style={{color: 'red'}}>Error loading statistics: {recordStatsError}</p>}
                        {recordStatsData &&
                            <>
                            <div className="stats-grid">

                                <TopStatTable
                                    title="💥 Top 5 Game Scores"
                                    columns={[
                                        { label: "Score", key: "highest_game_score" },
                                        { label: "Nickname", key: "player.nickname" }
                                    ]}
                                    rows={recordStatsData.topGames}
                                />
                                <TopStatTable
                                    title="📊 Top 5 Average Scores"
                                    columns={[
                                        { label: "Avg Score", key: "average_score" },
                                        { label: "Games Played", key: "games_played" },
                                        { label: "Nickname", key: "nickname" }
                                    ]}
                                    rows={recordStatsData.topAverages}
                                />
                                <TopStatTable
                                    title="🏆 Top 5 Word Scores"
                                    columns={[
                                        { label: "Score", key: "highest_word_score" },
                                        { label: "Word", key: "highest_scoring_word" },
                                        { label: "Nickname", key: "player.nickname" }
                                    ]}
                                    rows={recordStatsData.topWords}
                                />

                            </div>
                            </>
                        }
                        {!isRecordStatsLoading && !recordStatsError && !recordStatsData &&
                            <p>No word length data available yet. Play some games!</p>}
                    </>
                </div>
            )}
        </Modal>
    );
}

export default LeaderboardModal;

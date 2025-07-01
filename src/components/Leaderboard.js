import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './css/Leaderboard.css';
import WordLengthHistogram from './WordLengthHistogram'; // Adjust path if needed
import PlayerStats from "./PlayerStats";
import useApiRequest from './useApiRequest';
import TopStatTable from "./TopStatTable";
import { useTranslation } from 'react-i18next';

function LeaderboardModal({ playerId, isOpen, onClose }) {
    const [dailyLeaderboardData, setDailyLeaderboardData] = useState([]);
    const [yesterdayDailyLeaderboardData, setYesterdayDailyLeaderboardData] = useState(null);
    const [selectedDailyView, setSelectedDailyView] = useState('today'); // 'today' or 'yesterday'

    const [monthlyLeaderboardData, setMonthlyLeaderboardData] = useState([]);
    const [previousMonthLeaderboardData, setPreviousMonthLeaderboardData] = useState(null);
    const [selectedMonthlyView, setSelectedMonthlyView] = useState('current'); // 'current' or 'previous'

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

    const [leaderboardLoading, setLeaderboardLoading] = useState(false); // New loading state for leaderboards
    const [leaderboardError, setLeaderboardError] = useState(null); // New error state for leaderboards

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';

    const { t, i18n } = useTranslation();

    const { makeRequest } = useApiRequest(apiUrl);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleDailyViewChange = (view) => {
        setSelectedDailyView(view);
    };

    const handleMonthlyViewChange = (view) => {
        setSelectedMonthlyView(view);
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!isOpen) return;

            setLeaderboardLoading(true);
            setLeaderboardError(null); // Clear previous errors

            try {
                const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
                const response = await fetch(`${apiUrl}/leaderboard?date=${today}&player_id=${playerId}`);
                if (response.ok) {
                    const data = await response.json();

                    setDailyLeaderboardData(data.daily);
                    setYesterdayDailyLeaderboardData(data.yesterday || null);
                    setMonthlyLeaderboardData(data.monthly);
                    setPreviousMonthLeaderboardData(data.prevMonth || null);

                } else {
                    // alert('Wedi methu â nôl y bwrdd arweinwyr.');
                    const errorText = await response.text();
                    console.error("Failed to fetch combined leaderboards:", errorText);
                    setLeaderboardError(t('leaderboard.failed'));
                }
            } catch (error) {
                // alert('Digwyddodd gwall.');
                console.error('Error fetching combined leaderboards:', error);
                setLeaderboardError(t('leaderboard.network-error'));
            } finally {
                setLeaderboardLoading(false);
            }
        };

        fetchLeaderboard();

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
                        setHistogramError(t('leaderboard.histogram.response.fetch-failed', {errorTMessage: errorText}));
                    }
                } catch (err) {
                    console.error("Network error fetching word length histogram:", err);
                    setHistogramError(err.message || t('leaderboard.histogram.response.network-error'));
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
                        setRecordStatsError(t('leaderboard.records.response.fetch-failed', {errorTMessage: errorText}));
                    }
                } catch (err) {
                    console.error("Network error fetching record stats data:", err);
                    setRecordStatsError(err.message || t('leaderboard.records.response.network-error'));
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

    // Function to get the currently active daily data
    const getActiveDailyData = () => {
        if (selectedDailyView === 'today') {
            return dailyLeaderboardData;
        } else {
            return yesterdayDailyLeaderboardData;
        }
    };

    // Function to get the currently active monthly data
    const getActiveMonthlyData = () => {
        if (selectedMonthlyView === 'current') {
            return monthlyLeaderboardData;
        } else {
            return previousMonthLeaderboardData;
        }
    };

    const currentDailyData = getActiveDailyData();
    const currentMonthlyData = getActiveMonthlyData();

    return (
        <Modal className="leaderboard" isOpen={isOpen} onClose={onClose}>
            <h2>{t('leaderboard.title')}</h2>
            {!playerId &&
                <div>{t('leaderboard.content.not-logged-in')}</div>
            }
            <div className="leaderboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
                    onClick={() => handleTabClick('daily')}
                >{t('leaderboard.tabs.daily')}</button>
                <button
                    className={`tab-button ${activeTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => handleTabClick('monthly')}
                >{t('leaderboard.tabs.monthly')}</button>
                <button
                    className={`tab-button ${activeTab === 'player' ? 'active' : ''}`}
                    onClick={() => handleTabClick('player')}
                >{t('leaderboard.tabs.your-stats')}</button>
                <button
                    className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => handleTabClick('global')}
                >{t('leaderboard.tabs.global-stats')}</button>
            </div>

            {leaderboardLoading && <p>{t('leaderboard.loading')}</p>}
            {leaderboardError && <p style={{ color: 'red' }}>{t('leaderboard.loading-error')} {leaderboardError}</p>}

            {activeTab === 'daily' && !leaderboardLoading && !leaderboardError && (
                <div id="daily-leaderboard" className="tab-content">
                    <div className="daily-monthly-toggle">
                        <button
                            className={`special key ${selectedDailyView === 'today' ? 'active' : ''}`}
                            onClick={() => handleDailyViewChange('today')}
                        >{t('leaderboard.today')}</button>
                        <button
                            className={`special key ${selectedDailyView === 'yesterday' ? 'active' : ''}`}
                            onClick={() => handleDailyViewChange('yesterday')}
                        >{t('leaderboard.yesterday')}</button>
                    </div>

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
                                <tr key={player.id ?? `daily-${selectedDailyView}-${index}`}
                                    className={(parseInt(player.id) === parseInt(playerId)) ? 'current-player' : ''}>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{player.nickname}</td>
                                    <td className="score">{player.score}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>{t('leaderboard.stats.table.no-data')}</p>
                    )}
                </div>
            )}

            {activeTab === 'monthly' && !leaderboardLoading && !leaderboardError && (
                <div id="monthly-leaderboard" className="tab-content">
                    <div className="daily-monthly-toggle">
                        <button
                            className={`special key  ${selectedMonthlyView === 'current' ? 'active' : ''}`}
                            onClick={() => handleMonthlyViewChange('current')}
                        >{t('leaderboard.this-month')}</button>
                        <button
                            className={`special key  ${selectedMonthlyView === 'previous' ? 'active' : ''}`}
                            onClick={() => handleMonthlyViewChange('previous')}
                        >{t('leaderboard.last-month')}</button>
                    </div>

                    {currentMonthlyData && currentMonthlyData.top20 && currentMonthlyData.top20.length > 0 ? (
                        <table style={{ width: '100%' }}>
                            <thead>
                            <tr>
                                <th className="rank">{t('leaderboard.stats.table.position')}</th>
                                <th className="name">{t('leaderboard.stats.table.nickname')}</th>
                                <th className="score">{t('leaderboard.stats.table.score')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentMonthlyData.top20.map((player, index) => (
                                <tr key={player.id ?? `monthly-${selectedMonthlyView}-${index}`}
                                    className={player.id === playerId ? 'current-player' : ''}>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{player.nickname}</td>
                                    <td className="score">{player.score}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>{t('leaderboard.stats.table.no-data')}</p>
                    )}
                </div>
            )}

            {activeTab === 'player' && (
                <div id="player-statistics" className="tab-content">
                    {/* Conditional rendering for histogram */}
                    <h3>{t('leaderboard.stats.your-stats.title', { sitename : process.env.REACT_APP_SITE_NAME})}</h3>
                    {!playerId ? (
                        <p>{t('leaderboard.stats.your-stats.not-logged-in')}</p>
                    ) : (
                        <>
                            {isPlayerStatsLoading && <p>{t('leaderboard.stats.your-stats.loading')}</p>}
                            {playerStatsError &&
                                <p style={{color: 'red'}}>{t('leaderboard.stats.your-stats.loading-error')} {playerStatsError}</p>}
                            {playerStatsData && <PlayerStats stats={playerStatsData}/>}
                            {!isPlayerStatsLoading && !playerStatsError && !playerStatsData &&
                                <p>{t('leaderboard.stats.your-stats.no-data')}</p>}
                        </>
                    )}
                    {!playerId ? (
                        <p>{t('leaderboard.stats.your-stats.not-logged-in')}</p>
                    ) : (
                        <>
                            {isHistogramLoading && <p>{t('leaderboard.stats.your-stats.loading')}</p>}
                            {histogramError &&
                                <p style={{color: 'red'}}>{t('leaderboard.stats.your-stats.loading-error')} {histogramError}</p>}
                            {wordLengthData && <WordLengthHistogram data={wordLengthData}/>}
                            {!isHistogramLoading && !histogramError && !wordLengthData &&
                                <p>{t('leaderboard.stats.your-stats.no-data')}</p>}
                        </>
                    )}
                </div>

            )}
            {activeTab === 'global' && (
                <div id="global-statistics" className="tab-content">
                    {!playerId ? (
                        <p>{t('leaderboard.stats.record-stats.not-logged-in', { siteName : process.env.REACT_APP_SITE_NAME})}</p>
                    ) : (
                    <>
                        {isRecordStatsLoading && <p>{t('leaderboard.stats.your-stats.loading')}</p>}
                        {recordStatsError &&
                            <p style={{color: 'red'}}>{t('leaderboard.stats.your-stats.loading-error')} {recordStatsError}</p>}
                        {recordStatsData &&
                            <>
                            <div className="stats-grid">

                                <TopStatTable
                                    title="💥 5 sgôr gêm orau"
                                    columns={[
                                        { label: t('leaderboard.stats.table.score'), key: "highest_game_score" },
                                        { label: t('leaderboard.stats.table.nickname'), key: "player.nickname" }
                                    ]}
                                    rows={recordStatsData.topGames}
                                />
                                <TopStatTable
                                    title="📊 5 Sgôr Cyfartalog Uchaf"
                                    columns={[
                                        { label: t('leaderboard.stats.table.average'), key: "average_score" },
                                        { label: t('leaderboard.stats.table.games-played'), key: "games_played" },
                                        { label: t('leaderboard.stats.table.nickname'), key: "nickname" }
                                    ]}
                                    rows={recordStatsData.topAverages}
                                />
                                <TopStatTable
                                    title="🏆 5 Sgor Geiriau Gorau"
                                    columns={[
                                        { label: t('leaderboard.stats.table.score'), key: "highest_word_score" },
                                        { label: t('leaderboard.stats.table.word'), key: "highest_scoring_word" },
                                        { label: t('leaderboard.stats.table.nickname'), key: "player.nickname" }
                                    ]}
                                    rows={recordStatsData.topWords}
                                />

                            </div>
                            </>
                        }
                        {!isRecordStatsLoading && !recordStatsError && !recordStatsData &&
                            <p>{t('leaderboard.stats.your-stats.no-data')}</p>}
                    </>
                    )}
                </div>
            )}
        </Modal>
    );
}

export default LeaderboardModal;

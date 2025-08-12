// src/components/App.js
import React, { useState, useEffect } from "react";
import './App.css';
import Panagram from "./components/Panagram";
import { ThemeProvider } from './ThemeContext';
import WelcomePage from "./components/WelcomePage";
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import DeleteRequestHelp from './components/DeleteRequestHelp';
import LeaguesPage from "./components/LeaguesPage";
import {clear} from "@testing-library/user-event/dist/clear";

// MainAppContent component remains the same
const MainAppContent = ({
                            playerId, playerName, player, setPlayer, setPlayerId, setPlayerName, setIsGuest,
                            setPlayerPrefReceiveNewsletter, setPlayerPrefReceivePrompts,
                            openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad, handleOpenLeaguesModal,
                            hasPlayedToday
                        }) => (
    <>
        <Panagram
            playerId={playerId}
            playerName={playerName}
            player={player}
            setPlayer={setPlayer}
            setPlayerId={setPlayerId}
            setPlayerName={setPlayerName}
            setIsGuest={setIsGuest}
            setPlayerPrefReceiveNewsletter={setPlayerPrefReceiveNewsletter}
            setPlayerPrefReceivePrompts={setPlayerPrefReceivePrompts}
            openAccountModalOnGameLoad={openAccountModalOnGameLoad}
            setOpenAccountModalOnGameLoad={setOpenAccountModalOnGameLoad}
            handleOpenLeaguesModal={handleOpenLeaguesModal}
            hasPlayedToday={hasPlayedToday}
        />
    </>
);

function App() {
    // State declarations remain the same
    const [player, setPlayer] = useState(null);
    const [playerId, setPlayerId] = useState(localStorage.getItem('playerId'));
    const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') ?? "Guest");
    const [isGuest, setIsGuest] = useState(true);
    const [playerPrefReceiveNewsletter, setPlayerPrefReceiveNewsletter] = useState(localStorage.getItem('playerPrefReceiveNewsletter'));
    const [playerPrefReceivePrompts, setPlayerPrefReceivePrompts] = useState(localStorage.getItem('playerPrefReceivePrompts'));
    const [showWelcomePage, setShowWelcomePage] = useState(true);
    const [openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLeaguesModal, setShowLeaguesModal] = useState(false);

    const [hasPlayedToday, setHasPlayedToday] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    const { t, i18n } = useTranslation();

    // --- SOLUTION: Add this useEffect hook ---
    useEffect(() => {
        const fetchInitialPlayerData = async () => {
            const storedPlayerId = localStorage.getItem('playerId');
            const authToken = localStorage.getItem('authToken');

            if (storedPlayerId && authToken) {
                try {
                    const baseUrl = process.env.REACT_APP_API_URL;
                    const response = await fetch(`${baseUrl}/api/players/${storedPlayerId}`, {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                            'Accept-Language': i18n.language // Ensure language is sent
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (data.success && data.player) {
                            setPlayer(data.player);
                            setPlayerId(data.player.id);
                            setPlayerName(data.player.nickname);
                            setIsGuest(false); // Set to false when a player is successfully loaded
                            setPlayerPrefReceiveNewsletter(data.player.pref_receive_newsletter === '1' || data.player.pref_receive_newsletter === true);
                            setPlayerPrefReceivePrompts(data.player.pref_receive_prompts === '1' || data.player.pref_receive_prompts === true);

                            //Now get player game status
                            const gameResponse = await fetch(`${baseUrl}/api/players/${data.player.id}/today`, {
                                headers: {
                                    'Accept': 'application/json',
                                    'Authorization': `Bearer ${authToken}`,
                                    'Accept-Language': i18n.language
                                },
                            });
                            const gameData = await gameResponse.json();
                            if (gameData.success) {
                                setHasPlayedToday(gameData.hasPlayedToday);
                                setGameComplete(gameData.complete);
                            }

                        } else {
                            // If API says not successful, clear local storage and set to guest
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('playerId');
                            localStorage.removeItem('playerName');
                            setPlayer(null);
                            setPlayerId(null);
                            setPlayerName(null);
                            setIsGuest(true);
                        }
                    } else {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('playerId');
                        localStorage.removeItem('playerName');
                        setPlayer(null);
                        setPlayerId(null);
                        setPlayerName(null);
                        setIsGuest(true);
                    }
                } catch (error) {
                    console.error("App.js useEffect: Error fetching initial player data:", error);
                    // On error, revert to guest state
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('playerId');
                    localStorage.removeItem('playerName');
                    setPlayer(null);
                    setPlayerId(null);
                    setPlayerName(null);
                    setIsGuest(true);
                }
            } else {
                // No stored player ID or token, so it's definitively a guest session from the start
                setPlayer(null);
                setPlayerId(null);
                setPlayerName(null);
                setIsGuest(true);
            }
            setIsLoading(false); // Always set loading to false after the check
        };

        fetchInitialPlayerData();
    }, []);
    // --- End of new code ---

    if (isLoading) {
        return <div className="loading-spinner">{t('loading.app')}</div>; // Or a proper spinner component
    }

    const handlePlayAsGuest = () => {
        setIsGuest(true);
        setPlayer(null); // Explicitly set player to null for guests
        setPlayerId(null);
        setPlayerName(null);
        setShowWelcomePage(false);
        setOpenAccountModalOnGameLoad(false);
    };

    const handlePlayAsPlayer = () => {
        setIsGuest(false);
        setShowWelcomePage(false);
        setOpenAccountModalOnGameLoad(false);
    };

    const handleLoginOption = () => {
        setShowWelcomePage(false);
        setOpenAccountModalOnGameLoad(true);
    };

    const handleLogoutOption = () => {
        setShowWelcomePage(true);
        setOpenAccountModalOnGameLoad(false);
        clearClientSideData();
    };

    const clearClientSideData = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");
        localStorage.removeItem("playerPrefReceiveNewsletter");
        localStorage.removeItem("playerPrefReceivePrompts");
        localStorage.removeItem("player");
        setPlayerName(null);
        setPlayerId(null);
        setPlayer(null);
        setIsGuest(true);
        setShowWelcomePage(true);
    };

    //handler to open the leagues modal
    const handleOpenLeaguesModal = () => {
        setShowLeaguesModal(true);
    };

    // Handler to close the leagues modal
    const handleCloseLeaguesModal = () => {
        setShowLeaguesModal(false);
    };

    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    <header className="App-header">
                        <img src={`/${process.env.REACT_APP_SITE_NAME_LOWER}.png`}
                             alt={`Logo ${process.env.REACT_APP_SITE_NAME}`}/>
                    </header>
                    <Routes>
                        <Route path="/" element={
                            showWelcomePage ? (
                                <WelcomePage
                                    playerId={playerId}
                                    playerName={playerName}
                                    onPlayAsGuest={handlePlayAsGuest}
                                    onPlayAsPlayer={handlePlayAsPlayer}
                                    onLoginClick={handleLoginOption}
                                    onLogoutClick={handleLogoutOption}
                                    hasPlayedToday={hasPlayedToday}
                                    gameComplete={gameComplete}
                                />
                            ) : (
                                <MainAppContent
                                    playerId={playerId} playerName={playerName} player={player} setPlayer={setPlayer}
                                    setPlayerId={setPlayerId} setPlayerName={setPlayerName} setIsGuest={setIsGuest}
                                    setPlayerPrefReceiveNewsletter={setPlayerPrefReceiveNewsletter}
                                    setPlayerPrefReceivePrompts={setPlayerPrefReceivePrompts}
                                    openAccountModalOnGameLoad={openAccountModalOnGameLoad}
                                    setOpenAccountModalOnGameLoad={setOpenAccountModalOnGameLoad}
                                    hasPlayedToday={hasPlayedToday}
                                />
                            )
                        }/>
                        <Route path="/data-delete-help" element={<DeleteRequestHelp/>}/>
                        <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
                        <Route path="/terms-of-service" element={<TermsOfService/>}/>
                    </Routes>
                </div>
            </Router>

            {/* Conditionally render the LeaguesPage as a full-screen modal */}
            <LeaguesPage
                playerId={playerId}
                onReturnToMain={handleCloseLeaguesModal}
            />

        </ThemeProvider>
    );
}

export default App;
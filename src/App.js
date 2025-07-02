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

// MainAppContent component remains the same
const MainAppContent = ({
                            playerId, playerName, player, setPlayer, setPlayerId, setPlayerName, setIsGuest,
                            setPlayerPrefReceiveNewsletter, setPlayerPrefReceivePrompts,
                            openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad
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

    const { i18n } = useTranslation();

    // --- SOLUTION: Add this useEffect hook ---
    useEffect(() => {
        const fetchInitialPlayerData = async () => {
            const storedPlayerId = localStorage.getItem('playerId');
            const authToken = localStorage.getItem('auth_token');

            console.log("App.js useEffect: Starting fetchInitialPlayerData.");
            console.log("App.js useEffect: storedPlayerId:", storedPlayerId);
            console.log("App.js useEffect: authToken:", authToken ? "Exists" : "Does Not Exist");

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

                        console.log("App.js useEffect: API Response Data:", data);

                        if (data.success && data.player) {
                            setPlayer(data.player);
                            setPlayerId(data.player.id);
                            setPlayerName(data.player.nickname);
                            setIsGuest(false); // Set to false when a player is successfully loaded
                            setPlayerPrefReceiveNewsletter(data.player.pref_receive_newsletter === '1' || data.player.pref_receive_newsletter === true);
                            setPlayerPrefReceivePrompts(data.player.pref_receive_prompts === '1' || data.player.pref_receive_prompts === true);
                            console.log("App.js useEffect: Player data SET in App.js state:", data.player);
                        } else {
                            console.error("App.js useEffect: Failed to retrieve player data from API (data.success or data.player issue):", data.message);
                            // If API says not successful, clear local storage and set to guest
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('playerId');
                            localStorage.removeItem('playerName');
                            setPlayer(null);
                            setPlayerId(null);
                            setPlayerName("Guest");
                            setIsGuest(true);
                            console.log("App.js useEffect: Player set to GUEST (API failure).");
                        }
                    } else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('playerId');
                        localStorage.removeItem('playerName');
                        setPlayer(null);
                        setPlayerId(null);
                        setPlayerName("Guest");
                        setIsGuest(true);
                        console.log("App.js useEffect: Player set to GUEST (Catch block error).");
                    }
                } catch (error) {
                    console.error("App.js useEffect: Error fetching initial player data:", error);
                    // On error, revert to guest state
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('playerId');
                    localStorage.removeItem('playerName');
                    setPlayer(null);
                    setPlayerId(null);
                    setPlayerName("Guest");
                    setIsGuest(true);
                }
            } else {
                // No stored player ID or token, so it's definitively a guest session from the start
                console.log("App.js useEffect: No stored Player ID or Auth Token found. Setting to Guest.");
                setPlayer(null);
                setPlayerId(null);
                setPlayerName("Guest");
                setIsGuest(true);
            }
            console.log("App.js useEffect: Setting isLoading to FALSE.");
            setIsLoading(false); // Always set loading to false after the check
        };

        fetchInitialPlayerData();
    }, []);
    // --- End of new code ---

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>; // Or a proper spinner component
    }

    const handlePlayAsGuest = () => {
        setIsGuest(true);
        setPlayer(null); // Explicitly set player to null for guests
        setPlayerId(null);
        setPlayerName("Guest");
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
                                    onPlayAsGuest={handlePlayAsGuest}
                                    onPlayAsPlayer={handlePlayAsPlayer}
                                    onLoginClick={handleLoginOption}
                                />
                            ) : (
                                <MainAppContent
                                    playerId={playerId} playerName={playerName} player={player} setPlayer={setPlayer}
                                    setPlayerId={setPlayerId} setPlayerName={setPlayerName} setIsGuest={setIsGuest}
                                    setPlayerPrefReceiveNewsletter={setPlayerPrefReceiveNewsletter}
                                    setPlayerPrefReceivePrompts={setPlayerPrefReceivePrompts}
                                    openAccountModalOnGameLoad={openAccountModalOnGameLoad}
                                    setOpenAccountModalOnGameLoad={setOpenAccountModalOnGameLoad}
                                />
                            )
                        }/>
                        <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
                        <Route path="/terms-of-service" element={<TermsOfService/>}/>
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
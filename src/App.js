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
            const authToken = localStorage.getItem('auth_token'); // Assuming you use a token for auth

            if (storedPlayerId && authToken) {
                try {
                    const baseUrl = process.env.REACT_APP_API_URL;
                    // You need an endpoint that returns the full player object by ID.
                    // Let's assume it is `/api/players/{id}` and it returns { success: true, player: {...} }
                    const response = await fetch(`${baseUrl}/api/players/${storedPlayerId}`, {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.player) {
                            // This is the key part: set the player object in the state
                            setPlayer(data.player);
                            // Also, update all related states to ensure consistency
                            setPlayerId(data.player.id);
                            setPlayerName(data.player.nickname);
                            setIsGuest(false);
                            setPlayerPrefReceiveNewsletter(data.player.pref_receive_newsletter === '1' || data.player.pref_receive_newsletter === true);
                            setPlayerPrefReceivePrompts(data.player.pref_receive_prompts === '1' || data.player.pref_receive_prompts === true);
                        } else {
                            // Handle cases where the API call is ok, but the request is not successful (e.g., player not found)
                            console.error("Failed to retrieve player data:", data.message);
                            setPlayer(null); // Ensure player is null if data is invalid
                        }
                    } else {
                        // Handle auth errors, like an expired token
                        console.error("Authentication failed. Token might be invalid.");
                        // It's good practice to clear stale login data
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('playerId');
                        localStorage.removeItem('playerName');
                        setPlayer(null);
                    }
                } catch (error) {
                    console.error("Error fetching initial player data:", error);
                } finally {
                    setIsLoading(false); // <-- Set loading to false when done
                }
            }
        };

        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
            fetchInitialPlayerData();
        } else {
            // If there's no token, we're not loading anything.
            setIsLoading(false);
        }
    }, []); // The empty array [] ensures this effect runs only once on component mount.
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
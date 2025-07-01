// src/App.js
import React, {useState, useEffect} from "react";
import './App.css';
import Panagram from "./components/Panagram";
import { ThemeProvider } from './ThemeContext';
import WelcomePage from "./components/WelcomePage";
import { useTranslation } from 'react-i18next';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// Define MainAppContent OUTSIDE the App component (as you already have it)
const MainAppContent = ({
                            playerId, playerName, player, setPlayer, setPlayerId, setPlayerName, setIsGuest,
                            setPlayerPrefReceiveNewsletter, setPlayerPrefReceivePrompts,
                            openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad
                        }) => (
    <>
        <Panagram
            playerId={playerId} playerName={playerName} player={player} setPlayer={setPlayer}
            setPlayerId={setPlayerId} setPlayerName={setPlayerName} setIsGuest={setIsGuest}
            setPlayerPrefReceiveNewsletter={setPlayerPrefReceiveNewsletter}
            setPlayerPrefReceivePrompts={setPlayerPrefReceivePrompts}
            openAccountModalOnGameLoad={openAccountModalOnGameLoad}
            setOpenAccountModalOnGameLoad={setOpenAccountModalOnGameLoad}
        />
    </>
);

function App() {
    const { i18n } = useTranslation();
    const [playerId, setPlayerId] = useState(() => localStorage.getItem('playerId'));
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Guest');
    // Initialize player as null or a default object if no playerId exists.
    // The useEffect below will populate it if playerId is present.
    const [player, setPlayer] = useState(null);
    const [isGuest, setIsGuest] = useState(() => !localStorage.getItem('playerId'));
    const [openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad] = useState(false);

    // Base URL for API requests
    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api'; // Assuming your API endpoint is /api

    // --- IMPORTANT: This useEffect is crucial for populating the 'player' object ---
    useEffect(() => {
        const fetchAndSetPlayerProfile = async () => {
            if (playerId) {
                try {
                    // Make an API request to fetch the full player profile using the playerId
                    // You might also need to send an authentication token if your API requires it
                    const authToken = localStorage.getItem('authToken'); // Assuming you store an auth token
                    const headers = {
                        'Content-Type': 'application/json',
                        ...(authToken && { 'Authorization': `Bearer ${authToken}` }) // Add auth header if token exists
                    };

                    const response = await fetch(`${apiUrl}/players/${playerId}`, { headers }); // Adjust endpoint as needed
                    if (response.ok) {
                        const data = await response.json();
                        // Assuming the response body contains a 'player' object
                        if (data.player) {
                            setPlayer(data.player); // Set the full player object
                            setPlayerName(data.player.nickname); // Ensure playerName is also synced from the fetched data
                            setIsGuest(false);
                            // Also update localStorage for consistency if any preferences change on server
                            localStorage.setItem('playerName', data.player.nickname);
                            localStorage.setItem('playerPrefReceiveNewsletter', data.player.pref_receive_newsletter);
                            localStorage.setItem('playerPrefReceivePrompts', data.player.pref_receive_prompts);
                        } else {
                            // If API call successful but 'player' object is missing, treat as guest
                            console.error("API response missing player object.");
                            handleLogout(); // Call a logout-like function to clear state
                        }
                    } else {
                        // Handle cases where fetching profile fails (e.g., invalid ID, token expired)
                        console.error("Failed to fetch player profile:", response.status, response.statusText);
                        handleLogout(); // Clear local storage and reset state
                    }
                } catch (error) {
                    console.error("Error fetching player profile:", error);
                    handleLogout(); // Clear local storage and reset state
                }
            } else {
                // If no playerId in localStorage, ensure player object is null and set as guest
                setPlayer(null);
                setPlayerName('Guest');
                setIsGuest(true);
            }
        };

        fetchAndSetPlayerProfile();
    }, [playerId]); // Re-run this effect whenever playerId changes (e.g., on initial load or after login/logout)

    // A utility function to handle clearing player data
    const handleLogout = () => {
        setPlayer(null);
        setPlayerId(null);
        setPlayerName('Guest');
        setIsGuest(true);
        localStorage.removeItem('playerId');
        localStorage.removeItem('playerName');
        localStorage.removeItem('authToken'); // Clear auth token if present
        localStorage.removeItem('playerPrefReceiveNewsletter');
        localStorage.removeItem('playerPrefReceivePrompts');
        // You might want to navigate to welcome page or refresh here
    };

    // Handler passed to WelcomePage to open account modal directly
    const handleLoginOption = () => {
        setOpenAccountModalOnGameLoad(true);
    };

    // ... (rest of your App.js, including routes and JSX) ...

    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    {/* LanguageSwitcher and other global components if any */}
                    <Routes>
                        <Route path="/" element={
                            isGuest ? (
                                <WelcomePage
                                    playerId={playerId} // Still pass playerId to WelcomePage if needed there
                                    onPlayAsGuest={() => setIsGuest(true)}
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
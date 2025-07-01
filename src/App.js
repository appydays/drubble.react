// src/components/App.js
import React, {useState, useEffect} from "react";
import './App.css';
import Panagram from "./components/Panagram";
import { ThemeProvider } from './ThemeContext';
import WelcomePage from "./components/WelcomePage";
import { useTranslation } from 'react-i18next';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// Define MainAppContent OUTSIDE the App component
// It needs to accept the props it will receive from App
const MainAppContent = ({
                            playerId, playerName, player, setPlayer, setPlayerId, setPlayerName, setIsGuest,
                            setPlayerPrefReceiveNewsletter, setPlayerPrefReceivePrompts, // <-- These are now correctly passed
                            openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad
                        }) => (
    <>
        <Panagram
            playerId={playerId} playerName={playerName} player={player} setPlayer={setPlayer}
            setPlayerId={setPlayerId} setPlayerName={setPlayerName} setIsGuest={setIsGuest}
            setPlayerPrefReceiveNewsletter={setPlayerPrefReceiveNewsletter} // <-- Correctly passed to Panagram
            setPlayerPrefReceivePrompts={setPlayerPrefReceivePrompts}     // <-- Correctly passed to Panagram
            openAccountModalOnGameLoad={openAccountModalOnGameLoad}
            setOpenAccountModalOnGameLoad={setOpenAccountModalOnGameLoad}
        />
    </>
);

function App() {
    const { i18n } = useTranslation();
    const [playerId, setPlayerId] = useState(() => localStorage.getItem('playerId'));
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Guest');
    const [player, setPlayer] = useState(null);
    const [isGuest, setIsGuest] = useState(() => !localStorage.getItem('playerId'));
    const [openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad] = useState(false);

    // --- NEW STATE DECLARATIONS FOR PLAYER PREFERENCES ---
    const [playerPrefReceiveNewsletter, setPlayerPrefReceiveNewsletter] = useState(() => {
        // localStorage stores strings, convert to boolean
        const storedPref = localStorage.getItem('playerPrefReceiveNewsletter');
        return storedPref === 'true';
    });
    const [playerPrefReceivePrompts, setPlayerPrefReceivePrompts] = useState(() => {
        const storedPref = localStorage.getItem('playerPrefReceivePrompts');
        return storedPref === 'true';
    });
    // --- END NEW STATE DECLARATIONS ---


    // Base URL for API requests
    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';

    // This useEffect is crucial for populating the 'player' object and preferences
    useEffect(() => {
        const fetchAndSetPlayerProfile = async () => {
            if (playerId) {
                try {
                    const authToken = localStorage.getItem('authToken');
                    const headers = {
                        'Content-Type': 'application/json',
                        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                    };

                    const response = await fetch(`${apiUrl}/players/${playerId}`, { headers });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.player) {
                            setPlayer(data.player);
                            setPlayerName(data.player.nickname);
                            setIsGuest(false);

                            // --- IMPORTANT: Update the preference states here from fetched data ---
                            setPlayerPrefReceiveNewsletter(data.player.pref_receive_newsletter);
                            setPlayerPrefReceivePrompts(data.player.pref_receive_prompts);
                            // ---

                            localStorage.setItem('playerName', data.player.nickname);
                            localStorage.setItem('playerPrefReceiveNewsletter', data.player.pref_receive_newsletter);
                            localStorage.setItem('playerPrefReceivePrompts', data.player.pref_receive_prompts);
                        } else {
                            console.error("API response missing player object.");
                            handleLogout();
                        }
                    } else {
                        console.error("Failed to fetch player profile:", response.status, response.statusText);
                        handleLogout();
                    }
                } catch (error) {
                    console.error("Error fetching player profile:", error);
                    handleLogout();
                }
            } else {
                setPlayer(null);
                setPlayerName('Guest');
                setIsGuest(true);
                // Ensure preferences are reset for guest
                setPlayerPrefReceiveNewsletter(false);
                setPlayerPrefReceivePrompts(false);
            }
        };

        fetchAndSetPlayerProfile();
    }, [playerId]);

    // A utility function to handle clearing player data
    const handleLogout = () => {
        setPlayer(null);
        setPlayerId(null);
        setPlayerName('Guest');
        setIsGuest(true);
        setPlayerPrefReceiveNewsletter(false); // Reset on logout
        setPlayerPrefReceivePrompts(false);   // Reset on logout
        localStorage.removeItem('playerId');
        localStorage.removeItem('playerName');
        localStorage.removeItem('authToken');
        localStorage.removeItem('playerPrefReceiveNewsletter');
        localStorage.removeItem('playerPrefReceivePrompts');
    };

    const handlePlayAsGuest = () => {
        setIsGuest(true);
        handleLogout(); // Ensure all player data is cleared if playing as guest
    };

    // Handler passed to WelcomePage to open account modal directly
    const handleLoginOption = () => {
        setOpenAccountModalOnGameLoad(true);
    };

    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={
                            isGuest ? (
                                <WelcomePage
                                    playerId={playerId}
                                    onPlayAsGuest={handlePlayAsGuest}
                                    onLoginClick={handleLoginOption}
                                />
                            ) : (
                                <MainAppContent
                                    playerId={playerId} playerName={playerName} player={player} setPlayer={setPlayer}
                                    setPlayerId={setPlayerId} setPlayerName={setPlayerName} setIsGuest={setIsGuest}
                                    setPlayerPrefReceiveNewsletter={setPlayerPrefReceiveNewsletter} // <-- Prop is now defined
                                    setPlayerPrefReceivePrompts={setPlayerPrefReceivePrompts}     // <-- Prop is now defined
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
import React, {useState, useEffect} from "react";
import './App.css';
import Panagram from "./components/Panagram";
import { ThemeProvider } from './ThemeContext';
import SettingsModal from "./components/SettingsModal"; // Keep if SettingsModal is used elsewhere or managed differently
import WelcomePage from "./components/WelcomePage";
import { useTranslation } from 'react-i18next';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

function App() {
    // Removed modal state, as Panagram will handle them
    // const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    // const [isLeaderboardModalOpen, setIsLeaderboardModalAsOpen] = useState(false);
    // const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    // const [isSplashHelpModalOpen, setIsSplashHelpModalOpen] = useState(false);

    const [player, setPlayer] = useState(null);
    const [playerId, setPlayerId] = useState(localStorage.getItem('playerId'));
    const [playerName, setPlayerName] = useState(localStorage.getItem('playerName')??"Guest");
    const [isGuest, setIsGuest] = useState(true);
    const [playerPrefReceiveNewsletter, setPlayerPrefReceiveNewsletter] = useState(localStorage.getItem('playerPrefReceiveNewsletter'));
    const [playerPrefReceivePrompts, setPlayerPrefReceivePrompts] = useState(localStorage.getItem('playerPrefReceivePrompts'));

    const [showWelcomePage, setShowWelcomePage] = useState(true);

    const { t } = useTranslation();

    useEffect(() => {
        if (window.cookieyes && typeof window.cookieyes.loadScript === 'function') {
            window.cookieyes.loadScript();
        }
    }, []);

    useEffect(() => {
        if (!showWelcomePage) {
            const storedToken = localStorage.getItem("auth_token");
            const storedPlayerId = localStorage.getItem("playerId");
            const storedPlayerName = localStorage.getItem("playerName");
            const storedNewsletterPref = localStorage.getItem('playerPrefReceiveNewsletter');
            const storedPromptsPref = localStorage.getItem('playerPrefReceivePrompts');

            if (storedToken && storedPlayerId && storedPlayerName) {
                setPlayerId(storedPlayerId);
                setPlayerName(storedPlayerName);
                setIsGuest(false);
                setPlayerPrefReceiveNewsletter(storedNewsletterPref);
                setPlayerPrefReceivePrompts(storedPromptsPref);

                // Reconstruct the player object here as well for App.js's state
                setPlayer({
                    id: storedPlayerId,
                    nickname: storedPlayerName,
                    pref_receive_newsletter: storedNewsletterPref,
                    pref_receive_prompts: storedPromptsPref,
                });

            } else {
                setIsGuest(true);
                setPlayerId(null);
                setPlayerName("Guest");
                setPlayerPrefReceiveNewsletter(0);
                setPlayerPrefReceivePrompts(0);
                setPlayer(null); // Ensure player is null for guests
            }
        }
    }, [showWelcomePage]);

    // This useEffect for reconstructing player object might be redundant if the above covers it,
    // or it might be needed for initial load if `showWelcomePage` doesn't immediately dismiss.
    // Consider if it's still necessary. If handleLoginSuccess in Panagram updates localStorage,
    // then on subsequent loads, the above useEffect will handle it.
    useEffect(() => {
        const storedPlayerId = localStorage.getItem('playerId');
        if (storedPlayerId) {
            const storedPlayerName = localStorage.getItem('playerName');
            const storedNewsletterPref = localStorage.getItem('playerPrefReceiveNewsletter');
            const storedPromptsPref = localStorage.getItem('playerPrefReceivePrompts');

            const loadedPlayer = {
                id: storedPlayerId,
                nickname: storedPlayerName,
                pref_receive_newsletter: storedNewsletterPref,
                pref_receive_prompts: storedPromptsPref,
            };
            setPlayer(loadedPlayer);
            setPlayerId(storedPlayerId);
            setPlayerName(storedPlayerName);
            setPlayerPrefReceiveNewsletter(storedNewsletterPref);
            setPlayerPrefReceivePrompts(storedPromptsPref);
            setIsGuest(false); // If player ID exists, they are not a guest
        } else {
            setIsGuest(true);
        }
    }, []); // Only run once on mount

    const handlePlayAsGuest = () => {
        setShowWelcomePage(false);
        setIsGuest(true);
        setPlayerId(null);
        setPlayerName("Guest");
        setPlayer(null); // Ensure player is null for guest
        localStorage.removeItem('playerId'); // Clear any previous player ID
        localStorage.removeItem('playerName');
        localStorage.removeItem('playerPrefReceiveNewsletter');
        localStorage.removeItem('playerPrefReceivePrompts');
        localStorage.removeItem('auth_token');
    };

    const handleLoginOption = () => {
        setShowWelcomePage(false);
        // This will now pass a prop to Panagram to open the modal
        // setIsAccountModalOpen(true); // This state no longer exists here directly for opening
    };

    const MainAppContent = () => (
        <>
            <header className="App-header">
                <img src={`/${process.env.REACT_APP_SITE_NAME_LOWER}.png`} alt={`Logo ${process.env.REACT_APP_SITE_NAME}`} />
            </header>

            <Panagram
                playerId={playerId}
                playerName={playerName}
                // Pass down player state and setters
                player={player}
                setPlayer={setPlayer}
                setPlayerId={setPlayerId}
                setPlayerName={setPlayerName}
                setIsGuest={setIsGuest}
                setPlayerPrefReceiveNewsletter={setPlayerPrefReceiveNewsletter}
                setPlayerPrefReceivePrompts={setPlayerPrefReceivePrompts}
                // isSplashHelpModalOpen prop removed, Panagram will manage
            />
            {/* SettingsModal might still be here if it's a global setting not tied to game */}
            {/* <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            /> */}
        </>
    );

    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={
                            showWelcomePage ? (
                                <WelcomePage
                                    playerId={playerId}
                                    onPlayAsGuest={handlePlayAsGuest}
                                    onLoginClick={handleLoginOption} // This click will just hide welcome page, Panagram will then handle opening modal
                                />
                            ) : (
                                <MainAppContent />
                            )
                        } />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
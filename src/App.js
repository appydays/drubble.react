// import logo from './logo.svg';
// import React from "react";
// import LetterTiles from "./LetterTiles";
// import './App.css';
//
// function App() {
//   return (
//       <div className="App">
//         <h1>Panagram</h1>
//         <LetterTiles />
//       </div>
//   );
// }
//
// export default App;

import React, {useState, useEffect} from "react";
import './App.css';
import Panagram from "./components/Panagram";
import AccountSettingsModal from "./components/Account";
import LeaderboardModal from "./components/Leaderboard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import LeaderBoardButton from "./components/atoms/LeaderBoardButton";
import SettingsButton from "./components/atoms/SettingsButton";
import AccountIcon from "./components/atoms/AccountIcon";
import SplashHelpModal from "./components/SplashHelpModal";
import HelpButton from "./components/atoms/HelpButton";
import { ThemeProvider } from './ThemeContext';
//import ThemeToggle from './components/atoms/ThemeToggle';
import SettingsModal from "./components/SettingsModal";
import WelcomePage from "./components/WelcomePage";
import { useTranslation } from 'react-i18next';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

function App() {

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isSplashHelpModalOpen, setIsSplashHelpModalOpen] = useState(false);
    const [player, setPlayer] = useState(null);
    const [playerId, setPlayerId] = useState(localStorage.getItem('playerId'));
    const [playerName, setPlayerName] = useState(localStorage.getItem('playerName')??"Guest");

    const [isGuest, setIsGuest] = useState(true);

    const [playerPrefReceiveNewsletter, setPlayerPrefReceiveNewsletter] = useState(localStorage.getItem('playerPrefReceiveNewsletter'));
    const [playerPrefReceivePrompts, setPlayerPrefReceivePrompts] = useState(localStorage.getItem('playerPrefReceivePrompts'));

    // New state to control showing the welcome page
    const [showWelcomePage, setShowWelcomePage] = useState(true);

    const { t } = useTranslation();

    useEffect(() => {
        // Re-trigger CookieYes DOM scan after mount
        if (window.cookieyes && typeof window.cookieyes.loadScript === 'function') {
            window.cookieyes.loadScript();
        }
    }, []);

    useEffect(() => {
        // Only try to load player data if not showing the welcome page
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
            } else {
                // If no stored login, ensure guest mode is active
                setIsGuest(true);
                setPlayerId(null); // No specific ID for guest
                setPlayerName("Guest");
                setPlayerPrefReceiveNewsletter(0);
                setPlayerPrefReceivePrompts(0);
            }
        }
    }, [showWelcomePage]);

    useEffect(() => {
        const storedPlayerId = localStorage.getItem('playerId');
        if (storedPlayerId) {
            const storedPlayerName = localStorage.getItem('playerName');
            const storedNewsletterPref = localStorage.getItem('playerPrefReceiveNewsletter');
            const storedPromptsPref = localStorage.getItem('playerPrefReceivePrompts');

            // Reconstruct the player object
            const loadedPlayer = {
                id: storedPlayerId,
                nickname: storedPlayerName,
                pref_receive_newsletter: storedNewsletterPref,
                pref_receive_prompts: storedPromptsPref,
            };
            setPlayer(loadedPlayer); // <--- Set the player object
            setPlayerId(storedPlayerId);
            setPlayerName(storedPlayerName);
            setPlayerPrefReceiveNewsletter(storedNewsletterPref);
            setPlayerPrefReceivePrompts(storedPromptsPref);
        }
    }, []);

    const handleSignupSuccess = (id) => {
        setPlayerId(id);
    }
    const handleLoginSuccess = (playerData) => {
        setPlayer(playerData);  // Update player state on login
        setPlayerName(playerData.nickname);
        setPlayerId(playerData.id);
        setPlayerPrefReceiveNewsletter(playerData.pref_receive_newsletter);
        setPlayerPrefReceivePrompts(playerData.pref_receive_prompts);

        localStorage.setItem('playerId', playerData.id);
        localStorage.setItem('playerName', playerData.nickname);
        localStorage.setItem('playerPrefReceiveNewsletter', playerData.pref_receive_newsletter);
        localStorage.setItem('playerPrefReceivePrompts', playerData.pref_receive_prompts);

    };

    // Function to update the player object
    const handlePlayerUpdate = (updatedPlayerData) => {
        setPlayer(updatedPlayerData);
        setPlayerName(updatedPlayerData.nickname);
        setPlayerPrefReceiveNewsletter(updatedPlayerData.pref_receive_newsletter);
        setPlayerPrefReceivePrompts(updatedPlayerData.pref_receive_prompts);

        localStorage.setItem('playerName', updatedPlayerData.nickname);
        localStorage.setItem('playerPrefReceiveNewsletter', updatedPlayerData.pref_receive_newsletter);
        localStorage.setItem('playerPrefReceivePrompts', updatedPlayerData.pref_receive_prompts);

    };

    // Handler for "Play as Guest" button
    const handlePlayAsGuest = () => {
        setShowWelcomePage(false); // Hide welcome page
        setIsGuest(true); // Ensure guest state is set
        setPlayerId(null); // No specific ID for guest
        setPlayerName("Guest"); // Default guest name
    };

    // Handler for "Log In" button
    const handleLoginOption = () => {
        setShowWelcomePage(false); // Hide welcome page
        setIsAccountModalOpen(true); // Open the login modal
    };

    const MainAppContent = () => (
        <>
            <header className="App-header">
                <img src={`/${process.env.REACT_APP_SITE_NAME_LOWER}.png`} alt={`Logo ${process.env.REACT_APP_SITE_NAME}`} />
            </header>

            <Panagram
                playerId={playerId}
                playerName={playerName}
                isSplashHelpModalOpen={isSplashHelpModalOpen}
            />

            <footer className="mobile-footer">
                {player ? (
                    <div className="mobile-footer__account">
                        <button className="user account"
                                onClick={() => setIsAccountModalOpen(true)}>
                            <FontAwesomeIcon icon={faUser} size="2x" color="#333" />
                        </button>
                        <p>{playerName ? playerName : t('footer.player-label', {playerName: playerId})}</p>
                    </div>
                ) : (
                    <div className="mobile-footer__account">
                        <button className="user signup"
                                onClick={() => setIsAccountModalOpen(true)}>
                            <AccountIcon isLoggedIn={!!player} />
                        </button>
                        <p>{t('footer.tabs.account')}</p>
                    </div>
                )}
                <div className="mobile-footer__settings">
                    <SettingsButton setIsSettingsModalOpen={setIsSettingsModalOpen} />
                    <p>{t('footer.tabs.settings')}</p>
                </div>
                <div className="mobile-footer__leaderboard">
                    <LeaderBoardButton setIsLeaderboardModalOpen={setIsLeaderboardModalOpen} />
                    <p>{t('footer.tabs.leaderboard')}</p>
                </div>
                <div className="mobile-footer__help">
                    <HelpButton setIsSplashHelpModalOpen={setIsSplashHelpModalOpen} />
                    <p>{t('footer.tabs.help')}</p>
                </div>

                <AccountSettingsModal
                    isOpen={isAccountModalOpen}
                    onClose={() => setIsAccountModalOpen(false)}
                    onSignupSuccess={handleSignupSuccess}
                    onLoginSuccess={handleLoginSuccess}
                    player={player}
                    onPlayerUpdate={handlePlayerUpdate}
                />
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                />
                <LeaderboardModal
                    playerId={playerId}
                    isOpen={isLeaderboardModalOpen}
                    onClose={() => setIsLeaderboardModalOpen(false)}
                />
                <SplashHelpModal
                    isOpen={isSplashHelpModalOpen}
                    onClose={() => setIsSplashHelpModalOpen(false)}
                />
            </footer>
        </>
    );

    return (
        <ThemeProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Route for the Welcome Page or Main App Content */}
                        <Route path="/" element={
                            showWelcomePage ? (
                                <WelcomePage
                                    playerId={playerId}
                                    onPlayAsGuest={handlePlayAsGuest}
                                    onLoginClick={handleLoginOption}
                                />
                            ) : (
                                <MainAppContent />
                            )
                        } />

                        {/* Routes for your legal pages */}
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />

                        {/* If you have other main app routes that should bypass the WelcomePage directly,
                            you would add them here. For example, if /game should always show the game:
                            <Route path="/game" element={<MainAppContent />} />
                        */}

                        {/* Optional: Redirect any other paths to the home if showWelcomePage is true,
                           or to a 404 page if you have one */}
                        {/* <Route path="*" element={showWelcomePage ? <Navigate to="/" replace /> : <NotFoundPage />} /> */}
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;

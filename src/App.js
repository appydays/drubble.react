// src/components/App.js
import React, {useState, useEffect} from "react";
import './App.css';
import Panagram from "./components/Panagram";
import { ThemeProvider } from './ThemeContext';
// import SettingsModal from "./components/SettingsModal"; // Keep if SettingsModal is used elsewhere or managed differently
import WelcomePage from "./components/WelcomePage";
import { useTranslation } from 'react-i18next';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// Define MainAppContent OUTSIDE the App component
// It needs to accept the props it will receive from App
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
        {/* SettingsModal might still be here if it's a global setting not tied to game */}
        {/* <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
        /> */}
    </>
);

function App() {
    // Removed modal state, as Panagram will handle them
    // const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    // const [isLeaderboardModalOpen, setIsLeaderboardModalAsOpen] = useState(false);
    // const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    // const [isSplashHelpModalOpen, setIsSplashHelpModalOpen] = useState(false);

    const [player, setPlayer] = useState(null);
    const [playerId, setPlayerId] = useState(localStorage.getItem('playerId'));
    const [playerName, setPlayerName] = useState(localStorage.getItem('playerName')?? "Guest");
    const [isGuest, setIsGuest] = useState(true);
    const [playerPrefReceiveNewsletter, setPlayerPrefReceiveNewsletter] = useState(localStorage.getItem('playerPrefReceiveNewsletter'));
    const [playerPrefReceivePrompts, setPlayerPrefReceivePrompts] = useState(localStorage.getItem('playerPrefReceivePrompts'));

    const [showWelcomePage, setShowWelcomePage] = useState(true);
    // State to control if the account modal should open on game load
    const [openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad] = useState(false);

    const { t, i18n } = useTranslation();


    const handlePlayAsGuest = () => {
        setIsGuest(true);
        setPlayerId(null);
        setPlayerName("Guest");
        setShowWelcomePage(false);
        setOpenAccountModalOnGameLoad(false); // Ensure it's false for guest
    };

    const handleLoginOption = () => {
        setShowWelcomePage(false);
        setOpenAccountModalOnGameLoad(true); // Set to open the modal when Panagram loads
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
                                    onLoginClick={handleLoginOption} // This click will just hide welcome page, Panagram will then handle opening modal
                                />
                            ) : (
                                // Pass all necessary props to MainAppContent
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
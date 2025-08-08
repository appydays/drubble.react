// src/components/WelcomePage.js
import React, { useEffect, useState } from 'react';
import './css/WelcomePage.css';
import useApiRequest from './useApiRequest';
import SocialShare from "./SocialShare";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import Accordion from "./Accordion"; // Assuming this path is correct

const WelcomePage = ({ playerId, playerName, onPlayAsGuest, onPlayAsPlayer, onLoginClick, onLogoutClick }) => {
    // const [playerName, setPlayerName] = useState(null);
    const [showWhyDrubble, setShowWhyDrubble] = useState(false); // State for expandable section
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showWhyRegister, setShowWhyRegister] = useState(false);
    const [showFuturePlans, setShowFuturePlans] = useState(false);

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';
    const { makeRequest } = useApiRequest(apiUrl);

    const [hasPlayedToday, setHasPlayedToday] = useState(false);
    const [todayScore, setTodayScore] = useState(null);
    const [todayWords, setTodayWords] = useState([]);
    const [gameComplete, setGameComplete] = useState(false); // Initialize as boolean

    const { t } = useTranslation();

    // Use t() for welcome content
    const welcomeContentHtml = t('welcome_page.welcome_content');

    useEffect(() => {
        const fetchPlayerData = async () => {
            // const storedPlayerName = localStorage.getItem("playerName");
            // if (storedPlayerName) {
            //     setPlayerName(storedPlayerName);
            // }

            if (playerId) {
                try {
                    let responseData = await makeRequest(`/players/${playerId}/today`, 'GET');

                    if (responseData && responseData.success) {
                        setHasPlayedToday(responseData.hasPlayedToday);
                        setGameComplete(responseData.complete); // Ensure gameComplete is set
                        if (responseData.hasPlayedToday) {
                            setTodayScore(responseData.score);
                            setTodayWords(responseData.wordsUsed || []);
                        } else {
                            setTodayScore(null);
                            setTodayWords([]);
                        }
                    } else {
                        console.error("Error checking today's game status:", responseData.message);
                    }
                } catch (error) {
                    console.error("Request failed:", error);
                }
            }
        };

        fetchPlayerData();
    }, [playerId, makeRequest]); // Add makeRequest to dependencies as it's from useApiRequest

    const handleGuestClick = () => {
        onPlayAsGuest();
    };

    const handlePlayerClick = () => {
        onPlayAsPlayer();
    };

    const handleLoginClick = () => {
        onLoginClick();
    };

    const handleLogout = () => {
        onLogoutClick();
    };

    return (
        <div className="welcome-full-screen-container">

            {/*<LanguageSwitcher />*/}

            <div className="welcome-main-content">
                <h2 className="welcome-title">{t('welcome_page.welcome_message', { sitename : process.env.REACT_APP_SITE_NAME} )}</h2>
                <div className="welcome-section welcome-intro">
                    {!hasPlayedToday && (
                        <div dangerouslySetInnerHTML={{ __html: welcomeContentHtml }}></div>
                    )}

                    {playerName && hasPlayedToday && (
                        <div className="info-box">
                            <p>
                                {/* Use translation key with interpolation for todayScore */}
                                <span dangerouslySetInnerHTML={{ __html: t('welcome_page.played_today.score_message', { todayScore: todayScore }) }}></span>
                                {
                                    !gameComplete &&
                                    <>
                                        <br/> {/* Add a line break for better formatting */}
                                        {t('welcome_page.played_today.not_complete')}
                                    </>
                                }
                            </p>
                            {todayWords.length > 0 && (
                                <>
                                    <p>{t('welcome_page.played_today.words_played', { wordsList: todayWords.join(", ") })}</p>
                                    <SocialShare score={todayScore} playerName={playerName} />
                                </>
                            )}
                            <p className="warning">
                                {t('welcome_page.played_today.warning_message')}
                            </p>
                        </div>
                    )}

                    <div className="button-group welcome-cta-buttons">
                        {playerName ? (
                            <>
                                <button onClick={handlePlayerClick} className="welcome-button play-button">
                                    {t('buttons.play_as_player', { playerName: playerName })}
                                </button>
                                <button onClick={handleLogout} className="welcome-button secondary-button">
                                    {t('buttons.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleGuestClick} className="welcome-button play-button">
                                    {t('buttons.play_as_guest')}
                                </button>
                                <button onClick={handleLoginClick} className="welcome-button primary-button">
                                    {t('buttons.register_or_login')}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Show FAQs */}
                <Accordion />

                <div className="welcome-footer">
                    <p>{t('footer.copyright',{ sitename : process.env.REACT_APP_SITE_NAME})}</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
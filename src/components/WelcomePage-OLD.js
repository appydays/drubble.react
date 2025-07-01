// src/components/WelcomePage.js
import React, { useEffect, useState } from 'react';
import './css/WelcomePage.css';
import useApiRequest from './useApiRequest';
import SocialShare from "./SocialShare";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; // Assuming this path is correct

const WelcomePage = ({ playerId, onPlayAsGuest, onLoginClick, onLogoutClick }) => {
    const [playerName, setPlayerName] = useState(null);
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
            const storedPlayerName = localStorage.getItem("playerName");
            if (storedPlayerName) {
                setPlayerName(storedPlayerName);
            }

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

    const handlePlayClick = () => {
        onPlayAsGuest();
    };

    const handleLogout = () => {
        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("playerPrefReceiveNewsletter");
        localStorage.removeItem("playerPrefReceivePrompts");
        setPlayerName(null);
        if (onLogoutClick) {
            onLogoutClick();
        }
    };

    return (
        <div className="welcome-full-screen-container">
            <div className="welcome-app-header">
                <img src={`/${process.env.REACT_APP_SITE_NAME_LOWER}.png`} alt={`Logo ${process.env.REACT_APP_SITE_NAME}`} className="welcome-logo"/>
            </div>

            {/*{(!playerName || playerName === 'daibara') && (*/}
            {/*    <LanguageSwitcher />*/}
            {/*)}*/}

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
                                <button onClick={handlePlayClick} className="welcome-button play-button">
                                    {t('buttons.play_as_player', { playerName: playerName })}
                                </button>
                                <button onClick={handleLogout} className="welcome-button secondary-button">
                                    {t('buttons.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handlePlayClick} className="welcome-button play-button">
                                    {t('buttons.play_as_guest')}
                                </button>
                                <button onClick={onLoginClick} className="welcome-button primary-button">
                                    {t('buttons.register_or_login')}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="welcome-section welcome-details">
                    <h2 className="section-title" onClick={() => setShowWhyDrubble(!showWhyDrubble)}>
                        Why Drubble? <span className="toggle-icon">{showWhyDrubble ? '▲' : '▼'}</span>
                    </h2>
                    {showWhyDrubble && (
                        <div className="section-content expanded">
                            <div>
                                <p>This game was originally developed as Wordscram, but unfortunately it was found that another game was already
                                    out there with that name! So we thought hard and long on various names related to words and puzzles, but they've pretty
                                    much all been thought of before.</p>
                                <p>So why <b>Drubble?</b></p>
                                <p>
                                    Etymology of "Drub":

                                    The ultimate origin of "drub" is uncertain, but the most commonly cited theory is that it comes from the Arabic word "ḍaraba" (ضرب), meaning "to beat" or "to strike."

                                    It's believed to have entered the English language in the 17th century, possibly brought back by travelers who observed a form of punishment in Asia involving beating the soles of a person's feet with a stick or cudgel. This original sense of a severe physical beating is central to its early usage.

                                    Use of "Drub" and "Drubbing":

                                    Over the centuries, the meaning of "drub" has broadened and become more figurative, though it still retains its core sense of forceful impact or overwhelming defeat.
                                </p>
                                <p>
                                    "Drubbing" is the verbal noun form of "drub," and it refers to:

                                    A severe beating (literal or figurative) or a sound defeat.
                                </p>
                                <p>so hence we came up with drubble, so why not give your family and friends a right drubbing - Let's Drubble! </p>
                            </div>
                        </div>
                    )}

                    <h2 className="section-title" onClick={() => setShowHowToPlay(!showHowToPlay)}>
                        {t('how_to_play.title')} <span className="toggle-icon">{showHowToPlay ? '▲' : '▼'}</span>
                    </h2>
                    {showHowToPlay && (
                        <div className="section-content expanded">
                            <div dangerouslySetInnerHTML={{ __html: t('how_to_play.content_p1') }}></div>
                            <br/>
                            <div dangerouslySetInnerHTML={{ __html: t('how_to_play.content_p2',{ sitename : process.env.REACT_APP_SITE_NAME}) }}></div>
                        </div>
                    )}

                    <h2 className="section-title" onClick={() => setShowWhyRegister(!showWhyRegister)}>
                        {t('why_register.title')} <span className="toggle-icon">{showWhyRegister ? '▲' : '▼'}</span>
                    </h2>
                    {showWhyRegister && (
                        <div className="section-content expanded">
                            <div dangerouslySetInnerHTML={{ __html: t('why_register.content_p1') }}></div>
                            <br/>
                            <div dangerouslySetInnerHTML={{ __html: t('why_register.content_p2',{ sitename : process.env.REACT_APP_SITE_NAME}) }}></div>
                        </div>
                    )}

                    <h2 className="section-title" onClick={() => setShowFuturePlans(!showFuturePlans)}>
                        {t('future_plans.title')} <span className="toggle-icon">{showFuturePlans ? '▲' : '▼'}</span>
                    </h2>
                    {showFuturePlans && (
                        <div className="section-content expanded">
                            <p>{t('future_plans.content_p1')}</p>
                            <ol>
                                <li>{t('future_plans.list_item_1')}</li>
                                <li>{t('future_plans.list_item_2')}</li>
                                <li>{t('future_plans.list_item_3')}</li>
                                <li>{t('future_plans.list_item_4')}</li>
                            </ol>
                            <p>{t('future_plans.contact_message', {supportEmail: process.env.REACT_APP_SUPPORT_EMAIL})}</p>
                            <p>{t('future_plans.newsletter_message', { sitename : process.env.REACT_APP_SITE_NAME})}</p>
                        </div>
                    )}
                </div>

                <div className="welcome-footer">
                    <p>{t('footer.copyright',{ sitename : process.env.REACT_APP_SITE_NAME})}</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
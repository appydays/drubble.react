import React, { useEffect, useState } from 'react';
import './css/WelcomePage.css'; // Your CSS file
// import './css/WelcomePageAnimations.css'; // Optional: for transitions/animations
import useApiRequest from './useApiRequest';

const WelcomePage = ({ playerId, onPlayAsGuest, onLoginClick, onLogoutClick }) => {
    const [playerName, setPlayerName] = useState(null);
    const [showHowToPlay, setShowHowToPlay] = useState(false); // State for expandable section
    const [showWhyRegister, setShowWhyRegister] = useState(false); // State for expandable section

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';
    const { makeRequest } = useApiRequest(apiUrl);

    const [hasPlayedToday, setHasPlayedToday] = useState(false);
    const [todayScore, setTodayScore] = useState(null);
    const [todayWords, setTodayWords] = useState([]);
    const [gameComplete, setGameComplete] = useState([]);

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
                        if (responseData.hasPlayedToday && responseData.complete) {
                            setHasPlayedToday(true);
                            setTodayScore(responseData.score);
                            setTodayWords(responseData.wordsUsed || []);
                            setGameComplete(true);
                        } else if (!responseData.complete) {
                            setHasPlayedToday(true);
                            setTodayWords(responseData.wordsUsed || []);
                            setGameComplete(false);
                        } else {
                            setHasPlayedToday(false);
                            setGameComplete(false);
                        }
                    } else {
                        console.error("Error checking today's game status:", responseData.message);
                    }
                } catch (error) {
                    console.error("Request failed:", error);
                }
            }
        };

        fetchPlayerData(); // Invoke the async function

    }, [playerId, makeRequest]);

    const handlePlayClick = () => {
        onPlayAsGuest(); // Assumes this leads to game start regardless of guest/logged in
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
                <img src="/drubble.png" alt="Drubble Logo" className="welcome-logo"/>
            </div>

            <div className="welcome-main-content">
                <h2 className="welcome-title">Welcome to Drubble!</h2>
                {/* Core Game Intro (Condensed) */}
                <div className="welcome-section welcome-intro">
                    {!hasPlayedToday &&
                        <>
                            <p>Get ready to put your vocabulary to the ultimate test!</p>
                            <p>In this daily word challenge, you have <b>5 minutes</b> to find <b>5 words</b> over <b>5 rounds</b> of <b>9 letters</b> each.</p>
                            <p>Find the longest possible word to score big, and use less common letters for bonus points!</p>
                        </>
                    }

                    {playerName && hasPlayedToday && (
                        <div className="info-box">
                            <p>
                                ✅ You’ve already played today’s game. Your score was <strong>{todayScore}</strong>.
                                {
                                    !gameComplete &&
                                        <>
                                            You did not complete the game.
                                        </>
                                }
                            </p>
                            {todayWords.length > 0 && (
                                <p>Words you played: {todayWords.join(", ")}</p>
                            )}
                            <p className="warning">
                                You can still play again for fun — but new scores won’t be submitted or count on the leaderboard.
                            </p>
                        </div>
                    )}

                    {/* Main Action Buttons */}
                    <div className="button-group welcome-cta-buttons">
                        {playerName ? (
                            <>
                                <button onClick={handlePlayClick} className="welcome-button play-button">
                                    Play as {playerName}
                                </button>
                                <button onClick={handleLogout} className="welcome-button secondary-button">
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handlePlayClick} className="welcome-button play-button">
                                    Play as a guest
                                </button>
                                <button onClick={onLoginClick} className="welcome-button primary-button">
                                    Register or Sign In
                                </button>
                            </>
                        )}
                    </div>

                </div>



                {/* Expandable Sections for more info */}
                <div className="welcome-section welcome-details">
                    <h2 className="section-title" onClick={() => setShowHowToPlay(!showHowToPlay)}>
                        How to play <span className="toggle-icon">{showHowToPlay ? '▲' : '▼'}</span>
                    </h2>
                    {showHowToPlay && (
                        <div className="section-content expanded">
                            <div>Each day, every player works from the <b>same pack of random letters</b>. Your mission? To find the <b>longest possible word</b> you can create from those letters. The longer the word, the higher your score will climb! But that's not all - strategic play is key. Keep an eye out for those less common letters; using them will give you even more points and boost your overall score.</div>
                            <br/>
                                <div>Can you beat the daily competition and claim the title of <b>top scorer</b>? Or maybe you'll set a new personal, or Drubble record by coming up with the <b>highest scoring word</b> ever? Each game is an opportunity to test your linguistic skill! Remember, you can play for fun and try again, but only your <b>first score</b> of the day will count towards the daily leaderboards and your personal bests.</div>
                        </div>
                    )}

                    <h2 className="section-title" onClick={() => setShowWhyRegister(!showWhyRegister)}>
                        Why register? <span className="toggle-icon">{showWhyRegister ? '▲' : '▼'}</span>
                    </h2>
                    {showWhyRegister && (
                        <div className="section-content expanded">
                            <div><b>Play as a guest to jump right into the fun</b>, or <b>register for free to unlock more!</b> Registered players can participate in daily leaderboards, track their game history, and view their detailed personal statistics.</div>
                            <br/>
                            <div>After you complete your daily challenge, be sure to share your score with friends and see who reigns supreme! Whether you're looking for a quick brain teaser, a fun way to pass the time, or a friendly competition with your friends, Drubble offers endless hours of engaging gameplay. Sharpen your mind, expand your vocabulary, and challenge yourself to become the ultimate wordsmith!</div>
                        </div>
                    )}
                </div>

                {/* Footer or additional links */}
                <div className="welcome-footer">
                    {/* Add links to Privacy Policy, Terms of Service etc. */}
                    <p>&copy; 2025 Drubble. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
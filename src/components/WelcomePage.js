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

    }, [playerId]);

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
                <img src="/scramair.png" alt="Logo Scramair" className="welcome-logo"/>
            </div>

            <div className="welcome-main-content">
                <h2 className="welcome-title">Croeso i Scramair!</h2> {/* Added a prominent title */}
                {/* Core Game Intro (Condensed) */}
                <div className="welcome-section welcome-intro">
                    {!hasPlayedToday &&
                        <>
                            <p>Paratowch i roi eich geirfa ar y prawf eithaf!</p>
                            <p>Yn yr her eiriau ddyddiol hon, cewch <b>5 munud</b> i ddod o hyd i <b>5 gair</b> dros <b>5 rownd</b> o <b>9 llythyren</b> yr un.</p>
                            <p>Ffeindiwch y gair hiraf posibl i sgorio'n fawr, a defnyddiwch lythrennau llai cyffredin am bwyntiau bonws!</p>
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
                                    Chwarae fel {playerName}
                                </button>
                                <button onClick={handleLogout} className="welcome-button secondary-button">
                                    Allgofnodi
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handlePlayClick} className="welcome-button play-button">
                                    Chwarae fel gwestai
                                </button>
                                <button onClick={onLoginClick} className="welcome-button primary-button">
                                    Cofrestru neu Mewngofnodi
                                </button>
                            </>
                        )}
                    </div>

                </div>



                {/* Expandable Sections for more info */}
                <div className="welcome-section welcome-details">
                    <h2 className="section-title" onClick={() => setShowHowToPlay(!showHowToPlay)}>
                        Sut i Chwarae <span className="toggle-icon">{showHowToPlay ? '▲' : '▼'}</span>
                    </h2>
                    {showHowToPlay && (
                        <div className="section-content expanded">
                            <div>Bob dydd, mae pob chwaraewr yn gweithio o'r <b>union un pecyn o 9 llythyren ar hap</b>. Eich cenhadaeth? I ddod o hyd i'r <b>gair hiraf posibl</b> y gallwch ei greu o'r llythrennau hynny. Po hiraf yw'r gair, yr uchaf fydd eich sgôr yn dringo! Ond nid dyna'r cyfan – mae chwarae strategol yn allweddol. Cadwch lygad am y llythrennau llai cyffredin hynny; bydd eu defnyddio yn rhoi hyd yn oed mwy o bwyntiau i chi ac yn rhoi hwb i'ch sgôr gyffredinol.</div>
                            <br/>
                            <div>Allwch chi drechu'r gystadleuaeth ddyddiol a hawlio teitl y <b>prif sgoriwr</b>? Neu efallai y byddwch chi'n gosod record bersonol, neu fyd-eang, newydd drwy lunio'r <b>gair â'r sgôr uchaf</b> erioed? Mae pob gêm yn gyfle i brofi eich camp ieithyddol! Cofiwch, gallwch chi chwarae am hwyl a cheisio eto, ond dim ond eich <b>sgôr cyntaf</b> un y diwrnod fydd yn cyfrif tuag at y byrddau arweinwyr dyddiol a'ch goreuon personol.</div>
                        </div>
                    )}

                    <h2 className="section-title" onClick={() => setShowWhyRegister(!showWhyRegister)}>
                        Pam Cofrestru? <span className="toggle-icon">{showWhyRegister ? '▲' : '▼'}</span>
                    </h2>
                    {showWhyRegister && (
                        <div className="section-content expanded">
                            <div><b>Chwaraewch fel gwestai i neidio’n syth i’r hwyl</b>, neu <b>cofrestrwch am ddim i ddatgloi mwy!</b> Gall chwaraewyr cofrestredig gymryd rhan yn y byrddau arweinwyr dyddiol, olrhain eu hanes gêm, a gweld eu hystadegau personol manwl.</div>
                            <br/>
                            <div>Ar ôl i chi gwblhau eich her ddyddiol, gwnewch yn siŵr eich bod chi'n rhannu eich sgôr gyda ffrindiau ac yn gweld pwy sy'n teyrnasu'n oruchaf! P'un a ydych chi'n chwilio am ymennydd cyflym, ffordd hwyliog o dreulio'r amser, neu gystadleuaeth gyfeillgar gyda'ch ffrindiau, Scramair yn cynnig oriau di-ddiwedd o chwarae gafaelgar. Miniogwch eich meddwl, ehangwch eich geirfa, a heriwch eich hun i ddod yn feistr geiriau pennaf!</div>
                        </div>
                    )}
                </div>

                {/* Space for Ads - See Monetization section below */}
                {/*<div className="ad-placement-welcome">*/}
                    {/* Your AdSense ad unit code goes here */}
                    {/* Example placeholder */}
                {/*    <div className="placeholder-ad-unit">Hysbyseb yma</div>*/}
                {/*</div>*/}

                {/* Footer or additional links */}
                <div className="welcome-footer">
                    {/* Add links to Privacy Policy, Terms of Service etc. */}
                    <p>&copy; 2025 Scramair. Cedwir pob hawl.</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
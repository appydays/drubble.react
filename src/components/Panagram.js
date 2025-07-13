import React, {useState, useEffect, useRef} from "react";
import Swal from 'sweetalert2';
import useApiRequest from './useApiRequest';
import ProgressBarTimer from "./ProgressBarTimer";
import ShuffleIcon from "./atoms/ShuffleIcon";
import ReplaceIcon from "./atoms/ReplaceIcon";
import SocialShare from "./SocialShare";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from 'react-i18next';

// Import all modal components and their related atoms/icons
import AccountSettingsModal from "./Account"; // Adjust path if needed
import LeaderboardModal from "./Leaderboard"; // Adjust path if needed
import SettingsModal from "./SettingsModal"; // Adjust path if needed
import SplashHelpModal from "./SplashHelpModal"; // Adjust path if needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import LeaderBoardButton from "./atoms/LeaderBoardButton";
import SettingsButton from "./atoms/SettingsButton";
import AccountIcon from "./atoms/AccountIcon";
import HelpButton from "./atoms/HelpButton";


const letterWeights = {
    'A' : 12, 'E' : 16, 'I' : 9, 'O' : 8, 'U' : 4,
    'B' : 2, 'C' : 3, 'D' : 4, 'F' : 2, 'G' : 3, 'H' : 3, 'J' : 1, 'K' : 2,
    'L' : 4, 'M' : 2, 'N' : 6, 'P' : 2, 'Q' : 1, 'R' : 5, 'S' : 6, 'T' : 6,
    'V' : 1, 'W' : 2, 'X' : 1, 'Y' : 2, 'Z' : 1
};

const Panagram = ({
                      // Directly use props from App.js as the source of truth
                      playerId, playerName, player, setPlayer,
                      setPlayerId, setPlayerName, setIsGuest,
                      setPlayerPrefReceiveNewsletter, setPlayerPrefReceivePrompts,
                      openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad
                  }) => {

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';
    const { data, loading, error, makeRequest } = useApiRequest(apiUrl);

    const [vowels, setVowels] = useState([]);
    const [consonants, setConsonants] = useState([]);
    const [letters, setLetters] = useState([]);
    const [inputLetters, setInputLetters] = useState([]);
    const [usedLetters, setUsedLetters] = useState({});
    const [message, setMessage] = useState({ text: null, autoDismiss: 0, isError: false });
    const [submittedWords, setSubmittedWords] = useState([]);
    const [lastSubmittedWord, setLastSubmittedWord] = useState("");
    const [score, setScore] = useState(0);
    const [clickedLetters, setClickedLetters] = useState([]);

    const [isGameOver, setIsGameOver] = useState(false);
    const [game, setGame] = useState(null);
    const [stats, setStats] = useState(null);
    const [gameOverStats, setGameOverStats] = useState(null);
    const [nextEmptyIndex, setNextEmptyIndex] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const [vowelIndexState, setVowelIndex] = useState(3);
    const [consonantIndexState, setConsonantIndex] = useState(6);

    const isGameOverHandled = useRef(false);

    const { t, i18n } = useTranslation();

    const exchangedText = t('submitted_words.exchanged');

    // State for modals
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isSplashHelpModalOpen, setIsSplashHelpModalOpen] = useState(false);

    // Removed localPlayerId, localPlayerName, localPlayer states
    // Removed useEffect for local state synchronization

    let clickedOccurrences = {};
    clickedLetters.forEach((l) => {
        clickedOccurrences[l] = (clickedOccurrences[l] || 0) + 1;
    });

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    const handleAccountModalClose = () => {
        console.log('AccountSettingsModal: onClose prop called, setting isAccountModalOpen to FALSE');
        setIsAccountModalOpen(false);
    };

    // New useEffect to handle opening the Account Modal on load
    useEffect(() => {
        if (openAccountModalOnGameLoad) {
            console.log('Panagram useEffect: openAccountModalOnGameLoad is TRUE. Setting isAccountModalOpen to TRUE.');
            setIsAccountModalOpen(true);
            // Add a small delay before resetting the prop from App.js
            const timer = setTimeout(() => {
                setOpenAccountModalOnGameLoad(false);
            }, 100); // 100ms delay, adjust as needed

            return () => clearTimeout(timer); // Cleanup timer if component unmounts
        }
    }, [openAccountModalOnGameLoad, setOpenAccountModalOnGameLoad]);

    useEffect(() => {
        if (message.text && message.autoDismiss > 0) {
            const timer = setTimeout(() => {
                setMessage({ text: null, autoDismiss: 0, isError: false });
            }, message.autoDismiss * 1000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetch(`${apiUrl}/daily-letters`)
            .then((response) => response.json())
            .then((data) => {
                setVowels(data.vowels);
                setConsonants(data.consonants);
                initializeLetters(data.vowels, data.consonants);
            })
            .catch((error) => console.error("Error fetching letters:", error));
    }, [apiUrl]);

    useEffect(() => {
        const nextEmpty = inputLetters.findIndex((letter) => !letter);
        setNextEmptyIndex(nextEmpty === -1 ? inputLetters.length : nextEmpty);
    }, [inputLetters]);

    // Handlers for login/signup/player updates - These now only update App.js's state via props
    const handleSignupSuccess = (id) => {
        setPlayerId(id);
        localStorage.setItem('playerId', id);
    }

    const handleLoginSuccess = (playerData) => {
        setPlayer(playerData);
        setPlayerName(playerData.nickname);
        setPlayerId(playerData.id);
        setIsGuest(false);
        setPlayerPrefReceiveNewsletter(playerData.pref_receive_newsletter);
        setPlayerPrefReceivePrompts(playerData.pref_receive_prompts);

        //Reset game variables
        setIsGameOver(false);
        setStartTime(Date.now());
        setSubmittedWords([]);
        setScore(0);
        setInputLetters([]);
        setClickedLetters([]);
        setLastSubmittedWord("");
        isGameOverHandled.current = false;

        localStorage.setItem('playerId', playerData.id);
        localStorage.setItem('playerName', playerData.nickname);
        localStorage.setItem('playerPrefReceiveNewsletter', playerData.pref_receive_newsletter);
        localStorage.setItem('playerPrefReceivePrompts', playerData.pref_receive_prompts);
    };

    const handlePlayerUpdate = (updatedPlayerData) => {
        setPlayer(updatedPlayerData);
        setPlayerName(updatedPlayerData.nickname);
        setPlayerPrefReceiveNewsletter(updatedPlayerData.pref_receive_newsletter);
        setPlayerPrefReceivePrompts(updatedPlayerData.pref_receive_prompts);

        localStorage.setItem('playerName', updatedPlayerData.nickname);
        localStorage.setItem('playerPrefReceiveNewsletter', updatedPlayerData.pref_receive_newsletter);
        localStorage.setItem('playerPrefReceivePrompts', updatedPlayerData.pref_receive_prompts);
    };

    const initializeLetters = (vowelArray, consonantArray) => {
        const selectedVowels = vowelArray.slice(0, 4);
        const selectedConsonants = consonantArray.slice(0, 5);
        setLetters([...selectedVowels, ...selectedConsonants]);
        setUsedLetters({});
    };

    const shuffleLetters = () => {
        const indexedLetters = letters.map((letter, index) => ({ letter, index }));
        const shuffledIndexedLetters = indexedLetters.sort(() => Math.random() - 0.5);
        const shuffledLetters = shuffledIndexedLetters.map(item => item.letter);
        setLetters(shuffledLetters);

        const updatedClickedLetters = clickedLetters.map(clickedItem => {
            const newIndex = shuffledIndexedLetters.findIndex(item => item.letter === clickedItem.letter && item.index === clickedItem.index);
            return newIndex !== -1 ? { index: newIndex, letter: clickedItem.letter } : null;
        }).filter(Boolean);

        setClickedLetters(updatedClickedLetters);
        setUsedLetters({});
    };

    const handleLetterClick = (letter) => {
        if (inputLetters.length < 9 && !isGameOver) {
            setInputLetters([...inputLetters, letter]);
        }
    };

    const handleClick = (index, letter) => {
        if(!isGameOver) {
            if (!clickedLetters.some(item => item.index === index && item.letter === letter)) {
                setClickedLetters([...clickedLetters, {index, letter}]);
                handleLetterClick(letter);
            }
        }
    };

    const updateUsedLetters = (letter, count) => {
        setUsedLetters((prevUsedLetters) => ({
            ...prevUsedLetters,
            [letter]: (prevUsedLetters[letter] || 0) + count,
        }));
    };

    const handleDelete = () => {
        if (clickedLetters.length > 0) {
            setInputLetters(inputLetters.slice(0, -1));
            const updatedLetters = [...clickedLetters];
            updatedLetters.pop();
            setClickedLetters(updatedLetters);
        }
    };

    const handleEnter = async () => {
        if (isValidating || inputLetters.length === 0 || submittedWords.length >= 5) return;

        setIsValidating(true);

        if (inputLetters.length > 0 && submittedWords.length < 5) {
            const word = inputLetters.join("");
            const isValid = await validateWord(word);

            if (isValid) {
                setMessage({ text: t('word.valid', {word: word}), autoDismiss: 3, isError: false });
                setSubmittedWords([...submittedWords, word]);
                setLastSubmittedWord(word);
            } else {
                setMessage({ text: t('word.invalid', {word: word}), autoDismiss: 3, isError: true });
            }
            setClickedLetters([]);
            setUsedLetters({});
            setInputLetters([]);
            setIsValidating(false);
        }
    };

    const replaceUsedLetters = (word) => {
        let newLetters = [...letters];
        let consonantIndex = consonantIndexState;
        let vowelIndex = vowelIndexState;

        for (let i = 0; i < word.length; i++) {
            let letterUsed = word[i];
            const position = newLetters.indexOf(letterUsed);

            if (vowels.includes(letterUsed)) {
                if (vowelIndex < vowels.length) {
                    newLetters[position] = vowels[vowelIndex];
                    vowelIndex++;
                }
            } else if (consonants.includes(letterUsed)) {
                if (consonantIndex < consonants.length) {
                    newLetters[position] = consonants[consonantIndex];
                    consonantIndex++;
                }
            }
        }
        setConsonantIndex(consonantIndex);
        setVowelIndex(vowelIndex);
        setLetters(newLetters);
    };

    const handleExchange = () => {
        if (inputLetters.length > 0) {
            Swal.fire({
                title: t('alerts.title.sure'),
                text: t('alerts.exchange.text'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: t('alerts.exchange.confirm'),
                cancelButtonText: t('alerts.exchange.cancel'),
            }).then((result) => {
                if (result.isConfirmed) {
                    const word = inputLetters.join("");
                    replaceUsedLetters(word);
                    setInputLetters([]);
                    setClickedLetters([]);
                    setSubmittedWords([...submittedWords, 'WORD-SKIPPED']);
                    setLastSubmittedWord('WORD-SKIPPED');

                    Swal.fire(t('alerts.exchange.success.title'), t('alerts.exchange.success.text'), 'success');
                }
            });
        }
    };

    useEffect(() => {
        const processGameUpdate = async () => {
            if (lastSubmittedWord.length > 0 && !isGameOverHandled.current) {
                if (submittedWords.length >= 5) {
                    setIsGameOver(true);
                    setEndTime(Date.now());
                    isGameOverHandled.current = true;

                    const updatedData = await updateGameStatus(true);
                    setGameOverStats(updatedData.stats);
                } else if (lastSubmittedWord !== 'WORD-SKIPPED') {
                    replaceUsedLetters(lastSubmittedWord);
                    updateGameStatus(false);
                }
            }
        };
        processGameUpdate();
    }, [submittedWords, lastSubmittedWord]);

    const updateGameStatus = async (isGameComplete = false) => {
        try {
            let responseData;
            // Use playerId for API calls
            if (!game && playerId) {
                responseData = await makeRequest(`/games`, 'POST', {
                    user_id: parseInt(playerId),
                    complete: isGameComplete ? 1 : 0,
                    score: score,
                    words_used: submittedWords,
                    start_timestamp: startTime,
                    end_timestamp: isGameComplete ? Date.now() : undefined
                });
            } else if (playerId) {
                responseData = await makeRequest(`/games/${game.id}/update`, 'POST', {
                    user_id: parseInt(playerId),
                    score: score,
                    words_used: submittedWords,
                    start_timestamp: startTime,
                    end_timestamp: isGameComplete ? Date.now() : undefined,
                    complete: isGameComplete ? 1 : 0,
                });
            }
            if (responseData && responseData.success) {
                setGame(responseData.game);
                setStats(responseData.stats);
                return responseData;
            } else {
                console.error("Error:", responseData ? responseData.message : "Unknown error updating game status");
                if (responseData) console.error("Server Response:", responseData);
                return null;
            }
        } catch (error) {
            console.error("Failed to update game status:", error);
            return null;
        }
    };

    const validateWord = async (word) => {
        try {
            const data = await makeRequest(`/validate-word?lang=cy&word=${word}`, 'GET');
            if (data.success && data.valid) {
                setScore(prev => prev + calculateWordScore(word));
                return true;
            }
            setUsedLetters({});
            return false;
        } catch (error) {
            console.error("Error validating word:", error);
            return false;
        }
    };

    const calculateWordScore = (word, baseValue = 20) => {
        const upperCaseWord = word.toUpperCase();
        let score = word.length * 2;
        if(word.length === 9) { score += 25; }
        for (let i = 0; i < upperCaseWord.length; i++) {
            const letter = upperCaseWord[i];
            if (letterWeights[letter]) {
                score += baseValue - letterWeights[letter];
            } else {
                score += 0;
            }
        }
        return score;
    };

    const handleTimeUp = () => {
        setIsGameOver(true);
        setEndTime(Date.now());
        updateGameStatus();
    };

    useEffect(() => {
        if (isGameOver) {
            let messageContent;
            // Use playerId and playerName directly
            if (!playerId) {
                messageContent = (
                    <div>
                        <p>{t('game_over.not-logged-in.login_prompt_title')}</p>
                        <p>{t('game_over.not-logged-in.login_prompt_message')}</p>
                        {/* You could add a button here to navigate to the login page */}
                        {/* <button onClick={() => navigate('/login')}>Login Now</button> */}
                    </div>
                );
            } else if (endTime && submittedWords.length < 5) {
                messageContent = (
                    <div>
                        <p>{t('game_over.title')}</p>
                        <p>{t('game_over.out_of_time',{words: submittedWords.length, score: score})}</p>
                        <SocialShare score={score} playerName={playerName} />
                    </div>
                );
            } else {
                if (!gameOverStats) {
                    return;
                }
                let highestWordBeatMessage = '';
                let gameScoreBeatMessage = '';
                if (gameOverStats) {
                    const { word_score_updated, word, word_score, game_score_updated, game_score } = gameOverStats;
                    if (word_score_updated) {
                        highestWordBeatMessage = t('game_over.new_word_high_score', { word: word, word_score: word_score });
                    } else {
                        highestWordBeatMessage = t('game_over.high_word_score', { word: word, word_score: word_score });
                    }
                    if (game_score_updated) {
                        gameScoreBeatMessage = t('game_over.new_game_high_score', { game_score: game_score });
                    } else {
                        gameScoreBeatMessage = t('game_over.high_game_score', { game_score: game_score });
                    }
                }
                messageContent = (
                    <div>
                        <p>{t('game_over.title')}</p>
                        <p>{t('game_over.complete', { score: score })}</p>
                        {highestWordBeatMessage && <p dangerouslySetInnerHTML={{ __html: highestWordBeatMessage }} />}
                        {gameScoreBeatMessage && <p dangerouslySetInnerHTML={{ __html: gameScoreBeatMessage }} />}
                        <SocialShare score={score} playerName={playerName} />
                    </div>
                );
            }
            setMessage({
                text: messageContent,
                autoDismiss: 0,
                isError: false
            });
        }
    }, [isGameOver, i18n.language, score, submittedWords.length, playerName, endTime, gameOverStats, playerId]);


    return (

        <div className="game-container">
            <div className={`game-block ${isGameOver ? "game-over" :''}`}>
                <ProgressBarTimer
                    key={startTime}
                    totalTime={300}
                    isSplashHelpModalOpen={isSplashHelpModalOpen}
                    isGameOver={isGameOver}
                    onTimeUp={handleTimeUp}
                />

                <div className="tile-container daily-letters">
                    {letters.map((letter, index) => (
                        <div
                            key={index}
                            className={`tile ${clickedLetters.some(item => item.index === index) ? "disabled" : ""}`}
                            onClick={() => handleClick(index, letter)}
                        >
                            <span className="front">{letter}</span>
                            <span className="back">{letter}</span>
                        </div>
                    ))}
                </div>

                <div className="letter-action-container">
                    <button className="shuffle-button" onClick={shuffleLetters} disabled={isGameOver}>
                        <ShuffleIcon/>&nbsp;{t('buttons.shuffle')}
                    </button>
                    <button className="delete" onClick={handleDelete} disabled={isGameOver}>⌫<span> {t('buttons.delete_letter')}</span></button>
                    <button className="exchange-button"
                            onClick={handleExchange}
                            disabled={isGameOver || (inputLetters.length === 0)}
                    >
                        <ReplaceIcon/>&nbsp;{t('buttons.exchange')}
                    </button>
                </div>

                <hr className="word-divider"/>
                <div className="tile-container new-word">
                    {[...Array(9)].map((_, index) => (
                        <div
                            key={index}
                            className={`tile ${inputLetters[index] ? "filled" : "empty"}`}
                            style={{
                                border: inputLetters[index] || index === nextEmptyIndex ? '2px solid #3498db' : '2px solid #ddd',
                            }}
                        >
                            {inputLetters[index] || ""}
                        </div>
                    ))}
                </div>

                <div className="keyboard-row">
                    <button className="key special enter" onClick={handleEnter} disabled={isGameOver || isValidating}>{isValidating ? t("buttons.check_word") : t("buttons.submit")}</button>
                </div>

            </div>

            {message.text && <div className={`message-box message ${message.isError ? "error" : "success"} ${message.text ? "fade-in" : "fade-out"}`}>{message.text}</div>}

            <div className="submitted-words">
                <h3>{t('submitted_words.title')}</h3>
                <div className="word-blocks">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className={`word-block ${submittedWords[index] === "WORD-SKIPPED" ? "skipped" : submittedWords[index] ? "filled" : "empty"}`}
                        >
                            {submittedWords[index] === "WORD-SKIPPED" ? exchangedText : submittedWords[index] || ""}
                        </div>
                    ))}
                </div>
            </div>

            <footer className="mobile-footer">
                {/* Use player prop for conditional rendering */}
                {player ? (
                    <div className="mobile-footer__account">
                        <button className="user account"
                                onClick={() => setIsAccountModalOpen(true)}>
                            <FontAwesomeIcon icon={faUser} size="2x" color="#333" />
                        </button>
                        {/* Use playerName and playerId for display */}
                        <p>{playerName ? playerName : t('footer.player-label', {playerName: playerId})}</p>
                    </div>
                ) : (
                    <div className="mobile-footer__account">
                        <button className="user signup"
                                onClick={() => setIsAccountModalOpen(true)}>
                            {/* Pass player prop to AccountIcon */}
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
                    isOpen={isAccountModalOpen || openAccountModalOnGameLoad}
                    onClose={handleAccountModalClose}
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
                    playerId={playerId} // Use the playerId prop
                    isOpen={isLeaderboardModalOpen}
                    onClose={() => setIsLeaderboardModalOpen(false)}
                />
                <SplashHelpModal
                    isOpen={isSplashHelpModalOpen}
                    onClose={() => setIsSplashHelpModalOpen(false)}
                />
            </footer>
        </div>
    );
};

export default Panagram;
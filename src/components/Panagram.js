import React, {useState, useEffect, useRef} from "react";
import Swal from 'sweetalert2';
import useApiRequest from './useApiRequest';
import ProgressBarTimer from "./ProgressBarTimer";
import ShuffleIcon from "./atoms/ShuffleIcon";
import ReplaceIcon from "./atoms/ReplaceIcon";
import SocialShare from "./SocialShare";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import * as Tone from 'tone'; // Import Tone.js here as well for direct use

// Import all modal components and their related atoms/icons
import AccountSettingsModal from "./Account";
import LeaderboardModal from "./Leaderboard";
import SettingsModal from "./SettingsModal";
import SplashHelpModal from "./SplashHelpModal";
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

    const [vowels, setVowels] = useState([]); // Full deck of vowels
    const [consonants, setConsonants] = useState([]); // Full deck of consonants
    const [letters, setLetters] = useState([]); // Current 9 letters displayed
    const [inputLetters, setInputLetters] = useState([]); // Letters currently in the input bar
    const [usedLetters, setUsedLetters] = useState({}); // Not directly used in new replacement logic, can be removed if no other purpose
    const [message, setMessage] = useState({ text: null, autoDismiss: 0, isError: false });
    const [submittedWords, setSubmittedWords] = useState([]); // List of submitted words
    const [lastSubmittedWord, setLastSubmittedWord] = useState("");
    const [score, setScore] = useState(0);
    const [clickedLetters, setClickedLetters] = useState([]); // Letters clicked from the current 9

    const [isGameOver, setIsGameOver] = useState(false);
    const [game, setGame] = useState(null);
    const [stats, setStats] = useState(null);
    const [gameOverStats, setGameOverStats] = useState(null);
    const [nextEmptyIndex, setNextEmptyIndex] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    // Indices to track position in the full vowel/consonant decks
    const [vowelIndexState, setVowelIndex] = useState(0);
    const [consonantIndexState, setConsonantIndex] = useState(0);
    // New state for vowel frequencies array from API
    const [vowelFrequencyArray, setVowelFrequencyArray] = useState([]);

    const isGameOverHandled = useRef(false);
    const audioContextStartedRef = useRef(false); // New ref to track if audio context has started

    const { t, i18n } = useTranslation();

    const exchangedText = t('submitted_words.exchanged');

    // State for modals
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isSplashHelpModalOpen, setIsSplashHelpModalOpen] = useState(false);

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
                setVowelFrequencyArray(data.vowelFrequency); // Store the vowel frequency array
                initializeLetters(data.vowels, data.consonants, data.vowelFrequency); // Pass it to initialize
            })
            .catch((error) => console.error("Error fetching letters:", error));
    }, [apiUrl]); // Added apiUrl to dependency array

    useEffect(() => {
        const nextEmpty = inputLetters.findIndex((letter) => !letter);
        setNextEmptyIndex(nextEmpty === -1 ? inputLetters.length : nextEmpty);
    }, [inputLetters]);

    // Function to start Tone.js audio context
    const startAudioContext = async () => {
        if (Tone.context.state !== 'running' && !audioContextStartedRef.current) {
            try {
                await Tone.start();
                console.log("Tone.js audio context started from Panagram.");
                audioContextStartedRef.current = true;
            } catch (e) {
                console.error("Could not start Tone.js audio context from Panagram:", e);
            }
        }
    };


    // Handlers for login/signup/player updates - These now only update App.js's state via props
    const handleSignupSuccess = (id) => {
        setPlayerId(id);
        localStorage.setItem('playerId', id);
        startAudioContext(); // Attempt to start audio context on signup
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
        setVowelIndex(0); // Reset vowel index for new game
        setConsonantIndex(0); // Reset consonant index for new game

        // Re-initialize letters for a fresh game
        fetch(`${apiUrl}/daily-letters`)
            .then((response) => response.json())
            .then((data) => {
                setVowels(data.vowels);
                setConsonants(data.consonants);
                setVowelFrequencyArray(data.vowelFrequency);
                initializeLetters(data.vowels, data.consonants, data.vowelFrequency);
            })
            .catch((error) => console.error("Error fetching letters on login:", error));

        localStorage.setItem('playerId', playerData.id);
        localStorage.setItem('playerName', playerData.nickname);
        localStorage.setItem('playerPrefReceiveNewsletter', playerData.pref_receive_newsletter);
        localStorage.setItem('playerPrefReceivePrompts', playerData.pref_receive_prompts);

        startAudioContext(); // Attempt to start audio context on login
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

    /**
     * Helper to shuffle an array in place.
     * @param {Array} array The array to shuffle.
     * @returns {Array} The shuffled array.
     */
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    /**
     * Helper to count vowels in an array of characters.
     * @param {Array<string>} charArray The array of characters.
     * @returns {number} The count of vowels.
     */
    const countVowelsInArray = (charArray) => {
        let count = 0;
        const allVowels = ['A', 'E', 'I', 'O', 'U'];
        charArray.forEach(char => {
            if (allVowels.includes(char.toUpperCase())) {
                count++;
            }
        });
        return count;
    };

    /**
     * Initializes the starting 9 letters for the game based on vowel frequency.
     * @param {Array<string>} vowelArray The full deck of vowels.
     * @param {Array<string>} consonantArray The full deck of consonants.
     * @param {Array<number>} vowelFreqArray The array of target vowel counts per round.
     */
    const initializeLetters = (vowelArray, consonantArray, vowelFreqArray) => {
        const targetVowels = vowelFreqArray[0] !== undefined ? vowelFreqArray[0] : 4; // Default to 4 for the first round
        let selectedVowels = [];
        let selectedConsonants = [];
        let currentVowelIdx = 0;
        let currentConsonantIdx = 0;

        // Select initial vowels based on targetVowels
        for (let i = 0; i < targetVowels; i++) {
            if (currentVowelIdx < vowelArray.length) {
                selectedVowels.push(vowelArray[currentVowelIdx]);
                currentVowelIdx++;
            } else {
                console.warn("Ran out of vowels in the deck during initial setup!");
                break;
            }
        }

        // Select initial consonants to fill the rest (9 - selectedVowels.length)
        const numConsonantsNeeded = 9 - selectedVowels.length;
        for (let i = 0; i < numConsonantsNeeded; i++) {
            if (currentConsonantIdx < consonantArray.length) {
                selectedConsonants.push(consonantArray[currentConsonantIdx]);
                currentConsonantIdx++;
            } else {
                console.warn("Ran out of consonants in the deck during initial setup!");
                break;
            }
        }

        setVowelIndex(currentVowelIdx);
        setConsonantIndex(currentConsonantIdx);

        let initialLetters = [...selectedVowels, ...selectedConsonants];
        // Ensure exactly 9 letters, pad if necessary (shouldn't happen with large decks)
        while (initialLetters.length < 9) {
            initialLetters.push('?'); // Placeholder if decks run out
        }
        initialLetters = initialLetters.slice(0, 9); // Trim if somehow too many (shouldn't happen)

        shuffleArray(initialLetters); // Shuffle the initial 9 letters
        setLetters(initialLetters);
        setUsedLetters({}); // Reset used letters for the new game
    };

    const shuffleLetters = () => {
        // Create a copy to shuffle
        const currentLettersCopy = [...letters];
        shuffleArray(currentLettersCopy);
        setLetters(currentLettersCopy);

        // Reset clicked letters as their original indices are now invalid
        setClickedLetters([]);
        setInputLetters([]);
        setUsedLetters({});
        startAudioContext(); // Attempt to start audio context on shuffle
    };

    const handleLetterClick = (letter) => {
        if (inputLetters.length < 9 && !isGameOver) {
            setInputLetters([...inputLetters, letter]);
            startAudioContext(); // Attempt to start audio context on letter click
        }
    };

    const handleClick = (index, letter) => {
        if(!isGameOver) {
            // Check if the letter at this index has already been clicked for the current word
            if (!clickedLetters.some(item => item.index === index)) { // Only check index for uniqueness
                setClickedLetters([...clickedLetters, {index, letter}]);
                handleLetterClick(letter);
            }
        }
    };

    const handleDelete = () => {
        if (clickedLetters.length > 0) {
            setInputLetters(inputLetters.slice(0, -1));
            const updatedClickedLetters = [...clickedLetters];
            updatedClickedLetters.pop(); // Remove the last clicked letter
            setClickedLetters(updatedClickedLetters);
        }
    };

    const handleEnter = async () => {
        if (isValidating || inputLetters.length === 0 || submittedWords.length >= 5) return;

        setIsValidating(true);
        startAudioContext(); // Attempt to start audio context on enter

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
            setInputLetters([]);
            setUsedLetters({}); // Reset used letters for the new input
            setIsValidating(false);
        }
    };

    /**
     * Replaces used letters with new ones, maintaining the target vowel frequency for the next round.
     * @param {string} word The word that was just submitted/exchanged.
     */
    const replaceUsedLetters = (word) => {
        // 1. Identify letters to keep (those not used in the submitted word)
        let tempCurrentLetters = [...letters]; // Copy of the current 9 letters
        let submittedChars = word.split(''); // Characters from the submitted word
        let lettersToKeep = [];

        tempCurrentLetters.forEach(char => {
            const indexInSubmitted = submittedChars.indexOf(char);
            if (indexInSubmitted > -1) {
                // This char was used, remove one instance from submittedChars
                submittedChars.splice(indexInSubmitted, 1);
            } else {
                // This char was not used, keep it
                lettersToKeep.push(char);
            }
        });

        // 2. Determine target vowel count for the *next* set of 9 letters
        // submittedWords.length will be the count of words *after* the current one is added.
        // So, it directly corresponds to the index for the *next* round's frequency.
        const roundIndex = submittedWords.length;
        const targetVowels = vowelFrequencyArray[roundIndex] !== undefined
            ? vowelFrequencyArray[roundIndex]
            : 4; // Fallback to 4 if index is out of bounds (e.g., more than 5 rounds)

        // 3. Count vowels in lettersToKeep
        const currentVowelsInKeep = countVowelsInArray(lettersToKeep);

        // 4. Calculate number of new letters needed
        const numNewLettersNeeded = 9 - lettersToKeep.length;

        // 5. Calculate how many new vowels and consonants to draw
        let newVowelsToDraw = Math.max(0, targetVowels - currentVowelsInKeep);
        let newConsonantsToDraw = numNewLettersNeeded - newVowelsToDraw;

        // Adjust if trying to draw more vowels than slots available for new letters
        if (newConsonantsToDraw < 0) {
            newVowelsToDraw = numNewLettersNeeded; // Cap new vowels to total needed letters
            newConsonantsToDraw = 0;
        }

        // Ensure we don't try to draw more than available in the full decks
        newVowelsToDraw = Math.min(newVowelsToDraw, vowels.length - vowelIndexState);
        newConsonantsToDraw = Math.min(newConsonantsToDraw, consonants.length - consonantIndexState);

        // If after capping, we still don't have enough letters to fill 9,
        // prioritize filling with whatever is available from the remaining deck.
        let totalDrawn = newVowelsToDraw + newConsonantsToDraw;
        if (totalDrawn < numNewLettersNeeded) {
            const remainingSlots = numNewLettersNeeded - totalDrawn;
            const availableVowels = vowels.length - (vowelIndexState + newVowelsToDraw);
            const availableConsonants = consonants.length - (consonantIndexState + newConsonantsToDraw);

            let fillFromVowels = Math.min(remainingSlots, availableVowels);
            newVowelsToDraw += fillFromVowels;
            let fillFromConsonants = Math.min(remainingSlots - fillFromVowels, availableConsonants);
            newConsonantsToDraw += fillFromConsonants;
        }


        // 6. Draw new letters and update indices
        let drawnVowels = [];
        let drawnConsonants = [];
        let nextVowelIdx = vowelIndexState;
        let nextConsonantIdx = consonantIndexState;

        for (let i = 0; i < newVowelsToDraw; i++) {
            if (nextVowelIdx < vowels.length) {
                drawnVowels.push(vowels[nextVowelIdx]);
                nextVowelIdx++;
            }
        }
        for (let i = 0; i < newConsonantsToDraw; i++) {
            if (nextConsonantIdx < consonants.length) {
                drawnConsonants.push(consonants[nextConsonantIdx]);
                nextConsonantIdx++;
            }
        }

        setVowelIndex(nextVowelIdx);
        setConsonantIndex(nextConsonantIdx);

        // 7. Combine and Shuffle
        let newSetOfLetters = [...lettersToKeep, ...drawnVowels, ...drawnConsonants];
        // Ensure it's exactly 9 letters, pad if necessary (shouldn't happen with large decks)
        while (newSetOfLetters.length < 9) {
            // Fallback: If decks run out, fill with a random letter or a placeholder
            // For robustness, could draw from a generic pool or loop back
            newSetOfLetters.push('?');
            console.warn("Not enough letters in decks to fill 9 slots!");
        }
        newSetOfLetters = newSetOfLetters.slice(0, 9); // Trim if somehow too many (shouldn't happen)

        shuffleArray(newSetOfLetters);
        setLetters(newSetOfLetters);
    };

    const handleExchange = () => {
        if (inputLetters.length > 0) {
            Swal.fire({
                title: t('alert.titles.sure'),
                text: t('alert.exchange.text'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: t('alert.exchange.confirm'),
                cancelButtonText: t('alert.exchange.cancel'),
            }).then((result) => {
                if (result.isConfirmed) {
                    const word = inputLetters.join("");
                    // replaceUsedLetters will be called via useEffect after submittedWords updates
                    setSubmittedWords([...submittedWords, 'WORD-SKIPPED']);
                    setLastSubmittedWord('WORD-SKIPPED');
                    setInputLetters([]);
                    setClickedLetters([]);
                    startAudioContext(); // Attempt to start audio context on exchange

                    Swal.fire(t('alert.exchange.success.title'), t('alert.exchange.success.text'), 'success');
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
                } else {
                    // This block runs after a valid word is submitted or exchanged
                    // and it's NOT the final round.
                    replaceUsedLetters(lastSubmittedWord); // Call the new replacement logic
                    if (lastSubmittedWord !== 'WORD-SKIPPED') {
                        updateGameStatus(false);
                    }
                }
            }
        };
        processGameUpdate();
    }, [submittedWords, lastSubmittedWord]); // Dependency array includes submittedWords and lastSubmittedWord


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
        let score = parseFloat(word.length * 2); // Ensure score starts as a float

        if (word.length === 9) {
            score += 25;
        }

        for (let i = 0; i < upperCaseWord.length; i++) {
            const letter = upperCaseWord[i];
            if (letterWeights[letter] !== undefined) {
                // Subtract the float percentage directly from the baseValue
                score += baseValue - letterWeights[letter];
            } else {
                score += 0; // Handle letters not in your weight list if necessary
            }
        }
        return Math.ceil(score); // Round up the final total score
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
            {/*<LanguageSwitcher />*/}
            <div className={`game-block ${isGameOver ? "game-over" :''}`}>
                <ProgressBarTimer
                    // key={startTime}
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

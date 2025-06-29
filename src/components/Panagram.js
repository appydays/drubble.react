import React, {useState, useEffect, useRef} from "react";
import Swal from 'sweetalert2';
import useApiRequest from './useApiRequest';
import ProgressBarTimer from "./ProgressBarTimer";
import ShuffleIcon from "./atoms/ShuffleIcon";
import ReplaceIcon from "./atoms/ReplaceIcon";
import SocialShare from "./SocialShare";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from 'react-i18next';

const letterWeights = {
    'A' : 12, 'E' : 16, 'I' : 9, 'O' : 8, 'U' : 4,
    'B' : 2, 'C' : 3, 'D' : 4, 'F' : 2, 'G' : 3, 'H' : 3, 'J' : 1, 'K' : 2,
    'L' : 4, 'M' : 2, 'N' : 6, 'P' : 2, 'Q' : 1, 'R' : 5, 'S' : 6, 'T' : 6,
    'V' : 1, 'W' : 2, 'X' : 1, 'Y' : 2, 'Z' : 1
};

const Panagram = ({playerId, playerName, isSplashHelpModalOpen}) => {

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';
    const { data, loading, error, makeRequest } = useApiRequest(apiUrl);

    const [vowels, setVowels] = useState([]);
    const [consonants, setConsonants] = useState([]);
    const [letters, setLetters] = useState([]);  // 9 Letters from API (3 vowels, 6 consonants)
    const [inputLetters, setInputLetters] = useState([]);  // User input (up to 9)
    const [usedLetters, setUsedLetters] = useState([]);  // User input (up to 9)
    const [message, setMessage] = useState({ text: null, autoDismiss: 0, isError: false }); // Word validation message
    const [submittedWords, setSubmittedWords] = useState([]); // Store previously submitted words
    const [lastSubmittedWord, setLastSubmittedWord] = useState("");
    const [score, setScore] = useState(0); // Store player score
    const [clickedLetters, setClickedLetters] = useState([]);

    const [isGameOver, setIsGameOver] = useState(false); // Flag to stop the game
    const [game, setGame] = useState(null);
    const [stats, setStats] = useState(null);
    const [gameOverStats, setGameOverStats] = useState(null);
    const [nextEmptyIndex, setNextEmptyIndex] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const [vowelIndexState, setVowelIndex] = useState(3);
    const [consonantIndexState, setConsonantIndex] = useState(6); //renamed to avoid confusion with local variable

    // A ref to ensure game over logic only runs once, even if state updates trigger re-renders
    const isGameOverHandled = useRef(false);

    const { t, i18n } = useTranslation();

    const exchangedText = t('submitted_words.exchanged');

    let clickedOccurrences = {};
    clickedLetters.forEach((l) => {
        clickedOccurrences[l] = (clickedOccurrences[l] || 0) + 1;
    });

    useEffect(() => {
        // Called when the game starts
        setStartTime(Date.now());
    }, []);

    useEffect(() => {
        if (message.text && message.autoDismiss > 0) {
            const timer = setTimeout(() => {
                setMessage({ text: null, autoDismiss: 0, isError: false });
            }, message.autoDismiss * 1000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    // Fetch letters from API
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
        // Find the index of the next empty tile
        const nextEmpty = inputLetters.findIndex((letter) => !letter);
        setNextEmptyIndex(nextEmpty === -1 ? inputLetters.length : nextEmpty); // Handle case where all tiles are filled
    }, [inputLetters]);

    // Initialize first 9 letters (4 vowels + 5 consonants)
    const initializeLetters = (vowelArray, consonantArray) => {
        const selectedVowels = vowelArray.slice(0, 4); // Get 4 vowels
        const selectedConsonants = consonantArray.slice(0, 5); // Get 5 consonants
        setLetters([...selectedVowels, ...selectedConsonants]); // Set 9 letters
        setUsedLetters({}); // Reset used letters
    };

    // Shuffle the letters
    const shuffleLetters = () => {
        // Attach original indexes to letters
        const indexedLetters = letters.map((letter, index) => ({ letter, index }));

        // Shuffle the indexed array
        const shuffledIndexedLetters = indexedLetters.sort(() => Math.random() - 0.5);

        // Extract shuffled letters
        const shuffledLetters = shuffledIndexedLetters.map(item => item.letter);
        setLetters(shuffledLetters);

        // Re-map clickedLetters based on new shuffled positions
        const updatedClickedLetters = clickedLetters.map(clickedItem => {
            const newIndex = shuffledIndexedLetters.findIndex(item => item.letter === clickedItem.letter && item.index === clickedItem.index);
            return newIndex !== -1 ? { index: newIndex, letter: clickedItem.letter } : null;
        }).filter(Boolean); // Remove any invalid entries

        setClickedLetters(updatedClickedLetters);
        setUsedLetters({}); // Reset used letters after shuffle
    };
    const handleLetterClick = (letter) => {
        if (inputLetters.length < 9 && !isGameOver) {
            setInputLetters([...inputLetters, letter]);

        }
    };

    const handleClick = (index, letter) => {

        //is the game over?
        if(!isGameOver) {
            // Check if this exact letter instance (index + letter) is already clicked
            if (!clickedLetters.some(item => item.index === index && item.letter === letter)) {
                setClickedLetters([...clickedLetters, {index, letter}]); // Track both index & letter
                handleLetterClick(letter);
            }
        }
    };

    // Update used letter count
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
            updatedLetters.pop(); // Remove the last selected letter
            setClickedLetters(updatedLetters);
        }
    };

    // Handle "Enter" button - Validate word
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
            // Clear input letters
            setInputLetters([]);
            setIsValidating(false);
        }
    };

    // Replace used letters when a word is submitted
    const replaceUsedLetters = (word) => {
        let newLetters = [...letters];
        let consonantIndex = consonantIndexState; //local index
        let vowelIndex = vowelIndexState; //local index

        for (let i = 0; i < word.length; i++) {
            let letterUsed = word[i];
            //now find where that letter is in the newLetters array.
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

        setConsonantIndex(consonantIndex); //update state after loop
        setVowelIndex(vowelIndex); //update state after loop
        setLetters(newLetters);

    };

    // Function to handle letter exchange
    const handleExchange = () => {

        //Wrap this code into a SweetAlert confirmation modal
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
            // Only proceed if lastSubmittedWord has changed (indicating a new word/skip)
            // and if this game-over handling hasn't already been triggered.
            if (lastSubmittedWord.length > 0 && !isGameOverHandled.current) {
                // If 5 words are submitted, it's game over
                if (submittedWords.length >= 5) {
                    setIsGameOver(true); // Set game over state
                    setEndTime(Date.now()); // Set end time
                    isGameOverHandled.current = true; // Mark game over logic as handled

                    // Await the updateGameStatus call to get the latest stats
                    const updatedData = await updateGameStatus(true); // Pass true for `complete`

                    setGameOverStats(updatedData.stats);

                    // let highestWordBeatMessage = '';
                    // let gameScoreBeatMessage = '';
                    //
                    // // Check if stats data is available and contains the relevant info
                    // if (updatedData && updatedData.stats) {
                    //     const { word_score_updated, word, word_score, game_score_updated, game_score } = updatedData.stats;
                    //
                    //     // Check if current word beat personal best
                    //     if (word_score_updated) {
                    //         highestWordBeatMessage = t('game_over.new_word_high_score', { word: word, word_score: word_score });
                    //     } else {
                    //         // Display overall highest word if not beaten this turn
                    //         highestWordBeatMessage = t('game_over.high_word_score', { word: word, word_score: word_score });
                    //     }
                    //
                    //     // Check if current game score beat personal best
                    //     if (game_score_updated) {
                    //         // If current game score beat personal best
                    //         gameScoreBeatMessage = t('game_over.new_game_high_score', { game_score: game_score });
                    //     } else {
                    //         // Display overall highest game score if not beaten this turn
                    //         gameScoreBeatMessage = t('game_over.high_game_score', { game_score: game_score });
                    //     }
                    // }
                    //
                    // // Set the final game over message
                    // setMessage({
                    //     text: (
                    //         <div>
                    //             <p>{t('game_over.title')}</p>
                    //             <p>{t('game_over.complete', {score: score})}</p>
                    //             {highestWordBeatMessage && <p dangerouslySetInnerHTML={{ __html: highestWordBeatMessage }} />}
                    //             {gameScoreBeatMessage && <p dangerouslySetInnerHTML={{ __html: gameScoreBeatMessage }} />}
                    //
                    //             <SocialShare score={score} playerName={playerName} />
                    //         </div>
                    //     ),
                    //     autoDismiss: 0, // Don’t auto-dismiss this one
                    //     isError: false
                    // });

                } else if (lastSubmittedWord !== 'WORD-SKIPPED') {
                    // For words 1-4, just replace letters and update game status without waiting
                    replaceUsedLetters(lastSubmittedWord);
                    updateGameStatus(false); // Pass false for `complete`
                }
            }
        };

        processGameUpdate(); // Call the async function
    }, [submittedWords, lastSubmittedWord]); // Dependencies are submittedWords and lastSubmittedWord

    const updateGameStatus = async (isGameComplete = false) => { // Added default false
        try {
            let responseData;

            if (!game && playerId) {
                // No game exists yet → Create a new game
                responseData = await makeRequest(`/games`, 'POST', {
                    user_id: parseInt(playerId),
                    complete: isGameComplete ? 1 : 0, // Use the passed flag
                    score: score,
                    words_used: submittedWords,
                    start_timestamp: startTime,
                    end_timestamp: isGameComplete ? Date.now() : undefined // Only set end_timestamp if game is complete
                });
            } else if (playerId) {
                // Game exists → Update it
                responseData = await makeRequest(`/games/${game.id}/update`, 'POST', {
                    user_id: parseInt(playerId),
                    score: score,  // Update score
                    words_used: submittedWords,  // Add word
                    start_timestamp: startTime,
                    end_timestamp: isGameComplete ? Date.now() : undefined, // Only set end_timestamp if game is complete
                    complete: isGameComplete ? 1 : 0,  // Use the passed flag
                });
            }

            if (responseData && responseData.success) {
                setGame(responseData.game);  // Store updated game object in state
                setStats(responseData.stats); // Store updated user stats in state
                return responseData; // Return the entire data object for use in calling effects
            } else {
                console.error("Error:", responseData ? responseData.message : "Unknown error updating game status");
                // Log the full server response if available for debugging
                if (responseData) console.error("Server Response:", responseData);
                return null;
            }
        } catch (error) {
            console.error("Failed to update game status:", error);
            return null;
        }
    };

    // Call an external API to validate the word
    const validateWord = async (word) => {
        try {

            const data = await makeRequest(`/validate-word?lang=cy&word=${word}`, 'GET');

            // if (!response.ok) {
            //     setUsedLetters({});
            //     return false;
            // }
            // const data = await response.json();

            //if the data returned has a length setting - the word is valid
            if (data.success && data.valid) {
                setScore(prev => prev + calculateWordScore(word));
                return true;
            }
            setUsedLetters({});
            return false

        } catch (error) {
            console.error("Error validating word:", error);
            return false;
        }
    };

    const calculateWordScore = (word, baseValue = 20) => {
        const upperCaseWord = word.toUpperCase();

        //Set the base score to 2 x the length of the submitted
        let score = word.length * 2;

        //Add a bonus for a 9 letter word
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
        // setMessage(
        //     {
        //         text: (
        //             <div>
        //                 <p>{t('game_over.title')}</p>
        //                 <p>{t('game_over.out_of_time',{words: submittedWords.length, score: score})}</p>
        //
        //                 <SocialShare score={score} playerName={playerName} />
        //
        //             </div>
        //         ),
        //         autoDismiss: 0,
        //         isError:false});
        setEndTime(Date.now());
        updateGameStatus();
    };

    // --- NEW useEffect to handle game over messages and re-translate them ---
    useEffect(() => {
        // This effect will run when `isGameOver` changes or when `i18n.language` changes
        if (isGameOver) {
            // Determine the reason for game over (time up or 5 words submitted)
            // You'll need a way to distinguish this. A simple way is a new state variable.
            // Let's assume you set a state like `gameOverReason` in handleTimeUp or when 5 words are submitted.
            // For now, let's assume if endTime is set and submittedWords.length < 5, it's time out.
            // Or, more robustly, you could set a `gameOverType` state in handleTimeUp.

            // Example: Add a new state variable to track the game over type
            // const [gameOverType, setGameOverType] = useState(null);
            // In handleTimeUp: setGameOverType('time_up');
            // In processGameUpdate for 5 words: setGameOverType('words_complete');

            // For simplicity in this example, let's just re-evaluate if it's "out of time"
            // You'll need to know *why* the game ended (time up vs. words submitted)

            // Re-evaluate game over message if game is over
            // This is crucial: you need to recreate the message content here,
            // so it picks up the latest translation based on `i18n.language`.
            let messageContent;
            // You need a way to know if it's an 'out of time' game over or 'words complete' game over
            // Let's assume you pass a `type` parameter to `setMessage` or use a different state for `isTimeUp`.
            // For this example, let's simulate the `handleTimeUp` logic here.

            // Assuming `endTime` being set AND submittedWords.length < 5 implies timeout
            if (endTime && submittedWords.length < 5) { // Adjust this condition based on your actual game over states
                messageContent = (
                    <div>
                        <p>{t('game_over.title')}</p>
                        <p>{t('game_over.out_of_time',{words: submittedWords.length, score: score})}</p>
                        <SocialShare score={score} playerName={playerName} />
                    </div>
                );
            } else {

                if (!gameOverStats) {
                    // If the game is over, and it's 'words_complete' type,
                    // but gameOverStats hasn't arrived yet from the async call,
                    // simply return. This useEffect will re-run when gameOverStats updates.
                    return;
                }

                // Reconstruct the messages using current translation and stored stats
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
    }, [isGameOver, i18n.language, score, submittedWords.length, playerName, endTime, gameOverStats,]); // Dependencies for this effect


    return (

        <div className="game-container">
            {/*{(!playerId || playerName === 'daibara') && (*/}
            {/*    <LanguageSwitcher />*/}
            {/*)}*/}
            <div className={`game-block ${isGameOver ? "game-over" :''}`}>
                <ProgressBarTimer isSplashHelpModalOpen={isSplashHelpModalOpen} isGameOver={isGameOver} onTimeUp={handleTimeUp} />

                {/* Display the 9 available letters */}
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
                    {/* Shuffle Button */}
                    <button className="shuffle-button" onClick={shuffleLetters} disabled={isGameOver}>
                        <ShuffleIcon/>&nbsp;{t('buttons.shuffle')}
                    </button>

                    {/* Delete Letters Button */}
                    <button className="delete" onClick={handleDelete} disabled={isGameOver}>⌫<span> {t('buttons.delete_letter')}</span></button>

                    {/* Exchange Letters Button */}
                    <button className="exchange-button"
                            onClick={handleExchange}
                            disabled={isGameOver || (inputLetters.length === 0)}
                    >
                        <ReplaceIcon/>&nbsp;{t('buttons.exchange')}
                    </button>
                </div>

                <hr className="word-divider"/>
                {/* Empty tiles for user input */}
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

            {/* Display word validation message */}
            {message.text && <div className={`message-box message ${message.isError ? "error" : "success"} ${message.text ? "fade-in" : "fade-out"}`}>{message.text}</div>}

            {/* Display 5 word blocks for submitted words */}
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
        </div>
    );
};

export default Panagram;

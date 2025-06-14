import React, {useState, useEffect, useRef} from "react";
import Swal from 'sweetalert2';
import useApiRequest from './useApiRequest';
import ProgressBarTimer from "./ProgressBarTimer";
import ShuffleIcon from "./atoms/ShuffleIcon";
import ReplaceIcon from "./atoms/ReplaceIcon";
import SocialShare from "./SocialShare";

const letterWeights = {
    'A': 9, 'E' : 14, 'I' : 12, 'O' : 10, 'U' : 3, 'W' : 6, 'Y' : 8,
    'B' : 4, 'C' : 5, 'D' : 7, 'F' : 5,  //'DD' : 2, 'FF' : 1.5, 'CH' : 2,
    'G' : 3, 'H' : 7, 'J' : 1, 'L' : 8, 'M' : 4, //'NG' : 1, 'LL' : 4,
    'N' : 7, 'P' : 3, 'R' : 8, 'S' : 5, 'T' : 6,  //'PH' : 1, 'RH' : 1, 'TH' : 1,
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
    const [nextEmptyIndex, setNextEmptyIndex] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const [vowelIndexState, setVowelIndex] = useState(3);
    const [consonantIndexState, setConsonantIndex] = useState(6); //renamed to avoid confusion with local variable

    // A ref to ensure game over logic only runs once, even if state updates trigger re-renders
    const isGameOverHandled = useRef(false);

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
                setMessage({ text: `✅ "${word}" yn air dilys!`, autoDismiss: 3, isError: false });
                setSubmittedWords([...submittedWords, word]);
                setLastSubmittedWord(word);
            } else {

                setMessage({ text: `❌ "${word}" nid yw'n air dilys..`, autoDismiss: 3, isError: true });
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
                title: 'Ydych\'n siwr?',
                text: 'Byddwch yn colli un slot gair ac yn disodli\'r llythrennau a ddewiswyd.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ie, llythyrau cyfnewid',
                cancelButtonText: 'Canslo',
            }).then((result) => {
                if (result.isConfirmed) {
                    const word = inputLetters.join("");
                    replaceUsedLetters(word);
                    setInputLetters([]);
                    setClickedLetters([]);
                    setSubmittedWords([...submittedWords, 'WORD-SKIPPED']);
                    setLastSubmittedWord('WORD-SKIPPED');

                    Swal.fire('Gair wedi\'i hepgor!', 'Cafodd eich gair ei hepgor a chafodd llythrennau eu disodli.', 'success');
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

                    let highestWordBeatMessage = '';
                    let gameScoreBeatMessage = '';

                    // Check if stats data is available and contains the relevant info
                    if (updatedData && updatedData.stats) {
                        const { word_score_updated, word, word_score, game_score_updated, game_score } = updatedData.stats;

                        // Check if current word beat personal best
                        if (word_score_updated) {
                            highestWordBeatMessage = `<p>🚀 Newydd: Rydych chi newydd osod record bersonol newydd am y gair sgoer uchaf gyda'r gair "${word}" a sgôr o ${word_score}!</p>`;
                        } else {
                            // Display overall highest word if not beaten this turn
                            highestWordBeatMessage = `<p>Eich gair uchaf erioed yw "${word}" gyda sgôr o ${word_score}.</p>`;
                        }

                        // Check if current game score beat personal best
                        // `updatedData.game.score` is the final score for the completed game
                        if (game_score_updated) {
                            gameScoreBeatMessage = `<p>🏆 Newydd: Rydych chi newydd osod record gêm bersonol newydd gyda sgôr o ${game_score}!</p>`;
                        } else {
                            // Display overall highest game score if not beaten this turn
                            gameScoreBeatMessage = `<p>Eich sgôr gêm uchaf erioed yw ${game_score}.</p>`;
                        }
                    }

                    // Set the final game over message
                    setMessage({
                        text: (
                            <div>
                                <p>Gêm wedi gorffen!</p>
                                <p>🎉 Llongyfarchiadau! Rydych chi wedi cyflwyno'r 5 gair i gyd. Eich sgôr yw {score}.</p>
                                {highestWordBeatMessage && <p dangerouslySetInnerHTML={{ __html: highestWordBeatMessage }} />}
                                {gameScoreBeatMessage && <p dangerouslySetInnerHTML={{ __html: gameScoreBeatMessage }} />}

                                <SocialShare score={score} playerName={playerName} />
                            </div>
                        ),
                        autoDismiss: 0, // Don’t auto-dismiss this one
                        isError: false
                    });

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
        console.log("Time's up! Ending game...");
        setIsGameOver(true);
        setMessage(
            {
                text: (
                    <div>
                        <p>Gêm wedi gorffen!</p>
                        <p>Mae'n ddrwg gennym eich bod wedi rhedeg allan o amser, rydych wedi cyflwyno {submittedWords.length} geiriau. Eich sgôr yw {score}</p>

                        <SocialShare score={score} playerName={playerName} />

                    </div>
                ),
                autoDismiss: 0,
                isError:false});
        setEndTime(Date.now());
        updateGameStatus();
    };

    return (

        <div className="game-container">
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
                        <ShuffleIcon/>&nbsp;Siffrwd
                    </button>

                    {/* Delete Letters Button */}
                    <button className="delete" onClick={handleDelete} disabled={isGameOver}>⌫<span> Dileu Llythyr</span></button>

                    {/* Exchange Letters Button */}
                    <button className="exchange-button"
                            onClick={handleExchange}
                            disabled={isGameOver || (inputLetters.length === 0)}
                    >
                        <ReplaceIcon/>&nbsp;Cyfnewid
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
                    <button className="key special enter" onClick={handleEnter} disabled={isGameOver || isValidating}>{isValidating ? "Gwirio gair..." : "⏎ Anfon"}</button>
                </div>

            </div>

            {/* Display word validation message */}
            {message.text && <div className={`message-box message ${message.isError ? "error" : "success"} ${message.text ? "fade-in" : "fade-out"}`}>{message.text}</div>}

            {/* Display 5 word blocks for submitted words */}
            <div className="submitted-words">
                <h3>Eich geiriau a gyflwynwyd heddiw</h3>
                <div className="word-blocks">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className={`word-block ${submittedWords[index] === "WORD-SKIPPED" ? "skipped" : submittedWords[index] ? "filled" : "empty"}`}
                        >
                            {submittedWords[index] === "WORD-SKIPPED" ? "Cyfnewidiwyd" : submittedWords[index] || ""}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Panagram;

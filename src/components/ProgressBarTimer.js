import React, { useState, useEffect, useRef } from "react";
import * as Tone from 'tone';
import ProgressInfoBox from "./ProgressInfoBox"; // Import Tone.js as a module

const ProgressBarTimer = ({ totalTime = 300, isSplashHelpModalOpen, isGameOver, onTimeUp, gameScore, submittedWords }) => {
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const [isToneReady, setIsToneReady] = useState(false); // State to track Tone.js readiness
    const [isMuted, setIsMuted] = useState(false); // New state for mute functionality

    // New states for visual effects
    const [barColor, setBarColor] = useState('#3498db'); // Initial blue
    const [isPulsating, setIsPulsating] = useState(false);

    // Refs for Tone.js objects to persist across renders
    const tickSynthRef = useRef(null);
    const heartbeatSynthRef = useRef(null);
    const tickVolumeNodeRef = useRef(null);
    const heartbeatVolumeNodeRef = useRef(null);

    const tickEventIdRef = useRef(null);
    const heartbeatEventIdRef = useRef(null);

    const isTickingStartedRef = useRef(false);
    const isHeartbeatStartedRef = useRef(false);

    const lastKnownTickVolumeRef = useRef(-Infinity);
    const lastKnownHeartbeatVolumeRef = useRef(-Infinity);

    // Format the time into minutes and seconds
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Main timer logic: Decrements timeLeft every second
    useEffect(() => {
        if (timeLeft <= 0 || isSplashHelpModalOpen) {
            return;
        }

        const timer = setInterval(() => {
            if (!isGameOver) {
                setTimeLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearInterval(timer);
                        if (onTimeUp) onTimeUp();
                    }
                    return next;
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSplashHelpModalOpen, isGameOver, onTimeUp]);

    // Reset timeLeft and audio/visual states when a new game starts (isGameOver becomes false)
    useEffect(() => {
        if (!isGameOver && timeLeft !== totalTime) {
            console.log("ProgressBarTimer: Resetting timer for new game.");
            setTimeLeft(totalTime);
            setBarColor('#3498db'); // Reset color to initial blue
            setIsPulsating(false); // Stop pulsating

            // Clear and reset tick sound
            if (tickEventIdRef.current) {
                Tone.Transport.clear(tickEventIdRef.current);
                tickEventIdRef.current = null;
                isTickingStartedRef.current = false;
            }
            if (tickVolumeNodeRef.current) {
                tickVolumeNodeRef.current.volume.value = -Infinity;
            }

            // Clear and reset heartbeat sound
            if (heartbeatEventIdRef.current) {
                Tone.Transport.clear(heartbeatEventIdRef.current);
                heartbeatEventIdRef.current = null;
                isHeartbeatStartedRef.current = false;
            }
            if (heartbeatVolumeNodeRef.current) {
                heartbeatVolumeNodeRef.current.volume.value = -Infinity;
            }
        }
    }, [isGameOver, totalTime]); // Depend on isGameOver and totalTime

    // Tone.js initialization and cleanup: Runs once on component mount
    useEffect(() => {
        console.log("ProgressBarTimer: Initializing Tone.js components.");

        // Ticking sound (MetalSynth)
        tickSynthRef.current = new Tone.MetalSynth({
            frequency: 150,
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0.0,
                release: 0.1
            },
            harmonicity: 8,
            modulationIndex: 20,
            octaves: 0.5,
            resonance: 2000,
        });

        tickVolumeNodeRef.current = new Tone.Volume(-Infinity).toDestination();
        tickSynthRef.current.connect(tickVolumeNodeRef.current);

        // Heartbeat sound (MembraneSynth for a softer thump)
        heartbeatSynthRef.current = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 0.5,
            envelope: {
                attack: 0.001,
                decay: 0.3,
                sustain: 0.0,
                release: 0.1,
                attackCurve: "exponential"
            },
            constrict: 0.5
        });

        heartbeatVolumeNodeRef.current = new Tone.Volume(-Infinity).toDestination();
        heartbeatSynthRef.current.connect(heartbeatVolumeNodeRef.current);

        console.log("ProgressBarTimer: synthRef.current initialized:", tickSynthRef.current);
        console.log("ProgressBarTimer: heartbeatSynthRef.current initialized:", heartbeatSynthRef.current);
        console.log("ProgressBarTimer: tickVolumeNodeRef.current initialized:", tickVolumeNodeRef.current);
        console.log("ProgressBarTimer: heartbeatVolumeNodeRef.current initialized:", heartbeatVolumeNodeRef.current);

        // Function to attempt starting audio context and set readiness
        const setupAudioContext = async () => {
            if (Tone.context.state !== 'running') {
                try {
                    await Tone.start();
                    console.log("ProgressBarTimer: Tone.js audio context started on mount. State:", Tone.context.state);
                } catch (e) {
                    console.error("ProgressBarTimer: Could not start Tone.js audio context on mount:", e);
                }
            } else {
                console.log("ProgressBarTimer: Tone.js audio context already running on mount. State:", Tone.context.state);
            }
            setIsToneReady(true);
        };

        setupAudioContext(); // Call the setup function

        // Start Tone.Transport for precise scheduling of events
        Tone.Transport.start();

        // Cleanup function: Dispose Tone.js resources when the component unmounts
        return () => {
            console.log("ProgressBarTimer: Cleaning up Tone.js resources.");
            if (tickEventIdRef.current) {
                Tone.Transport.clear(tickEventIdRef.current);
                tickEventIdRef.current = null;
            }
            if (heartbeatEventIdRef.current) {
                Tone.Transport.clear(heartbeatEventIdRef.current);
                heartbeatEventIdRef.current = null;
            }
            if (tickSynthRef.current) {
                tickSynthRef.current.dispose();
                tickSynthRef.current = null;
            }
            if (heartbeatSynthRef.current) {
                heartbeatSynthRef.current.dispose();
                heartbeatSynthRef.current = null;
            }
            if (tickVolumeNodeRef.current) {
                tickVolumeNodeRef.current.dispose();
                tickVolumeNodeRef.current = null;
            }
            if (heartbeatVolumeNodeRef.current) {
                heartbeatVolumeNodeRef.current.dispose();
                heartbeatVolumeNodeRef.current = null;
            }
        };
    }, []);

    // Audio ticking and heartbeat logic based on timeLeft: Runs whenever timeLeft or game state changes
    useEffect(() => {
        if (!isToneReady || !tickSynthRef.current || !tickVolumeNodeRef.current || !heartbeatSynthRef.current || !heartbeatVolumeNodeRef.current) {
            console.log("ProgressBarTimer: Tone.js not ready or audio objects not initialized for ticking logic. isToneReady:", isToneReady);
            return;
        }

        if (isSplashHelpModalOpen || isGameOver || timeLeft <= 0) {
            if (tickEventIdRef.current) {
                Tone.Transport.clear(tickEventIdRef.current);
                tickEventIdRef.current = null;
                isTickingStartedRef.current = false;
            }
            if (heartbeatEventIdRef.current) {
                Tone.Transport.clear(heartbeatEventIdRef.current);
                heartbeatEventIdRef.current = null;
                isHeartbeatStartedRef.current = false;
            }
            if (tickVolumeNodeRef.current) {
                tickVolumeNodeRef.current.volume.value = -Infinity;
            }
            if (heartbeatVolumeNodeRef.current) {
                heartbeatVolumeNodeRef.current.volume.value = -Infinity;
            }
            console.log("ProgressBarTimer: All sounds muted due to game state or modal.");
            return;
        }

        // --- Ticking Sound Logic ---
        if (!isTickingStartedRef.current && Tone.context.state === 'running') {
            console.log("ProgressBarTimer: Attempting to start ticking immediately.");
            tickEventIdRef.current = Tone.Transport.scheduleRepeat((time) => {
                console.log("ProgressBarTimer: Playing tick sound.");
                tickSynthRef.current.triggerAttackRelease("C4", "8n", time);
            }, "1s");
            isTickingStartedRef.current = true;
            console.log("ProgressBarTimer: Ticking scheduled.");
        } else if (!isTickingStartedRef.current && Tone.context.state !== 'running') {
            console.log("ProgressBarTimer: Waiting for AudioContext to be 'running' before scheduling tick.");
        }

        // Volume calculation logic for TICK sound (constant volume)
        const tickConstantVol = -50; // Very quiet constant volume
        lastKnownTickVolumeRef.current = tickConstantVol;


        // --- Heartbeat Sound Logic ---
        if (timeLeft <= 30 && !isHeartbeatStartedRef.current && Tone.context.state === 'running') {
            console.log("ProgressBarTimer: Attempting to start heartbeat at 30 seconds.");
            heartbeatEventIdRef.current = Tone.Transport.scheduleRepeat((time) => {
                console.log("ProgressBarTimer: Playing heartbeat sound.");
                heartbeatSynthRef.current.triggerAttackRelease("C2", "8n", time); // First beat
                heartbeatSynthRef.current.triggerAttackRelease("C2", "8n", time + 0.15); // Second beat, 0.15s after first
            }, "0.75s");
            isHeartbeatStartedRef.current = true;
            console.log("ProgressBarTimer: Heartbeat scheduled.");
        } else if (timeLeft > 30 && isHeartbeatStartedRef.current) {
            Tone.Transport.clear(heartbeatEventIdRef.current);
            heartbeatEventIdRef.current = null;
            isHeartbeatStartedRef.current = false;
            if (heartbeatVolumeNodeRef.current) {
                heartbeatVolumeNodeRef.current.volume.value = -Infinity;
            }
        } else if (timeLeft <= 30 && !isHeartbeatStartedRef.current && Tone.context.state !== 'running') {
            console.log("ProgressBarTimer: Waiting for AudioContext to be 'running' before scheduling heartbeat.");
        }

        // Volume calculation logic for HEARTBEAT sound
        let currentHeartbeatVolume;
        const heartbeatInitialVol = -40; // Starts quietly at 30s
        const heartbeatFinalVol = -24;   // Gets louder as it approaches 0s (half the power of -18dB)

        if (timeLeft <= 30 && timeLeft > 0) {
            const normalizedTime = (30 - timeLeft) / 30;
            currentHeartbeatVolume = heartbeatInitialVol + (heartbeatFinalVol - heartbeatInitialVol) * normalizedTime;
        } else {
            currentHeartbeatVolume = -Infinity; // Muted if outside 0-30s range
        }

        lastKnownHeartbeatVolumeRef.current = currentHeartbeatVolume;

        // --- Apply Mute State to Both Sounds ---
        if (tickVolumeNodeRef.current) {
            tickVolumeNodeRef.current.volume.value = isMuted ? -Infinity : lastKnownTickVolumeRef.current;
        }
        if (heartbeatVolumeNodeRef.current) {
            heartbeatVolumeNodeRef.current.volume.value = isMuted ? -Infinity : lastKnownHeartbeatVolumeRef.current;
        }

        console.log(`ProgressBarTimer: Tick Vol: ${tickVolumeNodeRef.current?.volume.value.toFixed(2)}dB, Heartbeat Vol: ${heartbeatVolumeNodeRef.current?.volume.value.toFixed(2)}dB at ${timeLeft}s (Muted: ${isMuted}).`);

    }, [timeLeft, isSplashHelpModalOpen, isGameOver, isToneReady, isMuted]);

    // Effect for changing bar color and pulsation
    useEffect(() => {
        if (isGameOver || isSplashHelpModalOpen) {
            setIsPulsating(false);
            setBarColor('#3498db');
            return;
        }

        const minutesLeft = Math.ceil(timeLeft / 60);

        if (timeLeft <= 3) {
            setBarColor('#FF0000');
            setIsPulsating(true);
        } else if (minutesLeft === 1) {
            setBarColor('#FF0000');
            setIsPulsating(false);
        } else if (minutesLeft === 2) {
            setBarColor('#FFBF00');
            setIsPulsating(false);
        } else if (minutesLeft === 3) {
            setBarColor('#f2d21d');
            setIsPulsating(false);
        } else if (minutesLeft === 4) {
            setBarColor('#87CEEB');
            setIsPulsating(false);
        } else {
            setBarColor('#3498db');
            setIsPulsating(false);
        }
    }, [timeLeft, isGameOver, isSplashHelpModalOpen]);

    // Calculate the width of the progress bar overlay
    const progressWidth = (timeLeft / totalTime) * 100;

    return (
        <div className="progressbar-timer">
            <div className="timer-controls">
                <div className="sound-switch-container"> {/* New container for the slider */}
                    <span className="sound-label off-label">OFF</span>
                    <button className={`sound-switch ${isMuted ? 'off' : 'on'}`} onClick={() => setIsMuted(prev => !prev)}>
                        <div className="sound-slider-thumb">
                            {isMuted ? '🔇' : '🔊'}
                        </div>
                    </button>
                    <span className="sound-label on-label">ON</span>
                </div>
                {/*<p style={{ fontSize: "18px" }}>{formatTime(timeLeft)}</p>*/}
            </div>
            <ProgressInfoBox
                gameScore={gameScore}
                formattedTime={formatTime(timeLeft)}
                submittedWordCount={submittedWords.length}
            />
            <div className="progressbar-timer__bar">
                <div
                    className={`progressbar-timer__overlay ${isPulsating ? 'pulsating-red' : ''}`}
                    style={{
                        width: `${progressWidth}%`,
                        backgroundColor: barColor
                    }}
                ></div>
            </div>
            {/* Add CSS for pulsation and slider */}
            <style jsx>{`
                /* Pulsation Animation */
                @keyframes pulseRed {
                    0% {
                        box-shadow: 0 0 5px ${barColor}, 0 0 10px ${barColor};
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 15px ${barColor}, 0 0 30px ${barColor};
                        transform: scale(1.02);
                    }
                    100% {
                        box-shadow: 0 0 5px ${barColor}, 0 0 10px ${barColor};
                        transform: scale(1);
                    }
                }

                .pulsating-red {
                    animation: pulseRed 1s infinite alternate;
                }

                .progressbar-timer__overlay {
                    transition: background-color 0.5s ease-in-out; /* Smooth color transitions */
                }

                /* Slider Switch Styling */
                .sound-switch-container {
                    display: flex;
                    align-items: center;
                    gap: 5px; /* Space between labels and switch */
                }

                .sound-label {
                    font-size: 0.8em;
                    color: #555;
                    font-weight: bold;
                    min-width: 20px; /* Ensure labels don't collapse */
                    text-align: center;
                }

                .sound-switch {
                    position: relative;
                    width: 60px; /* Width of the entire switch */
                    height: 30px; /* Height of the entire switch */
                    background-color: #ccc; /* Default off background */
                    border-radius: 15px; /* Half of height for rounded ends */
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    padding: 0; /* Remove default button padding */
                    display: flex; /* For centering the thumb */
                    align-items: center;
                    overflow: hidden; /* Hide thumb overflow during transition */
                }

                .sound-switch.on {
                    background-color: #28a745; /* Green for on */
                }

                .sound-switch.off {
                    background-color: #dc3545; /* Red for off */
                }

                .sound-slider-thumb {
                    position: absolute;
                    width: 28px; /* Slightly less than half of switch width */
                    height: 28px; /* Slightly less than switch height */
                    background-color: #fff;
                    border-radius: 50%; /* Make it a circle */
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    transition: transform 0.3s ease;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.2em; /* Size of the emoji icon */
                }

                .sound-switch.on .sound-slider-thumb {
                    transform: translateX(calc(100% - 2px)); /* Move to the right, adjust 2px for padding */
                }

                .sound-switch.off .sound-slider-thumb {
                    transform: translateX(2px); /* Move to the left, adjust 2px for padding */
                }
            `}</style>
        </div>
    );
};

export default ProgressBarTimer;

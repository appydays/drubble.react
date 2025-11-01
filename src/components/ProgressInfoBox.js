import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

// This component displays the score, time left, and word progress.
const ProgressInfoBox = ({ gameScore, formattedTime, submittedWordCount }) => {
    // Determine the color class for the word progress based on completion
    const wordProgressClass = submittedWordCount >= 5 ? 'word-progress-done' : 'word-progress-in-progress';

    return (
        <div className="info-bar">
            {/* Score Display */}
            <div className="info-item">
                <div className="score-text">
                    {gameScore.toLocaleString()}
                </div>
                <div className="label-text">
                    Score
                </div>
            </div>

            {/* Time Left Display */}
            <div className="info-item center-item">
                {/* Clock Icon */}
                <FontAwesomeIcon icon={faClock} className="clock-icon" />
                <div className="time-text">
                    {formattedTime}
                </div>
                {/*<div className="label-text">*/}
                {/*    Time Left*/}
                {/*</div>*/}
            </div>

            {/* Word Progress Display */}
            <div className="info-item">
                <div className={`word-text ${wordProgressClass}`}>
                    {submittedWordCount} / 5
                </div>
                <div className="label-text">
                    Words
                </div>
            </div>

            <style jsx="true">{`
                /* Container for the entire bar */
                .info-bar {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    width: 100%;
                    padding: 8px; /* p-2 */
                    //border-top-left-radius: 12px;
                    //border-top-right-radius: 12px; /* rounded-t-xl */
                    //box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); /* shadow-lg */
                    //border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
                }

                /* Container for each piece of info (Score, Time, Words) */
                .info-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 8px; /* p-2 */
                    text-align: center;
                }

                .center-item {
                    //border-left: 1px solid #d1d5db; /* border-x border-gray-300 */
                    //border-right: 1px solid #d1d5db;
                    width: 33.333%; /* w-1/3 */
                }

                /* Score Text Style */
                .score-text {
                    font-size: 1.5rem; /* text-2xl */
                    font-weight: 800; /* font-extrabold */
                    color: #27ae60; /* text-blue-600 */
                    line-height: 1; /* leading-none */
                }

                /* Time Text Style */
                .time-text {
                    font-size: 1.5rem; /* text-2xl */
                    font-weight: 700; /* font-bold */
                    color: #1f2937; /* text-gray-800 */
                    line-height: 1; /* leading-none */
                }

                /* Word Progress Text Style */
                .word-text {
                    font-size: 1.5rem; /* text-2xl */
                    font-weight: 800; /* font-extrabold */
                    line-height: 1; /* leading-none */
                }

                .word-progress-in-progress {
                    color: #27ae60; /* text-yellow-500 */
                }

                .word-progress-done {
                    color: #10b981; /* text-green-500 */
                }
                
                /* Icon Style */
                .clock-icon {
                    font-size: 1.25rem; /* text-xl */
                    color: #6b7280; //#4f46e5; /* text-indigo-600 */
                    margin-bottom: 4px; /* mb-1 */
                }

                /* Label Text Style (Score, Time Left, Words) */
                .label-text {
                    font-size: 0.75rem; /* text-xs */
                    text-transform: uppercase; /* uppercase */
                    font-weight: 500; /* font-medium */
                    color: #000; /* text-gray-500 */
                    margin-top: 4px; /* mt-1 */
                }

                /* Dark mode simulation (if needed, adjust global context) */
                /* Assuming a 'dark-mode' class could be applied to a parent */
                .dark-mode .info-bar {
                    background-color: #1f2937; /* dark:bg-gray-800 */
                    border-bottom-color: #374151; /* dark:border-gray-700 */
                }
                .dark-mode .score-text {
                    color: #818cf8; /* dark:text-blue-400 */
                }
                .dark-mode .time-text {
                    color: #e5e7eb; /* dark:text-gray-200 */
                }
                .dark-mode .label-text {
                    color: #9ca3af; /* dark:text-gray-400 */
                }
            `}</style>
        </div>
    );
};

export default ProgressInfoBox;
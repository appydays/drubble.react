import React, { useState, useEffect } from 'react';
import Modal from './Modal';

function SplashHelpModal({ isOpen, onClose }) {

    return (
        <Modal className="help" isOpen={isOpen} onClose={onClose}>
            <h2>How to play Drubble</h2>

            <div className="help-content scroll-fade">
                <div className="help-content__wrapper">
                    <div>
                        <div>
                            <span>Create the longest word possible from the 9 letters available. Letters are randomly selected and change daily, e.g.</span><br/>
                            <div className="tile-container daily-letters">
                                <div className="tile "><span className="front">A</span><span className="back">A</span>
                                </div>
                                <div className="tile "><span className="front">U</span><span className="back">U</span>
                                </div>
                                <div className="tile "><span className="front">I</span><span className="back">I</span>
                                </div>
                                <div className="tile "><span className="front">Q</span><span className="back">Q</span>
                                </div>
                                <div className="tile "><span className="front">M</span><span className="back">M</span>
                                </div>
                                <div className="tile "><span className="front">L</span><span className="back">L</span>
                                </div>
                                <div className="tile "><span className="front">G</span><span className="back">G</span>
                                </div>
                                <div className="tile "><span className="front">Z</span><span className="back">Z</span>
                                </div>
                                <div className="tile "><span className="front">G</span><span className="back">G</span>
                                </div>
                            </div>
                            <ul>
                                <li>Click on the letters to spell out a word, selected letters will be disabled and will
                                    appear in the word row.
                                </li>
                                <li>Enter the word when you are ready, or use the Delete button ⌫ to undo your selected
                                    letters.
                                </li>
                                <li>Valid words will be added to you submitted word list.</li>
                                <li>Invalid words will be rejected.</li>
                                <li>Score points for a valid word, but get better scores by using the less frequent
                                    letters if available , such as Q,X or Z.
                                </li>
                            </ul>
                            <ul>
                                <li>Use the Shuffle button <button className="shuffle-button">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                                         viewBox="0 0 512 512"
                                         height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"></path>
                                    </svg>
                                    &nbsp;Shuffle</button> to reorder the letters
                                </li>
                                <li>Use the Exchange button <button className="exchange-button">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                                         viewBox="0 0 512 512"
                                         height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"></path>
                                    </svg>
                                    &nbsp;Exchange</button> to swap letters out - select the letters into the word boxes
                                    and click exchange. <br/>
                                    <br/><b>*Warning</b> exchanging letters will cost you a word slot reducing your
                                    ability to score points!

                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <p>There are 5 rounds and you will have 5 minutes to submit 5 words.</p>
                        <p>After each word is entered the letters used will be replaced by the equivalent type, vowel or consonant.<br/></p>
                    </div>

                    <div>
                        <p>You don't have to create an account to play, however, if you are not signed in - your score will not be added to the leaderboard!</p>
                        <p>Registering to play will enable you to play against your friends and family, see if you can beat them or just try to get onto the top 20!</p>
                    </div>
                    <div>Thank you ... and Good Luck!</div>
                    <div><br/><br/></div>
                </div>
            </div>

        </Modal>
    );
}

export default SplashHelpModal;
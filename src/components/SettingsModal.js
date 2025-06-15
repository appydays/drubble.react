import React, { useState } from 'react';
import Modal from './Modal';
import ThemeToggle from "./atoms/ThemeToggle";
import ContrastToggle from "./atoms/ContrastToggle";
import FeedbackButton from "./atoms/FeedbackButton";
import FeedbackModal from "./FeedbackModal"; // <- import it

function SettingsModal({ isOpen, onClose }) {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    return (
        <>
            <Modal className="settings" isOpen={isOpen} onClose={onClose}>
                <h2>Gosodiadau</h2>
                <div className="settings-container">
                    <div className="setting-item">
                        <div>Theme (Light / Dark)</div>
                        <ThemeToggle/>

                    </div>
                    <div className="setting-item">
                        <div>High Contrast</div>
                        <ContrastToggle/>
                    </div>
                    <hr/>
                    <div className="feedback-button-container">
                        <p>If you have a problem and want to report a bug, or if you have any feedback on what you like or
                            don't like, or have something you'd like to see on Drubble, We'd love to hear from you.</p>
                        <FeedbackButton onClick={() => {
                            setIsFeedbackModalOpen(true);
                            onClose();
                        }}/>
                    </div>
                </div>
            </Modal>

            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />
        </>
    );
}

export default SettingsModal;

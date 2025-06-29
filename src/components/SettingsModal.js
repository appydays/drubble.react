import React, { useState } from 'react';
import Modal from './Modal'; // This is your generic Modal component
import ThemeToggle from "./atoms/ThemeToggle";
import ContrastToggle from "./atoms/ContrastToggle";
import FeedbackButton from "./atoms/FeedbackButton";
import FeedbackModal from "./FeedbackModal"; // Keep this import
import { useTranslation } from 'react-i18next';

function SettingsModal({ isOpen, onClose }) {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const { t } = useTranslation();

    console.log("SettingsModal rendered. isFeedbackModalOpen:", isFeedbackModalOpen); // Keep for debugging

    return (
        // SettingsModal uses your generic Modal component
        <Modal className="settings" isOpen={isOpen} onClose={onClose}>
            {/* Conditional rendering for the main Settings content or the Feedback content */}
            {!isFeedbackModalOpen ? ( // Only show settings content if feedback modal is not open
                <>
                    <h2>{t('settings.title')}</h2>
                    <div className="settings-container">
                        <div className="setting-item">
                            <div>{t('settings.labels.theme')}</div>
                            <ThemeToggle/>
                        </div>
                        <div className="setting-item">
                            <div>{t('settings.labels.contrast')}</div>
                            <ContrastToggle/>
                        </div>
                        <hr/>
                        <div className="feedback-button-container">
                            <p>{t('settings.feedback.text', { sitename : process.env.REACT_APP_SITE_NAME})}</p>
                            <FeedbackButton onClick={() => {
                                console.log("FeedbackButton clicked! Opening FeedbackModal."); // Keep for debugging
                                setIsFeedbackModalOpen(true);
                                // IMPORTANT: Do NOT call onClose() for SettingsModal here anymore
                                // SettingsModal will stay open, FeedbackModal will render on top.
                            }}/>
                        </div>
                    </div>
                </>
            ) : null} {/* If isFeedbackModalOpen is true, render null for settings content */}

            {/* Render FeedbackModal directly within the SettingsModal's children */}
            {/* The FeedbackModal will now use the same Modal component as its wrapper */}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => {
                    console.log("FeedbackModal onClose callback invoked. Closing FeedbackModal."); // Keep for debugging
                    setIsFeedbackModalOpen(false);
                    // If you wanted SettingsModal to close *after* FeedbackModal closes,
                    // you'd call onClose() here: onClose();
                }}
            />
        </Modal>
    );
}

export default SettingsModal;
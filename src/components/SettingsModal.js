import React, { useState } from 'react';
import Modal from './Modal';
import ThemeToggle from "./atoms/ThemeToggle";
import ContrastToggle from "./atoms/ContrastToggle";
import FeedbackButton from "./atoms/FeedbackButton";
import FeedbackModal from "./FeedbackModal"; // <- import it
import { useTranslation } from 'react-i18next';

function SettingsModal({ isOpen, onClose }) {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const { t } = useTranslation();

    return (
        <>
            <Modal className="settings" isOpen={isOpen} onClose={onClose}>
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

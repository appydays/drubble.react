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
                        <div>Thema (Golau / Tywyll)</div>
                        <ThemeToggle/>

                    </div>
                    <div className="setting-item">
                        <div>Cyferbyniad Uchel</div>
                        <ContrastToggle/>
                    </div>
                    <hr/>
                    <div className="feedback-button-container">
                        <p>Os oes gennych chi broblem ac eisiau riportio byg, neu os oes gennych chi unrhyw adborth ar yr hyn rydych chi'n ei hoffi neu
                            peidiwch â rhoi dolen ar ScramAir, na chael rhywbeth yr hoffech chi ei weld yn ScramAir, byddwn i wrth fy modd
                            i glywed oddi wrthych.</p>
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

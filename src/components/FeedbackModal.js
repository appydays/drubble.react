import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

function FeedbackModal({ isOpen, onClose }) {
    const [feedback, setFeedback] = useState("");
    const [errors, setErrors] = useState({});

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';

    const playerId = localStorage.getItem("playerId");

    const { t } = useTranslation();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrors({}); // Always clear errors at the beginning

        // Frontend Validation for Feedback
        const newErrors = {};

        if (!feedback.trim()) {
            newErrors.feedback = t('feedback-modal.feedback-required'); // Feedback is required.
        } else {
            
            if (!/^[a-zA-Z0-9\s.,!?'"()\-&]+$/.test(feedback)) {
                newErrors.feedback = t('feedback-modal.feedback-format');
            }
        }


        // Check if any frontend errors exist
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // Stop the submission if there are frontend errors
        }

        try {

            // reCAPTCHA token
            const token = await window.grecaptcha.execute("6LfrxB0rAAAAAK8bda-2GoskR_F7ALS9DmgZ2kdb", { action: "feedback" });

            // Submit feedback
            const response = await fetch(apiUrl + '/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ player_id: playerId, feedback: feedback, recaptcha_token: token }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setFeedback("");
                setErrors({});
                onClose();
            } else {
                alert(data.message || t('feedback-modal.response.error-default'));
            }
        } catch (error) {
            alert(t('feedback-modal.response.error-unexpected') + error.message);
        }
    };

    return (
        <Modal className="feedback-form" isOpen={isOpen} onClose={onClose}>
            <div>
                <h2>{t('feedback-modal.form.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        <span>{t('feedback-modal.form.feedback.label')}</span>
                        <textarea
                            name="feedback"
                            rows="15"
                            placeholder={t('feedback-modal.form.feedback.placeholder')}
                            className={`${errors.feedback ? "error" : ""}`}
                            onChange={(e) => setFeedback(e.target.value)}
                        >{feedback}</textarea>
                    </label>
                    {errors.feedback && <span className="error">{errors.feedback}</span>}
                    <button className="submit" type="submit">{t('feedback-modal.form.submit')}</button>
                </form>
            </div>
        </Modal>
    );
}

export default FeedbackModal;

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import useApiRequest from './useApiRequest';

function FeedbackModal({ isOpen, onClose }) {
    // --- ALL REACT HOOKS MUST BE CALLED HERE, AT THE TOP LEVEL ---
    const [feedback, setFeedback] = useState("");
    const [errors, setErrors] = useState({});

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';
    const { data, loading, error, makeRequest } = useApiRequest(apiUrl);

    const { t,i18n } = useTranslation();

    // The useEffect hook also goes here, before any conditional returns
    useEffect(() => {
        // This effect will run every time isOpen changes, even when it's false,
        // but its content is only relevant when isOpen is true.
        if (isOpen) {
            console.log("FeedbackModal useEffect (onOpen) fired.");
            if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') {
                console.log("reCAPTCHA script seems loaded and ready on modal open.");
            } else {
                console.error("reCAPTCHA script is NOT yet loaded or window.grecaptcha is undefined on modal open.");
                console.log("Current window.grecaptcha:", window.grecaptcha);
            }
        }
    }, [isOpen]);
    // --- END OF REACT HOOK CALLS ---


    // Now, after all hooks are called unconditionally, you can have your conditional return.
    console.log("FeedbackModal function started executing. isOpen prop received:", isOpen); // This console.log is fine here.
    if (!isOpen) {
        console.log("FeedbackModal: isOpen is false, returning null (not rendering).");
        return null;
    }

    // If we reach here, it means isOpen is true and the component should attempt to render.
    console.log("FeedbackModal: isOpen is TRUE, proceeding to render content."); // This console.log is fine here.

    const playerId = localStorage.getItem("playerId");


    const handleSubmit = async (event) => {
        console.log("handleSubmit called!"); // This console.log is fine here.
        event.preventDefault();

        setErrors({});

        // Frontend Validation for Feedback
        const newErrors = {};
        if (!feedback.trim()) {
            newErrors.feedback = t('feedback-modal.feedback-required');
        } else {
            if (!/^[a-zA-Z0-9\s.,!?'"()\-&]+$/.test(feedback)) {
                newErrors.feedback = t('feedback-modal.feedback-format');
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            console.log("Frontend validation errors:", newErrors);
            return;
        }

        try {
            console.log("Attempting reCAPTCHA execution...");
            if (!window.grecaptcha || typeof window.grecaptcha.execute !== 'function') {
                console.error("reCAPTCHA is still not ready right before execution. Aborting.");
                Swal.fire(t('auth.form.recaptcha.error-title'), t('feedback-modal.response.error-unexpected') + " reCAPTCHA not loaded.", 'error');
                return;
            }

            const token = await window.grecaptcha.execute("6LfrxB0rAAAAAK8bda-2GoskR_F7ALS9DmgZ2kdb", { action: "feedback" });
            console.log("reCAPTCHA token obtained:", token ? "YES" : "NO");

            const data = await makeRequest('/feedback','POST', {
                player_id: playerId,
                feedback: feedback,
                recaptcha_token: token
            });

            if (data.success) {
                Swal.fire(t('feedback-modal.form.response.success'), data.message, 'success');
                setFeedback("");
                setErrors({});
                onClose();
            } else {
                Swal.fire(t('feedback-modal.form.response.error'), data.message, 'error');
            }

        } catch (error) {
            console.error("Unexpected error during feedback submission:", error);
            Swal.fire(t('feedback-modal.form.response.error'), t('feedback-modal.response.error-unexpected') + error.message, 'error');

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
                            value={feedback}
                        ></textarea>
                    </label>
                    {errors.feedback && <span className="error">{errors.feedback}</span>}
                    <button className="submit" type="submit">{t('feedback-modal.form.submit')}</button>
                </form>
            </div>
        </Modal>
    );
}

export default FeedbackModal;
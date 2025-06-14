import React, { useState } from 'react';
import Modal from './Modal';

function FeedbackModal({ isOpen, onClose }) {
    const [feedback, setFeedback] = useState("");
    const [errors, setErrors] = useState({});

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';

    const playerId = localStorage.getItem("playerId");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrors({}); // Always clear errors at the beginning

        // Frontend Validation for Feedback
        const newErrors = {};

        if (!feedback.trim()) {
            newErrors.feedback = "Mae angen adborth."; // Feedback is required.
        } else {
            // Option 1: Disallow < and > characters
            // This is a simple regex that checks if the string contains either '<' or '>'.
            // If it does, it's considered invalid for "standard text".
            if (/<|>/.test(feedback)) {
                newErrors.feedback = "Ni chaniateir nodau fel '<' neu '>'."; // Characters like '<' or '>' are not allowed.
            }

            // Option 2 (More Restrictive): Allow only alphanumeric, common punctuation, and spaces
            // If you want to be more strict, you can define a whitelist of allowed characters.
            // This regex allows letters, numbers, spaces, and common punctuation.
            // Adjust the allowed punctuation inside the [] as needed.
            // Example: /^[a-zA-Z0-9\s.,!?'"()\-&]+$/
            // if (!/^[a-zA-Z0-9\s.,!?'"()\-&]+$/.test(feedback)) {
            //     newErrors.feedback = "Dim ond testun safonol sy'n cael ei dderbyn."; // Only standard text is accepted.
            // }
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
                alert(data.message || 'Methodd yr adborth.');
            }
        } catch (error) {
            alert('Digwyddodd gwall: ' + error.message);
        }
    };

    return (
        <Modal className="feedback-form" isOpen={isOpen} onClose={onClose}>
            <div>
                <h2>Adborth</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        <span>Adborth</span>
                        <textarea
                            name="feedback"
                            rows="15"
                            placeholder="Rhowch adborth, gan gynnwys gwelliannau, syniadau a materion"
                            className={`${errors.feedback ? "error" : ""}`}
                            onChange={(e) => setFeedback(e.target.value)}
                        >{feedback}</textarea>
                    </label>
                    {errors.feedback && <span className="error">{errors.feedback}</span>}
                    <button className="submit" type="submit">Cyflwyno Adborth</button>
                </form>
            </div>
        </Modal>
    );
}

export default FeedbackModal;

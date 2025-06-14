import React from 'react';

function FeedbackButton({ onClick }) {
    return (
        <button className="key special feedback"
                title="Feedback"
                onClick={onClick}>
            Rhoi Adborth
        </button>
    );
}

export default FeedbackButton;

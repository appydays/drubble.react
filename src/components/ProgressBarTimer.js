import React, { useState, useEffect } from "react";

const ProgressBarTimer = ({ totalTime = 300, isSplashHelpModalOpen, isGameOver, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(totalTime);

    // Format the time into minutes and seconds
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    useEffect(() => {
        if (timeLeft <= 0 || isSplashHelpModalOpen) return;
        const timer = setInterval(() => {
            if (!isGameOver) {
                setTimeLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearInterval(timer);
                        if (onTimeUp) onTimeUp(); // Trigger when time runs out
                    }
                    return next;
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isSplashHelpModalOpen, isGameOver, onTimeUp]);

    const progressWidth = (timeLeft / totalTime) * 100;

    return (
        <div className="progressbar-timer">
            <p style={{ fontSize: "18px" }}>{formatTime(timeLeft)}</p>
            <div className="progressbar-timer__bar">
                <div className="progressbar-timer__overlay"
                    style={{
                        width: `${progressWidth}%`
                    }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBarTimer;
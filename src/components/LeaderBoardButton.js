import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
// import './LeaderBoardButton.css';

function LeaderboardButton({setIsLeaderboardModalOpen}) {
    return (
        <button className="leaderboard"
                title="Leaderboard"
                onClick={() => setIsLeaderboardModalOpen(true)}>
            <FontAwesomeIcon icon={faTrophy} />
        </button>
    );
}

export default LeaderboardButton;
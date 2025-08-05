import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
// import './LeaderBoardButton.css';

function LeaderboardButton({setIsLeaderboardModalOpen}) {
    return (
        <button className="leaderboard"
                title="Leaderboard"
                onClick={() => setIsLeaderboardModalOpen(true)}>
            <FontAwesomeIcon icon={faGlobe} />
        </button>
    );
}

export default LeaderboardButton;
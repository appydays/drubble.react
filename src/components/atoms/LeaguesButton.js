import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable } from '@fortawesome/free-solid-svg-icons';

function LeaguesButton({setIsLeaguesModalOpen}) {
    return (
        <button className="leagues-button"
                title="Leaderboard"
                onClick={() => setIsLeaguesModalOpen(true)}>
            <FontAwesomeIcon icon={faTable} size="2x" color="#333"/>
        </button>
    );
}

export default LeaguesButton;
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
// import './LeaderBoardButton.css';

function SettingsButton({setIsSettingsModalOpen}) {
    return (
        <button className="settings"
                title="Settings"
                onClick={() => setIsSettingsModalOpen(true)}>
            <FontAwesomeIcon icon={faCog} />
        </button>
    );
}

export default SettingsButton;